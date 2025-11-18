import { getSession } from '@/lib/auth/session'
import Navbar from '@/components/layout/Navbar'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
