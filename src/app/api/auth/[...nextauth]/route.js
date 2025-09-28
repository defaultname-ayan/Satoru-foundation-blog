import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '../../../../Helpers/MongoDB.js'
import User from '../../../../Models/UserModel.js'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('🔍 Attempting to authenticate user:', credentials.email)
          
          await connectDB()
          console.log('✅ Connected to database')
          
          const user = await User.findOne({ email: credentials.email })
          
          if (!user) {
            console.log('❌ No user found with email:', credentials.email)
            return null
          }
          
          console.log('✅ User found, checking password...')
          const isValidPassword = await user.comparePassword(credentials.password)
          
          if (!isValidPassword) {
            console.log('❌ Invalid password for user:', credentials.email)
            return null
          }
          
          console.log('✅ Password valid, user authenticated')
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login'
  }
  // Remove debug in production
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
