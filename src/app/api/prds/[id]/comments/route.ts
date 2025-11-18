import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'
import { getSession } from '@/lib/auth/session'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const prdId = parseInt(id)

    if (isNaN(prdId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid PRD ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { content, category, parentId, sectionId, selectedText, scrollPosition } = body

    if (!content || !category) {
      return NextResponse.json(
        { success: false, error: 'Content and category are required' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        prdId,
        userId: session.id,
        content,
        category,
        parentId: parentId || null,
        sectionId: sectionId || null,
        selectedText: selectedText || null,
        scrollPosition: scrollPosition || null,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      success: true,
      comment,
    })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
