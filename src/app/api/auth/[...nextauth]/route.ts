import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const MONGODB_URI = process.env.MONGODB_URI || ''

const handler = NextAuth({
  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          console.log('🔐 Attempting login for:', credentials.email)

          // Try MongoDB direct lookup first (for credentials-based accounts)
          if (MONGODB_URI) {
            try {
              console.log('🔍 Checking MongoDB for credentials...')
              const client = new MongoClient(MONGODB_URI)
              await client.connect()
              
              // Try different database names
              let db = client.db('test') // Try 'test' first
              let collections = await db.listCollections().toArray()
              
              if (collections.length === 0) {
                db = client.db('campus-egypt')
                collections = await db.listCollections().toArray()
              }
              
              if (collections.length === 0) {
                db = client.db('campus-home')
              }
              
              console.log(`📂 Using database: ${db.databaseName}`)
              
              const user = await db.collection('users').findOne({ email: credentials.email })
              
              console.log('📊 MongoDB user found:', user ? '✅ Yes' : '❌ No')
              if (user) {
                console.log('👤 User data:', { 
                  email: user.email, 
                  hasPassword: !!user.password, 
                  provider: user.provider 
                })
              }
              
              await client.close()

              if (user && user.password) {
                console.log('✅ Found user with password in MongoDB')
                const passwordMatch = await bcrypt.compare(credentials.password, user.password)
                
                if (passwordMatch) {
                  console.log('✅ Password match! Login successful!')
                  return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.avatar || user.image,
                  }
                } else {
                  console.log('❌ Password mismatch')
                }
              } else {
                console.log('⚠️ User found but no password field or user not found')
              }
            } catch (dbError) {
              console.error('MongoDB lookup error:', dbError)
              // Fall through to backend auth
            }
          } else {
            console.log('⚠️ MONGODB_URI not configured')
          }

          // Fall back to backend API
          console.log('🌐 Backend URL:', `${API_URL}/api/auth/login`)
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await res.json()
          console.log('📥 Backend response:', data)

          if (!res.ok) {
            console.error('❌ Login failed:', data.message)
            throw new Error(data.message || 'Invalid credentials')
          }

          if (data.success && data.user) {
            console.log('✅ Backend login successful!')
            
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              image: data.user.avatar,
              token: data.token,
            }
          }

          throw new Error('Invalid response from server')
        } catch (error: any) {
          console.error('❌ Auth error:', error.message)
          throw new Error(error.message || 'Authentication failed')
        }
      },
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        if (user.token) {
          token.backendToken = user.token
        }
      }

      // OAuth sign in
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          // Register/Login with backend
          const res = await fetch(`${API_URL}/api/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: token.email,
              name: token.name,
              avatar: token.picture,
              provider: account.provider,
              providerId: account.providerAccountId,
            }),
          })

          const data = await res.json()
          if (data.success && data.token) {
            token.backendToken = data.token
            token.role = data.user.role
          }
        } catch (error) {
          console.error('OAuth backend error:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.backendToken = token.backendToken as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }