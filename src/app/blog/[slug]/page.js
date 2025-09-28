'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/blogs/${slug}`)
      const data = await response.json()
      
      if (data.success && data.post) {
        setPost(data.post)
      } else {
        setError(data.message || 'Post not found')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Error loading post')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black bg-gradient-to-br from-black via-stone-900 to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-lime-500 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black bg-gradient-to-br from-black via-stone-900 to-zinc-900 flex items-center justify-center">
        <div className="text-center text-zinc-400">
          <span className="text-7xl mb-5 block">📄</span>
          <h1 className="text-3xl font-bold mb-3 text-stone-200">Post Not Found</h1>
          <p className="mb-6 max-w-md mx-auto">{error}</p>
          <Link 
            href="/"
            className="bg-lime-500 text-black px-8 py-3 rounded-3xl font-semibold hover:bg-lime-600 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-stone-900 to-zinc-900">
      {/* Header */}
      <header className="bg-black bg-opacity-60 backdrop-blur-md shadow-md border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-3xl font-extrabold text-stone-200 hover:text-lime-400 transition-colors">
              Satoru Blog
            </Link>
            <Link href="/admin/login" className="text-lime-400 hover:text-lime-600 text-sm font-semibold transition">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-10">
        {/* Back Link */}
        <nav className="mb-10">
          <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm font-medium transition">
            ← Back to all posts
          </Link>
        </nav>

        {/* Article */}
        <article className="bg-black bg-opacity-30 backdrop-blur-md rounded-3xl shadow-xl p-10 animate-fadeIn">
          {/* Title */}
          <h1 className="text-4xl font-bold text-stone-100 mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-8 text-sm text-zinc-400 mb-10 border-b border-zinc-700 pb-8">
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📅</span>
              <time>{formatDate(post.publishedAt || post.createdAt)}</time>
            </div>
            <div className="flex items-center gap-2">
              <span>👁️</span>
              <span>{post.views || 0} views</span>
            </div>
          </div>

          
          {post.description && (
            <div className="mb-12 p-5 bg-stone-900 bg-opacity-30 rounded-xl border-1 border-stone-500">
              <p className="text-stone-300 font-medium italic text-lg">{post.description}</p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none text-stone-200 leading-relaxed">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-6 text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-zinc-700">
              <h3 className="text-sm font-semibold text-stone-400 mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-stone-700 bg-opacity-40 text-stone-300 px-4 py-1 rounded-full text-sm font-semibold cursor-pointer select-none hover:bg-lime-600 transition"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Back Button */}
        <div className="mt-14 text-center">
          <Link 
            href="/"
            className="bg-stone-500 text-black px-10 py-3 rounded-3xl font-semibold hover:bg-stone-600 transition inline-flex items-center gap-2"
          >
            <span>←</span>
            Back to All Posts
          </Link>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(15px);}
          to {opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }

        /* Prose-invert requires tailwind typography plugin */
      `}</style>
    </div>
  )
}
