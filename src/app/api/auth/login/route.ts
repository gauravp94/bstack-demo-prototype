import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/client'
import { createSession, setSessionCookie } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please use one of the demo accounts.' },
        { status: 404 }
      )
    }

    // Create session
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'dev' | 'design' | 'pm',
    }

    const token = await createSession(sessionUser)
    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      user: sessionUser,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
