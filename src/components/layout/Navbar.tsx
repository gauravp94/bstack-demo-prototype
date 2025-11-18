'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { SessionUser } from '@/types'

interface NavbarProps {
  user: SessionUser
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        toast.success('Logged out successfully')
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'pm':
        return 'bg-purple-100 text-purple-700'
      case 'dev':
        return 'bg-blue-100 text-blue-700'
      case 'design':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">PRD Collab</h1>
          <span className="text-sm text-gray-500">Smart Collaboration Platform</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
              {user.role.toUpperCase()}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
