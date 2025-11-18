'use client'

import { forwardRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import CommentThread from './CommentThread'
import CommentForm from './CommentForm'
import { Comment, CommentCategory, SessionUser } from '@/types'

interface CommentsPaneProps {
  prdId: number
  comments: Comment[]
  currentUser: SessionUser
  selectedText?: string
  selectedSection?: string | null
  scrollPosition?: number
  activeCommentId?: number | null
  visibleSections?: string[]
  visibleCommentIds?: number[]
  syncEnabled?: boolean
  focusedCommentId?: number | null
  onCommentClick?: (comment: Comment) => void
  onCommentSubmit?: () => void
  onCloseFocus?: () => void
}

const CommentsPane = forwardRef<HTMLDivElement, CommentsPaneProps>(
  ({
    prdId,
    comments,
    currentUser,
    selectedText,
    selectedSection,
    scrollPosition,
    activeCommentId,
    visibleSections = [],
    visibleCommentIds = [],
    syncEnabled = false,
    focusedCommentId = null,
    onCommentClick,
    onCommentSubmit,
    onCloseFocus,
  }, ref) => {
    const router = useRouter()
    const [filter, setFilter] = useState<CommentCategory | 'all'>('all')
    const [showForm, setShowForm] = useState(false)

    // If in focused mode, show only the focused comment and its replies
    if (focusedCommentId !== null) {
      const focusedComment = comments.find(c => c.id === focusedCommentId)
      var filteredComments = focusedComment
        ? [focusedComment, ...comments.filter(c => c.parentId === focusedCommentId)]
        : []
    } else {
      // Filter by category first
      var filteredComments = filter === 'all'
        ? comments
        : comments.filter(c => c.category === filter)

      // Then filter by visible phrases/sections if sync is enabled
      if (syncEnabled) {
        filteredComments = filteredComments.filter(comment => {
          // Priority 1: If comment has selectedText, check phrase visibility
          if (comment.selectedText && comment.selectedText.trim().length > 0) {
            return visibleCommentIds.includes(comment.id)
          }

          // Priority 2: Fall back to section-based filtering
          if (comment.sectionId) {
            return visibleSections.includes(comment.sectionId)
          }

          // Priority 3: Comments without selectedText or sectionId always show
          return true
        })
      }
    }

    const handleCommentSubmit = async (content: string, category: CommentCategory) => {
      try {
        const res = await fetch(`/api/prds/${prdId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            category,
            selectedText,
            sectionId: selectedSection,
            scrollPosition,
          }),
        })

        const data = await res.json()

        if (data.success) {
          toast.success('Comment added!')
          setShowForm(false)
          router.refresh()
          onCommentSubmit?.()
        } else {
          toast.error(data.error || 'Failed to add comment')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    }

    const getCategoryCount = (category: CommentCategory) => {
      return comments.filter(c => c.category === category).length
    }

    return (
      <div ref={ref} className="w-2/5 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {focusedCommentId ? 'Focused Comment' : `Comments (${comments.length})`}
            </h2>
            {focusedCommentId ? (
              <button
                onClick={onCloseFocus}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Focus
              </button>
            ) : (
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary text-sm"
              >
                {showForm ? 'Cancel' : '+ New Comment'}
              </button>
            )}
          </div>

          {/* Filter tabs - hidden in focused mode */}
          {!focusedCommentId && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('red')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'red'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                🔴 Blockers ({getCategoryCount('red')})
              </button>
              <button
                onClick={() => setFilter('yellow')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'yellow'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                🟡 Discuss ({getCategoryCount('yellow')})
              </button>
              <button
                onClick={() => setFilter('green')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'green'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                🟢 Questions ({getCategoryCount('green')})
              </button>
            </div>
          )}
        </div>

        {/* New comment form */}
        {showForm && (
          <div className="bg-white border-b border-gray-200 p-4">
            {selectedText && (
              <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm">
                <p className="font-medium text-blue-900 mb-1">Selected text:</p>
                <p className="text-blue-700 italic">"{selectedText}"</p>
              </div>
            )}
            <CommentForm
              onSubmit={handleCommentSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No {filter !== 'all' && filter} comments yet.</p>
              <p className="text-sm mt-2">Be the first to start the discussion!</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                prdId={prdId}
                currentUser={currentUser}
                isActive={activeCommentId === comment.id}
                onClick={onCommentClick}
              />
            ))
          )}
        </div>
      </div>
    )
  }
)

CommentsPane.displayName = 'CommentsPane'

export default CommentsPane
