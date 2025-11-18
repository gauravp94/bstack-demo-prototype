'use client'

import { useState } from 'react'
import { CommentCategory } from '@/types'
import AIFunMode from '@/components/ai/AIFunMode'
import SOPChecker from '@/components/ai/SOPChecker'

interface CommentFormProps {
  onSubmit: (content: string, category: CommentCategory) => void
  onCancel?: () => void
  defaultContent?: string
  isReply?: boolean
}

export default function CommentForm({
  onSubmit,
  onCancel,
  defaultContent = '',
  isReply = false,
}: CommentFormProps) {
  const [content, setContent] = useState(defaultContent)
  const [category, setCategory] = useState<CommentCategory>('green')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      return
    }

    onSubmit(content, category)
    setContent('')
  }

  const handleRephrase = (rephrased: string) => {
    setContent(rephrased)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isReply ? 'Write a reply...' : 'Add your comment or feedback...'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          rows={4}
          required
        />
        {!isReply && (
          <div className="mt-2">
            <AIFunMode text={content} onRephrase={handleRephrase} />
          </div>
        )}
      </div>

      {!isReply && <SOPChecker text={content} />}

      {!isReply && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCategory('green')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === 'green'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              }`}
            >
              🟢 Question
            </button>
            <button
              type="button"
              onClick={() => setCategory('yellow')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === 'yellow'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
              }`}
            >
              🟡 Discuss
            </button>
            <button
              type="button"
              onClick={() => setCategory('red')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === 'red'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              🔴 Blocker
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          {isReply ? 'Reply' : 'Add Comment'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
