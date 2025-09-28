import mongoose from 'mongoose'

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  description: {
    type: String,
    maxLength: [300, 'Description cannot exceed 300 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    default: ''
  },
  images: [{
    url: String,
    alt: String
  }],
  published: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Create slug from title before saving
BlogPostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }
  
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  
  next()
})

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema)
