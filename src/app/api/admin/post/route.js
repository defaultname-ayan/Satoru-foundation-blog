import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import connectDB from '../../../../Helpers/MongoDB.js'
import BlogPost from '../../../../Models/Blogmodel.js'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Admin access required' 
      }, { status: 401 })
    }

    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const skip = (page - 1) * limit
    
    let filter = {}
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status === 'published') {
      filter.published = true
    } else if (status === 'draft') {
      filter.published = false
    }
    
    const posts = await BlogPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug description published publishedAt createdAt tags author views featuredImage')
      .lean()
    
    const total = await BlogPost.countDocuments(filter)
    
    // Get counts for dashboard stats
    const stats = {
      total: await BlogPost.countDocuments(),
      published: await BlogPost.countDocuments({ published: true }),
      draft: await BlogPost.countDocuments({ published: false }),
      totalViews: await BlogPost.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ])
    }
    
    return NextResponse.json({
      success: true,
      posts,
      stats: {
        total: stats.total,
        published: stats.published,
        draft: stats.draft,
        totalViews: stats.totalViews[0]?.totalViews || 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching admin posts:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching posts', 
        error: error.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Admin access required' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      content, 
      description, 
      tags, 
      published, 
      featuredImage,
      images 
    } = body
    
    if (!title || !content) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Title and content are required' 
        },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()
    
    // Check if post with similar slug already exists
    const existingPost = await BlogPost.findOne({ slug })
    if (existingPost) {
      return NextResponse.json(
        { 
          success: false,
          message: 'A post with similar title already exists' 
        },
        { status: 400 }
      )
    }
    
    // Handle tags properly - they might be array or string
    let processedTags = []
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => tag && tag.trim())
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
    }
    
    const newPost = new BlogPost({
      title,
      slug,
      content,
      description,
      tags: processedTags,
      published: Boolean(published),
      featuredImage: featuredImage || '',
      images: images || [],
      author: session.user.name || session.user.email,
      publishedAt: published ? new Date() : null
    })
    
    const savedPost = await newPost.save()
    
    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post: savedPost
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          message: 'A post with this slug already exists' 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Error creating post', 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
