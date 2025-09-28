'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminLayout from '../../../Components/AdminLayout'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    
    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/post')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setRecentPosts(data.posts.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        
        <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-3xl shadow-md p-6 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Welcome back, {session.user.name}, happening with your blog.</p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Total Posts',
              value: stats.total,
              description: 'All blog posts',
              icon: '📝',
              iconBg: 'bg-white/10',
              valueColor: 'text-white',
              borderColor: 'border-white/20'
            },
            {
              label: 'Published',
              value: stats.published,
              description: 'Live posts',
              icon: '✅',
              iconBg: 'bg-lime-600/20',
              valueColor: 'text-lime-400',
              borderColor: 'border-lime-400/30'
            },
            {
              label: 'Drafts',
              value: stats.draft,
              description: 'Unpublished',
              icon: '📄',
              iconBg: 'bg-gray-600/20',
              valueColor: 'text-gray-400',
              borderColor: 'border-gray-600/30'
            },
            {
              label: 'Total Views',
              value: stats.totalViews,
              description: 'Page views',
              icon: '👁️',
              iconBg: 'bg-gray-600/20',
              valueColor: 'text-gray-400',
              borderColor: 'border-gray-600/30'
            }
          ].map(({ label, value, description, icon, iconBg, valueColor, borderColor }) => (
            <div 
              key={label} 
              className={`bg-black bg-opacity-50 backdrop-blur-md p-6 rounded-2xl shadow-sm border ${borderColor} hover:shadow-md hover:border-white/40 transition-all cursor-default`}
              >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
                  <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>
                <div className={`${iconBg} p-3 rounded-xl text-xl select-none`}>{icon}</div>
              </div>
            </div>
          ))}
        </div>

        
        <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-3xl shadow-md border border-white/10">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Recent Posts</h2>
            <p className="text-gray-400 text-sm">Your latest blog posts</p>
          </div>
          <div className="divide-y divide-white/10">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post._id} className="p-6 hover:bg-white/5 transition-colors cursor-default flex justify-between items-start">
                  <div className="flex-1 pr-6">
                    <h3 className="text-lg font-medium text-white mb-1">{post.title}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{post.description}</p>
                    <div className="flex flex-wrap items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <span className="mr-1 select-none">👤</span>
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1 select-none">📅</span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium select-none ${
                        post.published 
                          ? 'bg-lime-700 text-lime-300 border border-lime-400/50' 
                          : 'bg-gray-700 text-gray-300 border border-gray-500/50'
                      }`}>
                        {post.published ? '✅ Published' : '📄 Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push(`/admin/posts/edit/${post._id}`)}
                      className="text-gray-300 hover:text-white text-sm font-medium px-3 py-1 rounded-md hover:bg-white/10 transition-colors"
                      type="button"
                      aria-label={`Edit post titled ${post.title}`}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-700/20 transition-colors"
                      type="button"
                      aria-label={`Delete post titled ${post.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <span className="text-4xl mb-4 block select-none">📝</span>
                <p className="text-lg font-medium mb-2">No posts yet</p>
                <p className="text-sm mb-4">Create your first blog post to get started!</p>
                <button 
                  onClick={() => router.push('/admin/posts/new')}
                  className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  type="button"
                >
                  Create First Post
                </button>
              </div>
            )}
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/20 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">✍️ Create New Post</h3>
              <p className="text-gray-400 mb-4">Start writing your next blog post</p>
            </div>
            <button 
              onClick={() => router.push('/admin/posts/new')}
              className="border border-white/30 hover:border-white rounded-lg px-5 py-3 font-medium transition-colors"
              type="button"
            >
              New Post
            </button>
          </div>

          <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/20 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">📚 Manage Posts</h3>
              <p className="text-gray-400 mb-4">View and edit existing posts</p>
            </div>
            <button 
              onClick={() => router.push('/admin/posts')}
              className="border border-white/30 hover:border-white rounded-lg px-5 py-3 font-medium transition-colors"
              type="button"
            >
              Manage Posts
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
