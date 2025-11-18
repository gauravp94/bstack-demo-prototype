import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'
import { getSession } from '@/lib/auth/session'

export async function PATCH(
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
    const commentId = parseInt(id)

    if (isNaN(commentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { isResolved, content } = body

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        ...(isResolved !== undefined && { isResolved }),
        ...(content && { content }),
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
    console.error('Update comment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const commentId = parseInt(id)

    if (isNaN(commentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment ID' },
        { status: 400 }
      )
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
