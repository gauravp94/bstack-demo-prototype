const apiKey = process.env.GEMINI_API_KEY
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-image'
const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta'

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.')
}

// Simple HTTP client against the v1 REST endpoint to avoid SDK model/version mismatches
export async function generateText(prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Gemini AI is not configured')
  }

  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    }),
  })

  if (!res.ok) {
    const message = await safeResponseText(res)
    throw new Error(`Gemini request failed (${res.status} ${res.statusText}): ${message}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini returned no content')
  }

  return text.trim()
}

async function safeResponseText(res: Response) {
  try {
    return await res.text()
  } catch {
    return ''
  }
}
