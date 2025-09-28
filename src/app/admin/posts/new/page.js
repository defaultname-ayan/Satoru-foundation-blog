'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminLayout from '../../../../Components/AdminLayout'
import Image from 'next/image'

export default function NewPost() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    tags: '',
    published: false,
    featuredImage: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/admin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        alert('Post created successfully!')
        router.push('/admin/posts')
      } else {
        alert(data.message || 'Error creating post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Error creating post')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-500 mx-auto"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Post</h1>
            <p className="text-stone-400">Write and publish a new blog post</p>
          </div>
          <button
            onClick={() => router.push('/admin/posts')}
            className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-600 transition-colors flex items-center"
          >
            <span className="mr-2 select-none">←</span>
            Back to Posts
          </button>
        </div>

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
                required
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/50 focus:ring-2 focus:ring-white/40 focus:border-transparent text-lg transition"
              />
              <p className="text-sm text-white/50 mt-1">This will be the main heading of your blog post</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write a brief description or excerpt..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/50 focus:ring-2 focus:ring-white/40 focus:border-transparent resize-vertical transition"
              />
              <p className="text-sm text-white/50 mt-1">A short summary that will appear in post previews (optional)</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder={`Write your blog post content here...
 You can use markdown or HTML formatting:
 - **Bold text** or <strong>Bold text</strong>
 - *Italic text* or <em>Italic text</em>
 - ## Subheadings
 - [Links](https://example.com)
 - Lists, quotes, and more...`}
                rows={20}
                required
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/50 focus:ring-2 focus:ring-white/40 focus:border-transparent font-mono text-sm resize-vertical transition"
              />
              <p className="text-sm text-white/50 mt-1">Write your full blog post content. Markdown and HTML are supported.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="technology, web development, javascript"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/50 focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
              />
              <p className="text-sm text-white/50 mt-1">Separate tags with commas (e.g., &#39;technology, programming, tutorial&#39;)</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Featured Image URL</label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/50 focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
              />
              <p className="text-sm text-white/50 mt-1">Optional: Add a featured image URL for your post</p>
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
              <label htmlFor="published" className="flex items-center cursor-pointer select-none">
                <span className="text-sm">Publish immediately</span>
                <span className="ml-2 text-xs text-white/50">(Uncheck to save as draft)</span>
              </label>
            </div>
            {formData.published ? (
              <div className="mt-3 p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                <p className="text-sm text-green-400 select-none">✅ This post will be published and visible to visitors immediately after saving.</p>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-stone-900 bg-opacity-30 border border-white rounded-lg">
                <p className="text-sm text-white select-none">📄 This post will be saved as a draft. You can publish it later from the posts management page.</p>
              </div>
            )}
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
                disabled={loading || !formData.title || !formData.content}
                className="px-6 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 disabled:bg-opacity-10 disabled:cursor-not-allowed transition flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {formData.published ? 'Publishing...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <span className="mr-2 select-none">{formData.published ? '🚀' : '💾'}</span>
                    {formData.published ? 'Publish Post' : 'Save Draft'}
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
