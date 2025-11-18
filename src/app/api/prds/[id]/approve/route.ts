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

    // Check if there are any red or yellow comments
    const blockingComments = await prisma.comment.count({
      where: {
        prdId,
        category: {
          in: ['red', 'yellow'],
        },
        isResolved: false,
      },
    })

    if (blockingComments > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot approve: there are unresolved blocker or discussion comments',
        },
        { status: 400 }
      )
    }

    // Check if already approved
    const existingApproval = await prisma.approval.findUnique({
      where: {
        prdId_userId: {
          prdId,
          userId: session.id,
        },
      },
    })

    if (existingApproval) {
      return NextResponse.json(
        { success: false, error: 'You have already approved this PRD' },
        { status: 400 }
      )
    }

    // Create approval
    const approval = await prisma.approval.create({
      data: {
        prdId,
        userId: session.id,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      success: true,
      approval,
    })
  } catch (error) {
    console.error('Approve PRD error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
