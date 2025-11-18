import { generateText } from './gemini'

export interface SOPCheckResult {
  isActionable: boolean
  score: number
  feedback: string
  suggestions: string[]
}

export async function checkCommentSOP(comment: string): Promise<SOPCheckResult> {
  const prompt = `You are an expert at providing constructive feedback. Analyze this comment and determine if it's actionable:

Comment: "${comment}"

Evaluate based on:
1. Is it specific enough?
2. Does it provide clear next steps?
3. Is it constructive rather than just critical?
4. Can the recipient take concrete action based on it?

Respond in this exact JSON format:
{
  "isActionable": true/false,
  "score": 0-100,
  "feedback": "brief explanation",
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Provide ONLY the JSON, no markdown formatting or additional text.`

  const response = await generateText(prompt)

  // Clean up the response to extract JSON
  let jsonText = response.trim()

  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

  try {
    const result = JSON.parse(jsonText)
    return {
      isActionable: result.isActionable || false,
      score: result.score || 0,
      feedback: result.feedback || '',
      suggestions: result.suggestions || [],
    }
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      isActionable: false,
      score: 50,
      feedback: 'Unable to analyze comment',
      suggestions: ['Try to be more specific', 'Add actionable next steps'],
    }
  }
}
