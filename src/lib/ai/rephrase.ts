import { generateText } from './gemini'

export async function rephraseComment(
  originalComment: string,
  userRole: string
): Promise<string> {
  const prompt = `You are helping a ${userRole} rephrase their feedback professionally.

Original feedback (which may contain crude or informal language):
"${originalComment}"

Please rephrase this feedback to be:
1. Professional and constructive
2. Actionable and specific
3. Respectful and collaborative
4. Clear and concise

Provide ONLY the rephrased version, no explanations or additional text.`

  const rephrased = await generateText(prompt)
  return rephrased.trim()
}
