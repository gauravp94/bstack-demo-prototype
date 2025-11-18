import Link from 'next/link'
import prisma from '@/lib/db/client'
import { getSession } from '@/lib/auth/session'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    return null
  }

  // Fetch all PRDs with aggregated comment counts
  const prds = await prisma.pRD.findMany({
    include: {
      creator: true,
      comments: {
        select: {
          category: true,
        },
      },
      approvals: {
        where: {
          userId: session.id,
        },
      },
      readingLogs: {
        where: {
          userId: session.id,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  // Transform data to include comment counts
  const prdsWithCounts = prds.map((prd) => {
    const commentCounts = prd.comments.reduce(
      (acc, comment) => {
        acc[comment.category as 'red' | 'yellow' | 'green']++
        acc.total++
        return acc
      },
      { red: 0, yellow: 0, green: 0, total: 0 }
    )

    const hasApproved = prd.approvals.length > 0
    const lastReadVersion = prd.readingLogs[0]?.versionRead || 0

    return {
      ...prd,
      commentCounts,
      hasApproved,
      lastReadVersion,
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PRD Dashboard</h1>
        <p className="text-gray-600">Manage and collaborate on product requirements documents</p>
      </div>

      <div className="grid gap-6">
        {prdsWithCounts.map((prd) => (
          <Link
            key={prd.id}
            href={`/dashboard/prd/${prd.id}`}
            className="block bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{prd.title}</h2>
                  {prd.version > prd.lastReadVersion && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Updated (v{prd.version})
                    </span>
                  )}
                  {prd.hasApproved && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      ✓ Approved
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>Created by {prd.creator.name}</span>
                  <span>•</span>
                  <span>Version {prd.version}</span>
                  <span>•</span>
                  <span className="capitalize">{prd.status.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{new Date(prd.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-3">
                  {prd.commentCounts.red > 0 && (
                    <span className="badge-red">
                      🔴 {prd.commentCounts.red} Blocker{prd.commentCounts.red !== 1 ? 's' : ''}
                    </span>
                  )}
                  {prd.commentCounts.yellow > 0 && (
                    <span className="badge-yellow">
                      🟡 {prd.commentCounts.yellow} Discussion{prd.commentCounts.yellow !== 1 ? 's' : ''}
                    </span>
                  )}
                  {prd.commentCounts.green > 0 && (
                    <span className="badge-green">
                      🟢 {prd.commentCounts.green} Question{prd.commentCounts.green !== 1 ? 's' : ''}
                    </span>
                  )}
                  {prd.commentCounts.total === 0 && (
                    <span className="text-sm text-gray-500">No comments yet</span>
                  )}
                </div>
              </div>

              <div>
                <button className="btn-primary text-sm">
                  View PRD →
                </button>
              </div>
            </div>
          </Link>
        ))}

        {prdsWithCounts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No PRDs available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
