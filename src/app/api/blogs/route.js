import { NextResponse } from 'next/server'
import connectDB from '../../../Helpers/MongoDB'
import BlogPost from '../../../Models/Blogmodel'

export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags') || ''
    const skip = (page - 1) * limit
    
    // Build filter for published posts only
    let filter = { published: true }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim())
      filter.tags = { $in: tagArray }
    }
    
    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug description publishedAt tags featuredImage author views')
      .lean()
    
    const total = await BlogPost.countDocuments(filter)
    
    return NextResponse.json({
      success: true,
      posts,
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
    console.error('Error fetching posts:', error)
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
