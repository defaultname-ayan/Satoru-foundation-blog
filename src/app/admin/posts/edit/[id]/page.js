'use client'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../../../../../Components/AdminLayout'
import Image from 'next/image'

export default function EditPost() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const postId = params.id
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    tags: '',
    published: false,
    featuredImage: ''
  })

  const fetchPost = useCallback(async () => {
    if (!postId) return
    
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/admin/post/${postId}`)
      const data = await response.json()

      if (data.success) {
        const post = data.post
        setFormData({
          title: post.title || '',
          content: post.content || '',
          description: post.description || '',
          tags: post.tags ? post.tags.join(', ') : '',
          published: post.published || false,
          featuredImage: post.featuredImage || ''
        })
      } else {
        setError(data.message || 'Post not found')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Error loading post')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (status !== 'loading' && session && session.user.role === 'admin' && postId) {
      fetchPost()
    }
  }, [status, session, postId, fetchPost])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []

      const submitData = {
        ...formData,
        tags: tagsArray
      }

      const response = await fetch(`/api/admin/post/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Post updated successfully!')
        router.push('/admin/posts')
      } else {
        setError(data.message || 'Error updating post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      setError('Error updating post')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }
    try {
      const response = await fetch(`/api/admin/post/${postId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        alert('Post deleted successfully!')
        router.push('/admin/posts')
      } else {
        alert(data.message || 'Error deleting post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    }
  }

  if (status === 'loading' || (loading && !error)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600/50 mx-auto mb-4"></div>
            <p className="text-gray-400">
              {status === 'loading' ? 'Authenticating...' : 'Loading post...'}
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error && !formData.title && !loading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900 bg-opacity-40 border border-red-800 rounded-lg p-6 text-red-300">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-xl">❌</span>
              <h3 className="text-lg font-semibold">Error Loading Post</h3>
            </div>
            <p className="mb-6">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={fetchPost}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/admin/posts')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Back to Posts
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
       
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Post</h1>
            <p className="text-gray-400">Update &quot;{formData.title || 'your blog post'}&quot;</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDelete}
              className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition flex items-center"
              type="button"
            >
              <span className="mr-2">🗑️</span>
              Delete Post
            </button>
            <button
              onClick={() => router.push('/admin/posts')}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center"
              type="button"
            >
              <span className="mr-2">←</span>
              Back to Posts
            </button>
          </div>
        </div>

        
        {error && formData.title && (
          <div className="bg-red-900 bg-opacity-40 border border-red-800 rounded-lg p-4 text-red-300">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

       
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-3xl shadow-md p-6 border border-white/10 text-white">
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Post Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your blog post title..."
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg placeholder-white/50 transition"
                required
              />
            </div>

            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write a brief description or excerpt..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent resize-vertical placeholder-white/50 transition"
              />
            </div>

            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your blog post content here..."
                rows={20}
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent font-mono text-sm placeholder-white/50 resize-vertical transition"
                required
              />
            </div>

            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="technology, web development, javascript"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/50 transition"
              />
              <p className="text-sm text-white/50 mt-1">Separate tags with commas</p>
            </div>

            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Featured Image URL</label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/50 transition"
              />
              {formData.featuredImage && (
                <div className="mt-3 relative w-full max-w-md h-48 rounded-lg overflow-hidden border border-white/20">
                  <Image 
                    src={formData.featuredImage} 
                    alt="Featured image preview" 
                    fill
                    style={{ objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              )}
            </div>
          </div>

          
          <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-3xl shadow-md p-6 border border-white/10 text-white">
            <h3 className="text-lg font-semibold mb-4">Publishing Options</h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="w-4 h-4 text-white border-white rounded focus:ring-white"
              />
              <label htmlFor="published" className="text-sm cursor-pointer select-none">
                Published
              </label>
            </div>

            <div className="mt-3 p-3 rounded-lg border border-white/20">
              {formData.published ? (
                <p className="text-sm text-green-400 select-none">
                  ✅ This post is published and visible to visitors.
                </p>
              ) : (
                <p className="text-sm text-yellow-400 select-none">
                  📄 This post is saved as a draft and not visible to visitors.
                </p>
              )}
            </div>
          </div>

          
          <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-3xl shadow-md p-6 border border-white/10 flex justify-between items-center">
            <p className="text-sm text-white/50 select-none">* Required fields</p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/posts')}
                className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.title || !formData.content}
                className="px-6 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 disabled:bg-opacity-10 disabled:cursor-not-allowed transition flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="mr-2 select-none">💾</span>
                    Update Post
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
