'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminLayout from '../../../Components/AdminLayout'

export default function AdminPosts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchPosts()
  }, [session, status, router])

  useEffect(() => {
    if (session && session.user.role === 'admin') {
      fetchPosts()
    }
  }, [searchTerm, statusFilter, session])

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      })
      const response = await fetch(`/api/admin/post?${params}`)
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching posts:', data.message)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId, postTitle) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) return
    try {
      const response = await fetch(`/api/admin/post/${postId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        fetchPosts()
        alert('Post deleted successfully!')
      } else {
        alert(data.message || 'Error deleting post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    }
  }

  const togglePublishStatus = async (postId, currentStatus, title) => {
    try {
      const response = await fetch(`/api/admin/post/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus })
      })
      const data = await response.json()
      if (data.success) {
        fetchPosts()
        alert(`Post "${title}" ${!currentStatus ? 'published' : 'unpublished'} successfully!`)
      } else {
        alert(data.message || 'Error updating post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Error updating post')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-400 mx-auto mb-4"></div>
            <p className="text-stone-400">Loading posts...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Posts</h1>
            <p className="text-stone-400">Create, edit, and manage your blog posts</p>
          </div>
          <button
            onClick={() => router.push('/admin/posts/new')}
            className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-600 transition-colors flex items-center"
          >
            <span className="mr-2 select-none">✍️</span>
            New Post
          </button>
        </div>

        <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Search Posts</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 placeholder-stone-500 text-white focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 text-white placeholder-stone-500 focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
              >
                <option value="all">All Posts</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchPosts(1)}
                className="w-full bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-600 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-black bg-opacity-70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 overflow-hidden">
          {posts.length > 0 ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full text-white border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-black bg-opacity-10 rounded-lg">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider select-none">Post</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider select-none">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider select-none">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider select-none">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider select-none">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider select-none">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-opacity-10 rounded-lg transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div>
                          <div className="text-sm font-medium line-clamp-1">{post.title}</div>
                          <div className="text-xs text-stone-400 line-clamp-2">{post.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-stone-400 whitespace-nowrap">{post.author}</td>
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full select-none ${
                          post.published
                            ? 'bg-stone-700 hover:bg-stone-800 bg-opacity-20 text-white'
                            : 'bg-stone-700 bg-opacity-60 text-stone-300'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-stone-400 whitespace-nowrap">{post.views || 0}</td>
                      <td className="px-6 py-4 align-top text-xs text-stone-400 whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 align-top text-xs space-x-3 font-medium">
                        <button
                          onClick={() => router.push(`/admin/posts/edit/${post._id}`)}
                          className="text-cyan-400 hover:text-cyan-600 transition select-none"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => togglePublishStatus(post._id, post.published, post.title)}
                          className={`transition select-none ${
                            post.published
                              ? 'text-yellow-400 hover:text-yellow-600'
                              : 'text-green-400 hover:text-green-600'
                          }`}
                          type="button"
                        >
                          {post.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDelete(post._id, post.title)}
                          className="text-red-400 hover:text-red-600 transition select-none"
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400">
              <span className="text-4xl mb-4 block select-none">📝</span>
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="mb-4">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first blog post to get started!'}
              </p>
              <button
                onClick={() => router.push('/admin/posts/new')}
                className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-600 transition"
              >
                Create First Post
              </button>
            </div>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={() => fetchPosts(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm text-stone-400 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md hover:bg-opacity-20 disabled:opacity-40 disabled:cursor-not-allowed transition"
              type="button"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-stone-300 select-none">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchPosts(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm text-stone-400 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md hover:bg-opacity-20 disabled:opacity-40 disabled:cursor-not-allowed transition"
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
