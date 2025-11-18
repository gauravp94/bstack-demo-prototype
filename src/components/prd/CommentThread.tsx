'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Comment, CommentCategory, SessionUser } from '@/types'
import CommentForm from './CommentForm'

interface CommentThreadProps {
  comment: Comment
  prdId: number
  currentUser: SessionUser
  isActive?: boolean
  onClick?: (comment: Comment) => void
}

export default function CommentThread({ comment, prdId, currentUser, isActive, onClick }: CommentThreadProps) {
  const router = useRouter()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  const getCategoryBadge = (category: CommentCategory) => {
    switch (category) {
      case 'red':
        return <span className="badge-red">🔴 Blocker</span>
      case 'yellow':
        return <span className="badge-yellow">🟡 Discuss</span>
      case 'green':
        return <span className="badge-green">🟢 Question</span>
    }
  }

  const handleReply = async (content: string) => {
    try {
      const res = await fetch(`/api/prds/${prdId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          category: 'green', // Replies default to green
          parentId: comment.id,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Reply added!')
        setShowReplyForm(false)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to add reply')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleResolve = async () => {
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isResolved: !comment.isResolved,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(comment.isResolved ? 'Comment reopened' : 'Comment resolved!')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to update comment')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <div
      data-comment-id={comment.id}
      className={`comment-card ${comment.isResolved ? 'opacity-60' : ''} ${isActive ? 'comment-active' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(comment)}
    >
      {/* Comment header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {comment.user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{comment.user?.name}</p>
            <p className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {getCategoryBadge(comment.category)}
      </div>

      {/* Selected text context */}
      {comment.selectedText && (
        <div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-500 rounded text-sm">
          <p className="text-blue-700 italic">"{comment.selectedText}"</p>
        </div>
      )}

      {/* Comment content */}
      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>

      {/* Comment actions */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Reply
        </button>
        {comment.user?.id === currentUser.id && (
          <button
            onClick={handleResolve}
            className={`font-medium ${
              comment.isResolved
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-green-600 hover:text-green-800'
            }`}
          >
            {comment.isResolved ? 'Reopen' : 'Resolve'}
          </button>
        )}
        {comment.isResolved && (
          <span className="text-green-600 text-xs ml-auto">✓ Resolved</span>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <CommentForm
            onSubmit={handleReply}
            onCancel={() => setShowReplyForm(false)}
            isReply
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium mb-2"
          >
            {showReplies ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>

          {showReplies && (
            <div className="space-y-3">
              {comment.replies.map((reply: Comment) => (
                <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs">
                      {reply.user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-900">{reply.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
