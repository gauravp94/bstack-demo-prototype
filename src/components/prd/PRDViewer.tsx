'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import MarkdownPane from './MarkdownPane'
import CommentsPane from './CommentsPane'
import { SessionUser, Comment } from '@/types'
import { useSyncScroll } from '@/hooks/useSyncScroll'

interface PRDViewerProps {
  prd: any
  user: SessionUser
  hasApproved: boolean
  lastReadVersion: number
}

interface HighlightRange {
  text: string
  sectionId: string | null
}

export default function PRDViewer({ prd, user, hasApproved, lastReadVersion }: PRDViewerProps) {
  const router = useRouter()
  const markdownRef = useRef<HTMLDivElement>(null)
  const commentsRef = useRef<HTMLDivElement>(null)

  const [selectedText, setSelectedText] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [highlightRange, setHighlightRange] = useState<HighlightRange | null>(null)
  const [scrollPosition, setScrollPosition] = useState<number>(0)
  const [focusedCommentId, setFocusedCommentId] = useState<number | null>(null)

  const { activeCommentId, visibleSections, visibleCommentIds, scrollToComment, scrollToSection } = useSyncScroll({
    markdownRef,
    commentsRef,
    comments: prd.comments,
    enabled: syncEnabled,
  })

  const commentCounts = prd.comments.reduce(
    (acc: any, comment: Comment) => {
      acc[comment.category]++
      acc.total++
      return acc
    },
    { red: 0, yellow: 0, green: 0, total: 0 }
  )

  const canApprove = commentCounts.red === 0 && commentCounts.yellow === 0 && !hasApproved

  const handleApprove = async () => {
    if (!canApprove) {
      toast.error('Cannot approve: resolve all red and yellow comments first')
      return
    }

    try {
      const res = await fetch(`/api/prds/${prd.id}/approve`, {
        method: 'POST',
      })

      const data = await res.json()

      if (data.success) {
        toast.success('PRD approved successfully!')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to approve')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleTextSelect = (text: string, sectionId: string | null) => {
    setSelectedText(text)
    setSelectedSection(sectionId)

    // Capture scroll position when selecting text
    if (markdownRef.current) {
      setScrollPosition(markdownRef.current.scrollTop)
    }

    // Set highlight range to persist selection
    if (text) {
      setHighlightRange({ text, sectionId })
    }
  }

  const handleCommentClick = (comment: Comment) => {
    if (comment.sectionId) {
      scrollToSection(comment.sectionId)
    } else if (comment.scrollPosition && markdownRef.current) {
      // Scroll to exact position
      markdownRef.current.scrollTo({
        top: comment.scrollPosition,
        behavior: 'smooth',
      })
    }
  }

  const handleCommentSubmit = () => {
    // Clear highlight after comment is submitted
    setHighlightRange(null)
    setSelectedText('')
    setSelectedSection(null)
  }

  const handleHighlightClick = (commentId: number) => {
    // Set focused comment and scroll to it
    setFocusedCommentId(commentId)
    scrollToComment(commentId)

    // Find the comment and scroll markdown pane to its position
    const comment = prd.comments.find((c: Comment) => c.id === commentId)
    if (comment) {
      if (comment.sectionId) {
        scrollToSection(comment.sectionId)
      } else if (comment.scrollPosition && markdownRef.current) {
        markdownRef.current.scrollTo({
          top: comment.scrollPosition,
          behavior: 'smooth',
        })
      }
    }
  }

  const hasUpdates = prd.version > lastReadVersion

  return (
    <div className="fixed inset-0 top-[73px] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{prd.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                <span>Version {prd.version}</span>
                <span>•</span>
                <span>by {prd.creator.name}</span>
                <span>•</span>
                <span>{new Date(prd.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Toggle */}
            <button
              onClick={() => setSyncEnabled(!syncEnabled)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                syncEnabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={syncEnabled ? 'Disable synchronized scrolling' : 'Enable synchronized scrolling'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncEnabled ? 'Sync ON' : 'Sync OFF'}
            </button>

            {hasUpdates && (
              <button
                onClick={() => setShowDiff(!showDiff)}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                {showDiff ? 'Hide' : 'Show'} Changes (v{lastReadVersion} → v{prd.version})
              </button>
            )}

            {hasApproved ? (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                ✓ You approved this PRD
              </div>
            ) : (
              <button
                onClick={handleApprove}
                disabled={!canApprove}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  canApprove
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={!canApprove ? 'Resolve all red and yellow comments first' : 'Approve this PRD'}
              >
                Approve PRD
              </button>
            )}
          </div>
        </div>

        {/* Comment counts */}
        <div className="flex gap-3 mt-3">
          {commentCounts.red > 0 && (
            <span className="badge-red">
              🔴 {commentCounts.red} Blocker{commentCounts.red !== 1 ? 's' : ''}
            </span>
          )}
          {commentCounts.yellow > 0 && (
            <span className="badge-yellow">
              🟡 {commentCounts.yellow} Discussion{commentCounts.yellow !== 1 ? 's' : ''}
            </span>
          )}
          {commentCounts.green > 0 && (
            <span className="badge-green">
              🟢 {commentCounts.green} Question{commentCounts.green !== 1 ? 's' : ''}
            </span>
          )}
          {commentCounts.total === 0 && (
            <span className="text-sm text-gray-500">No comments yet - start the discussion!</span>
          )}
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        <MarkdownPane
          ref={markdownRef}
          content={prd.content}
          comments={prd.comments}
          onTextSelect={handleTextSelect}
          highlightRange={highlightRange}
          onHighlightClick={handleHighlightClick}
        />
        <CommentsPane
          ref={commentsRef}
          prdId={prd.id}
          comments={prd.comments}
          currentUser={user}
          selectedText={selectedText}
          selectedSection={selectedSection}
          scrollPosition={scrollPosition}
          activeCommentId={activeCommentId}
          visibleSections={visibleSections}
          visibleCommentIds={visibleCommentIds}
          syncEnabled={syncEnabled}
          focusedCommentId={focusedCommentId}
          onCommentClick={handleCommentClick}
          onCommentSubmit={handleCommentSubmit}
          onCloseFocus={() => setFocusedCommentId(null)}
        />
      </div>
    </div>
  )
}
