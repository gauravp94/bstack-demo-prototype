import { generateText } from './gemini'

export async function summarizePRD(content: string): Promise<string> {
  const prompt = `Summarize this Product Requirements Document (PRD) in 3-5 concise bullet points.
Focus on the key objectives, requirements, and success metrics.

PRD Content:
${content.substring(0, 4000)}

Provide a clear, executive summary suitable for stakeholders. Format as bullet points starting with •.`

  const summary = await generateText(prompt)
  return summary.trim()
}

export async function suggestReply(
  commentContent: string,
  prdContext: string
): Promise<string[]> {
  const prompt = `Given this comment on a PRD and the relevant PRD context, suggest 2-3 helpful reply directions:

Comment: "${commentContent}"

PRD Context: "${prdContext.substring(0, 500)}"

Provide 2-3 brief suggestions (1-2 sentences each) for how to respond constructively.
Format as a JSON array of strings like: ["suggestion 1", "suggestion 2"]

Provide ONLY the JSON array, no additional text.`

  const response = await generateText(prompt)

  // Clean up response
  let jsonText = response.trim()
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

  try {
    const suggestions = JSON.parse(jsonText)
    return Array.isArray(suggestions) ? suggestions : []
  } catch (error) {
    return [
      'Thank you for the feedback. Let me clarify...',
      "Good point. I'll update the PRD to address this.",
    ]
  }
}
