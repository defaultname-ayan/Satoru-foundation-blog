import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import connectDB from '../../../../../Helpers/MongoDB'
import BlogPost from '../../../../../Models/Blogmodel'

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
    const { action, postIds } = body
    
    if (!action || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Action and post IDs are required' 
        },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    let result
    
    switch (action) {
      case 'publish':
        result = await BlogPost.updateMany(
          { _id: { $in: postIds } },
          { 
            published: true, 
            publishedAt: new Date(),
            updatedAt: new Date()
          }
        )
        break
        
      case 'unpublish':
        result = await BlogPost.updateMany(
          { _id: { $in: postIds } },
          { 
            published: false,
            updatedAt: new Date()
          }
        )
        break
        
      case 'delete':
        result = await BlogPost.deleteMany(
          { _id: { $in: postIds } }
        )
        break
        
      default:
        return NextResponse.json(
          { 
            success: false,
            message: 'Invalid action' 
          },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount,
      requestedCount: postIds.length
    })
  } catch (error) {
    console.error('Error in bulk action:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error performing bulk action', 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
