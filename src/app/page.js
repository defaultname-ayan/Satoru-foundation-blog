'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  // States and hooks remain unchanged
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [pagination, setPagination] = useState({})
  const [allTags, setAllTags] = useState([])
  const router = useRouter()

  const fetchPosts = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        search: searchTerm,
        tags: selectedTag
      })

      const response = await fetch(`/api/blogs?${params}`)
      const data = await response.json()
      
      if (data.posts) {
        setPosts(data.posts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedTag])

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/blogs?limit=100')
      const data = await response.json()
      
      if (data.posts) {
        const tags = [...new Set(data.posts.flatMap(post => post.tags || []))]
        setAllTags(tags.filter(tag => tag))
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-stone-900 to-black">
      {/* Header */}
      <header className="bg-black shadow-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 ">
            <div>
              <h1 className="text-4xl text-stone-200 font-extrabold tracking-wide">Satoru Blog</h1>
              <p className="text-zinc-400">Blog Post for Satoru Foundation</p>
            </div>
            <div>
              <Link
                href="/admin/login"
                className="bg-zinc-200 text-zinc-900 px-5 py-2 rounded-2xl shadow-md hover:bg-zinc-700 hover:text-white transition-colors duration-300 ease-in-out"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10">
        <div className="bg-black/30 backdrop-blur-md rounded-3xl shadow-xl p-8 mb-10 max-w-5xl mx-auto animate-fadeIn elongate-div">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Search Posts</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-5 py-3 rounded-xl bg-black/50 border border-zinc-700 placeholder:text-zinc-500 text-stone-100 focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Filter by Tag</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-black/50 border border-zinc-700 text-stone-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition"
              >
                <option value="" className="bg-black text-zinc-700">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag} className="bg-black text-zinc-200">{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || selectedTag) && (
            <div className="mt-5 flex flex-wrap gap-3 items-center text-sm text-zinc-400">
              <span>Active filters:</span>
              {searchTerm && (
                <span className="bg-zinc-700 bg-opacity-50 text-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
                  Search: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    type="button"
                    className="hover:text-blue-600 transition"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="bg-zinc-700 bg-opacity-50 text-green-400 px-3 py-1 rounded-full flex items-center gap-1">
                  Tag: {selectedTag}
                  <button
                    onClick={() => setSelectedTag('')}
                    type="button"
                    className="hover:text-green-600 transition"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-zinc-500">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-700 mx-auto mb-5"></div>
            Loading posts...
          </div>
        )}

        {/* Posts */}
        {!loading && (
          <>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-4">
                {posts.map(post => (
                  <article key={post._id} className="bg-black bg-opacity-40 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-500 cursor-pointer transform hover:-translate-y-1">
                    {post.featuredImage && (
                      <div className="relative w-full h-56">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover rounded-t-3xl"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-5">
                          {post.tags.slice(0, 3).map(tag => (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(tag)}
                              className="bg-zinc-700 bg-opacity-60 text-lime-300 px-3 py-1 rounded-full text-xs font-semibold hover:bg-lime-400 hover:text-black transition"
                              type="button"
                            >
                              {tag}
                            </button>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-zinc-400 text-xs mt-1">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <h2 className="text-2xl font-bold text-stone-200 mb-3 line-clamp-2 hover:text-lime-400 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-zinc-400 text-sm mb-6 line-clamp-3">
                        {post.description || (post.content?.substring(0, 150) + '...')}
                      </p>
                      <div className="flex justify-between items-center text-xs text-zinc-500">
                        <div className="flex gap-6">
                          <span className="flex items-center gap-1">
                            👤 {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            👁️ {post.views || 0} views
                          </span>
                        </div>
                        <time dateTime={post.publishedAt}>
                          {formatDate(post.publishedAt || post.createdAt)}
                        </time>
                      </div>
                      <div className="mt-5">
                        <Link href={`/blog/${post.slug}`} className="text-lime-400 hover:text-lime-600 text-sm font-semibold flex items-center gap-1">
                          Read more →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-400">
                <span className="text-7xl mb-5 block">📝</span>
                <h2 className="text-3xl font-bold mb-3 text-stone-300">No posts found</h2>
                <p className="mb-6 max-w-md mx-auto">
                  {searchTerm || selectedTag
                    ? 'Try adjusting your search or filter criteria'
                    : 'No blog posts have been published yet.'}
                </p>
                {!searchTerm && !selectedTag && (
                  <Link
                    href="/admin/login"
                    className="bg-lime-500 text-black px-8 py-3 rounded-3xl font-semibold hover:bg-lime-600 transition"
                  >
                    Login to Admin Panel
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-3 mt-12">
                <button
                  onClick={() => fetchPosts(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-5 py-2 text-sm rounded-xl bg-zinc-800 text-white border border-lime-600 hover:bg-lime-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition"
                  type="button"
                >
                  Previous
                </button>

                <div className="flex gap-1 items-center">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => fetchPosts(page)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                          pagination.page === page
                            ? 'bg-lime-500 text-black'
                            : 'bg-zinc-800 text-lime-300 hover:bg-lime-400 hover:text-black border border-lime-600'
                        } transition`}
                        type="button"
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => fetchPosts(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-5 py-2 text-sm rounded-xl bg-zinc-800 text-lime-400 border border-lime-600 hover:bg-lime-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition"
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-7 text-center text-zinc-500">
          <p>© 2025 Satoru Blog. Built with Next.js and MongoDB.</p>
          <div className="mt-2 space-x-4">
            <Link href="/admin/login" className="text-lime-400 hover:text-lime-600 text-sm font-semibold">
              Admin Panel
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(10px);}
          to {opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
        }
        .elongate-div {
          min-height: 200px;
        }
      `}</style>
    </div>
  )
}
