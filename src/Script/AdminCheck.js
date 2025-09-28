// src/Script/seedAdmin.js
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '../../.env.local')

dotenv.config({ path: envPath })

import mongoose from 'mongoose'
import User from '../Models/UserModel.js'

const MONGODB_URI = process.env.MONGODB_URI
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@blog.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Blog Administrator'

console.log('🔍 Environment Check:')
console.log(`MONGODB_URI: ${MONGODB_URI ? '✅ Set' : '❌ Missing'}`)
console.log(`ADMIN_EMAIL: ${ADMIN_EMAIL}`)
console.log(`ADMIN_NAME: ${ADMIN_NAME}`)

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not defined')
  console.log('💡 Please check your .env.local file in the project root')
  process.exit(1)
}

async function connectDB() {
  try {
    if (mongoose.connections[0].readyState === 1) {
      console.log('✅ Already connected to MongoDB')
      return
    }
    
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

async function seedAdmin() {
  try {
    console.log('\n🌱 Starting admin user seeding...\n')
    
    await connectDB()
    
    // Check if admin already exists
    console.log('👤 Checking for existing admin user...')
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:')
      console.log(`   📧 Email: ${existingAdmin.email}`)
      console.log(`   👤 Name: ${existingAdmin.name}`)
      console.log(`   🔑 Role: ${existingAdmin.role}`)
      console.log(`   📅 Created: ${existingAdmin.createdAt}`)
      
      // Update admin user if needed
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin'
        await existingAdmin.save()
        console.log('🔄 Updated user role to admin')
      }
      
      console.log('✅ Admin setup complete!')
      return
    }
    
    // Create admin user
    console.log('👤 Creating new admin user...')
    const adminUser = new User({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      role: 'admin'
    })
    
    const savedAdmin = await adminUser.save()
    
    console.log('🎉 Admin user created successfully!')
    console.log(`   📧 Email: ${savedAdmin.email}`)
    console.log(`   👤 Name: ${savedAdmin.name}`)
    console.log(`   🔑 Role: ${savedAdmin.role}`)
    console.log(`   🆔 ID: ${savedAdmin._id}`)
    
    console.log('\n💡 Admin Panel Access:')
    console.log(`   🌐 URL: http://localhost:3000/admin/login`)
    console.log(`   📧 Email: ${ADMIN_EMAIL}`)
    console.log(`   🔑 Password: ${ADMIN_PASSWORD}`)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    
    if (error.code === 11000) {
      console.log('👤 Admin user with this email already exists')
    } else if (error.name === 'ValidationError') {
      console.log('❌ Validation Error:', error.message)
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
      console.log('🔌 Database connection closed')
    }
    process.exit(0)
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Process interrupted')
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
  process.exit(0)
})

seedAdmin()
