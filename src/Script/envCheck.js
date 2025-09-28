// src/Script/envCheck.js

const path = require('path')
const fs = require('fs')

const requiredEnvVars = [
  'MONGODB_URI',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
]

const optionalEnvVars = [
  'ADMIN_NAME',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
]

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!')
    console.log('📍 Expected location:', envPath)
    console.log('💡 Please create .env.local file in your project root')
    return false
  }
  
  // Load .env.local manually since we're not using dotenv
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')
  
  envLines.forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
      }
    }
  })
  
  return true
}

function validateEnvironment() {
  console.log('🔍 Validating environment variables for Satoru Blog...\n')
  
  // First, try to load .env.local
  if (!loadEnvFile()) {
    process.exit(1)
  }
  
  let isValid = true
  const missing = []
  const present = []
  
  // Check required variables
  console.log('📋 Required Variables:')
  console.log('=' .repeat(40))
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName] && process.env[varName].trim() !== '') {
      console.log(`✅ ${varName}: ✓ Set`)
      present.push(varName)
    } else {
      console.log(`❌ ${varName}: ✗ Missing`)
      missing.push(varName)
      isValid = false
    }
  })
  
  // Check optional variables
  console.log('\n📋 Optional Variables:')
  console.log('=' .repeat(40))
  
  optionalEnvVars.forEach(varName => {
    if (process.env[varName] && process.env[varName].trim() !== '') {
      console.log(`✅ ${varName}: ✓ Set`)
    } else {
      console.log(`⚠️  ${varName}: - Not set (optional)`)
    }
  })
  
  // Detailed validation
  console.log('\n🔍 Detailed Validation:')
  console.log('=' .repeat(40))
  
  // MongoDB URI validation
  if (process.env.MONGODB_URI) {
    if (process.env.MONGODB_URI.startsWith('mongodb://') || process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      console.log('✅ MONGODB_URI: Valid format')
    } else {
      console.log('❌ MONGODB_URI: Invalid format (should start with mongodb:// or mongodb+srv://)')
      isValid = false
    }
  }
  
  // NextAuth URL validation
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL)
      console.log('✅ NEXTAUTH_URL: Valid URL format')
    } catch {
      console.log('❌ NEXTAUTH_URL: Invalid URL format')
      isValid = false
    }
  }
  
  // NextAuth Secret validation
  if (process.env.NEXTAUTH_SECRET) {
    if (process.env.NEXTAUTH_SECRET.length >= 32) {
      console.log('✅ NEXTAUTH_SECRET: Good length (32+ characters)')
    } else {
      console.log('⚠️  NEXTAUTH_SECRET: Consider using a longer secret (32+ characters)')
    }
  }
  
  // Admin email validation
  if (process.env.ADMIN_EMAIL) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(process.env.ADMIN_EMAIL)) {
      console.log('✅ ADMIN_EMAIL: Valid email format')
    } else {
      console.log('❌ ADMIN_EMAIL: Invalid email format')
      isValid = false
    }
  }
  
  // Admin password validation
  if (process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length >= 8) {
      console.log('✅ ADMIN_PASSWORD: Good length (8+ characters)')
    } else {
      console.log('❌ ADMIN_PASSWORD: Too short (minimum 8 characters)')
      isValid = false
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 SUMMARY:')
  console.log('=' .repeat(50))
  
  if (isValid) {
    console.log('🎉 All required environment variables are properly set!')
    console.log(`✨ Found ${present.length}/${requiredEnvVars.length} required variables`)
    console.log('🚀 Your application should work correctly.')
    console.log('\n💡 Next steps:')
    console.log('   1. Run: npm run seed:admin (to create admin user)')
    console.log('   2. Run: npm run dev (to start development server)')
  } else {
    console.log('❌ Environment validation failed!')
    console.log(`🔧 Missing ${missing.length} required variables:`)
    missing.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    console.log('\n💡 Please check your .env.local file and add the missing variables.')
    process.exit(1)
  }
}

function generateSampleEnv() {
  console.log('\n📝 Sample .env.local configuration:')
  console.log('=' .repeat(50))
  console.log(`# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/satoru_blog

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-32-chars-min

# Admin User
ADMIN_EMAIL=admin@blog.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Blog Administrator

# Optional
JWT_SECRET=another-secret-key
NODE_ENV=development`)
}

// Check if help flag is passed
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('🔧 Environment Variables Checker for Satoru Blog')
  console.log('\nUsage:')
  console.log('  node src/Script/envCheck.js        - Validate environment variables')
  console.log('  node src/Script/envCheck.js --help - Show this help')
  console.log('  node src/Script/envCheck.js --sample - Show sample .env.local')
  process.exit(0)
}

if (process.argv.includes('--sample')) {
  generateSampleEnv()
  process.exit(0)
}

// Run validation
validateEnvironment()
