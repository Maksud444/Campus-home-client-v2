import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),

    // Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),

    // Email/Password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called')

        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const email = credentials.email.trim().toLowerCase()
          const user = getUserByEmail(email)

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          console.log('🔐 OAuth sign in:', account.provider)
          
          const existingUser = getUserByEmail(user.email!)

          if (!existingUser) {
            // Create new user for OAuth
            console.log('👤 Creating new OAuth user')
            createUser({
              name: user.name || 'User',
              email: user.email!,
              password: '', // No password for OAuth users
              image: user.image,
              role: 'student', // Default role for OAuth
              provider: account.provider
            })
          }
        } catch (error) {
          console.error('❌ OAuth sign in error:', error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role || 'student'
      }
      
      // For OAuth, get role from database
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          const dbUser = getUserByEmail(token.email!)
          if (dbUser) {
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('❌ Error fetching user role:', error)
        }
      }
      
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this',
}