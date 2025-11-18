import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { checkCommentSOP } from '@/lib/ai/sop-checker'
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

    const result = await checkCommentSOP(text)

    // Log the AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.id,
        interactionType: 'sop_check',
        inputText: text,
        outputText: JSON.stringify(result),
      },
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('SOP check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate comment. Make sure GEMINI_API_KEY is set.' },
      { status: 500 }
    )
  }
}
