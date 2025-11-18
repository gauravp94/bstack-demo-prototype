import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { rephraseComment } from '@/lib/ai/rephrase'
import prisma from '@/lib/db/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      )
    }

    const rephrased = await rephraseComment(text, session.role)

    // Log the AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.id,
        interactionType: 'rephrase',
        inputText: text,
        outputText: rephrased,
      },
    })

    return NextResponse.json({
      success: true,
      original: text,
      rephrased,
    })
  } catch (error) {
    console.error('Rephrase error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to rephrase comment. Make sure GEMINI_API_KEY is set.' },
      { status: 500 }
    )
  }
}
