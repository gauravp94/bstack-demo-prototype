import prisma from '@/lib/db/client'
import { getSession } from '@/lib/auth/session'
import { redirect, notFound } from 'next/navigation'
import PRDViewer from '@/components/prd/PRDViewer'

interface PRDPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PRDPage({ params }: PRDPageProps) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const prdId = parseInt(id)

  if (isNaN(prdId)) {
    notFound()
  }

  // Fetch PRD with all related data
  const prd = await prisma.pRD.findUnique({
    where: { id: prdId },
    include: {
      creator: true,
      comments: {
        include: {
          user: true,
          replies: {
            include: {
              user: true,
            },
          },
        },
        where: {
          parentId: null, // Only top-level comments
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      approvals: true,
      readingLogs: {
        where: {
          userId: session.id,
        },
      },
    },
  })

  if (!prd) {
    notFound()
  }

  // Get or create reading log
  let readingLog = prd.readingLogs[0]

  if (!readingLog) {
    readingLog = await prisma.readingLog.create({
      data: {
        prdId: prd.id,
        userId: session.id,
        versionRead: prd.version,
        isReading: true,
      },
    })
  } else {
    // Update reading log
    await prisma.readingLog.update({
      where: { id: readingLog.id },
      data: {
        isReading: true,
        lastReadAt: new Date(),
      },
    })
  }

  const userApproval = prd.approvals.find(a => a.userId === session.id)

  return (
    <PRDViewer
      prd={prd}
      user={session}
      hasApproved={!!userApproval}
      lastReadVersion={readingLog.versionRead}
    />
  )
}
