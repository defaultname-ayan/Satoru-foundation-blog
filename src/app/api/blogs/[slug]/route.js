import { NextResponse } from 'next/server'
import connectDB from '../../../../Helpers/MongoDB.js'
import BlogPost from '../../../../Models/Blogmodel.js'

export async function GET(request, { params }) {
  try {
    await connectDB()
    
    // Await params in Next.js 15+
    const { slug } = await params
    
    if (!slug) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Slug is required' 
        },
        { status: 400 }
      )
    }
    
    const post = await BlogPost.findOneAndUpdate(
      { slug: slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean()
    
    if (!post) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Post not found' 
        },
        { status: 404 }
      )
    }
    
    // Get related posts (same tags, exclude current post)
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id },
      published: true,
      tags: { $in: post.tags || [] }
    })
    .limit(3)
    .select('title slug description publishedAt featuredImage')
    .sort({ publishedAt: -1 })
    .lean()
    
    return NextResponse.json({
      success: true,
      post,
      relatedPosts
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching post', 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
