import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { summarizePRD } from '@/lib/ai/summarizer'
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

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    const summary = await summarizePRD(content)

    // Log the AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.id,
        interactionType: 'summary',
        inputText: content.substring(0, 1000),
        outputText: summary,
      },
    })

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error('Summary error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary. Make sure GEMINI_API_KEY is set.' },
      { status: 500 }
    )
  }
}
