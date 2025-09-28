'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

const AdminLayout = ({ children }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600/40"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-gray-400">
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'All Posts', href: '/admin/posts', icon: '📝' },
    { name: 'New Post', href: '/admin/posts/new', icon: '✍️' },
    { name: 'View Site', href: '/', icon: '🌐' },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      
      <aside className="fixed inset-y-0 left-0 w-64 bg-black bg-opacity-60 backdrop-blur-md border-r border-white/10 shadow-lg flex flex-col z-50">
        
        <div className="h-16 flex items-center justify-center bg-black bg-opacity-80 border-b border-white/20">
          <h1 className="text-xl font-bold select-none">Satoru Blog Admin</h1>
        </div>

        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navigation.map(({ name, href, icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 select-none
                  ${isActive
                    ? 'bg-white/10 text-white border-1 border-lime-600'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'}
                `}
              >
                <span className="mr-3 text-lg">{icon}</span>
                {name}
              </Link>
            )
          })}
        </nav>

        
        <div className="p-4 border-t border-white/10 bg-black bg-opacity-80">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center select-none">
                <span className="text-white font-semibold text-sm">
                  {session.user.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0 truncate">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-500 bg-red-900 bg-opacity-30 rounded-lg hover:bg-red-900 hover:bg-opacity-50 transition-colors select-none"
          >
            <span className="mr-2 select-none">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      
      <main className="flex-1 ml-64 p-8 bg-black bg-opacity-30 backdrop-blur-md min-h-screen">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
