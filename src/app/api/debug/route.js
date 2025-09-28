import { NextResponse } from 'next/server'
import connectDB from '../../../Helpers/MongoDB.js'
import BlogPost from '../../../Models/Blogmodel.js'

export async function GET() {
  try {
    await connectDB()
    
    const posts = await BlogPost.find({ published: true })
      .select('title slug published createdAt')
      .limit(5)
      .lean()
    
    return NextResponse.json({
      success: true,
      message: 'Debug info',
      postsCount: posts.length,
      posts: posts,
      sampleUrls: posts.map(post => `/blog/${post.slug}`)
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
