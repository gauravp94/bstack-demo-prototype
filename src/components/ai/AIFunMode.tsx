'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface AIFunModeProps {
  text: string
  onRephrase: (rephrased: string) => void
}

export default function AIFunMode({ text, onRephrase }: AIFunModeProps) {
  const [loading, setLoading] = useState(false)

  const handleRephrase = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text first')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/ai/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const data = await res.json()

      if (data.success) {
        onRephrase(data.rephrased)
        toast.success('Comment rephrased professionally!')
      } else {
        toast.error(data.error || 'Failed to rephrase')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRephrase}
      disabled={loading || !text.trim()}
      className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      title="AI Fun Mode: Rephrase your comment professionally"
    >
      <span>✨</span>
      {loading ? 'Rephrasing...' : 'Fun Mode'}
    </button>
  )
}
