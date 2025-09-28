import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import connectDB from '../../../../../Helpers/MongoDB.js'
import BlogPost from '../../../../../Models/Blogmodel.js'
import mongoose from 'mongoose'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Admin access required' 
      }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { id } = await params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid post ID' 
        },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    const post = await BlogPost.findById(id).lean()
    
    if (!post) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Post not found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      post
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

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Admin access required' 
      }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { id } = await params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid post ID' 
        },
        { status: 400 }
      )
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
    
    // Handle tags properly - they might be array or string
    let processedTags = []
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => tag && tag.trim())
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
    }
    
    const updateData = {
      title,
      content,
      description,
      tags: processedTags,
      featuredImage: featuredImage || '',
      images: images || [],
      updatedAt: new Date()
    }
    
    // Handle publication status changes
    if (published !== undefined) {
      updateData.published = Boolean(published)
      
      // Set publishedAt date if publishing for the first time
      if (published) {
        const existingPost = await BlogPost.findById(id).select('publishedAt')
        if (!existingPost?.publishedAt) {
          updateData.publishedAt = new Date()
        }
      }
    }
    
    // Update slug if title changed
    if (title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      // Check if new slug conflicts with other posts
      const existingPost = await BlogPost.findOne({ 
        slug: newSlug, 
        _id: { $ne: id } 
      })
      
      if (existingPost) {
        updateData.slug = `${newSlug}-${Date.now()}`
      } else {
        updateData.slug = newSlug
      }
    }
    
    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
    
    if (!updatedPost) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Post not found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating post', 
        error: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Admin access required' 
      }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { id } = await params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid post ID' 
        },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    const deletedPost = await BlogPost.findByIdAndDelete(id)
    
    if (!deletedPost) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Post not found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      deletedPost: {
        id: deletedPost._id,
        title: deletedPost.title
      }
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting post', 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
