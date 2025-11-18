'use client'

import { useState, useEffect } from 'react'

interface SOPCheckerProps {
  text: string
}

export default function SOPChecker({ text }: SOPCheckerProps) {
  const [result, setResult] = useState<any>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!text.trim() || text.length < 10) {
      setResult(null)
      return
    }

    const timer = setTimeout(() => {
      checkSOP()
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timer)
  }, [text])

  const checkSOP = async () => {
    setChecking(true)

    try {
      const res = await fetch('/api/ai/validate-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const data = await res.json()

      if (data.success) {
        setResult(data)
      }
    } catch (error) {
      // Silently fail for UX
    } finally {
      setChecking(false)
    }
  }

  if (!text.trim() || checking) {
    return null
  }

  if (!result) {
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-50 border-green-200'
    if (score >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className={`mt-3 p-3 border rounded-lg ${getScoreBg(result.score)}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">
          Actionability Check
        </span>
        <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
          {result.score}/100
        </span>
      </div>

      {!result.isActionable && result.suggestions.length > 0 && (
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-1">💡 Suggestions to improve:</p>
          <ul className="list-disc pl-5 space-y-1">
            {result.suggestions.map((suggestion: string, i: number) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {result.isActionable && (
        <p className="text-sm text-green-700">
          ✓ This feedback is actionable and constructive!
        </p>
      )}
    </div>
  )
}
