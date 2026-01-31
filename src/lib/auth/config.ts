import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const authOptions: NextAuthOptions = {
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!
    }),
    
    // Credentials Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password required')
          }

          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed')
          }

          return {
            id: data.user._id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatar,
            role: data.user.role,
            phone: data.user.phone,
            university: data.user.university,
            bio: data.user.bio,
            location: data.user.location,
            accessToken: data.token
          }
        } catch (error: any) {
          console.error('Auth error:', error)
          throw new Error(error.message || 'Authentication failed')
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Handle OAuth sign in
        if (account?.provider === 'google' || account?.provider === 'facebook') {
          const response = await fetch(`${API_URL}/api/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              avatar: user.image,
              provider: account.provider
            })
          })

          const data = await response.json()

          if (data.success) {
            user.id = data.user._id
            user.role = data.user.role
            ;(user as any).accessToken = data.token
            return true
          }
          
          return false
        }

        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.accessToken = (user as any).accessToken
        token.phone = (user as any).phone
        token.university = (user as any).university
        token.bio = (user as any).bio
        token.location = (user as any).location
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.name = session.user.name
        token.picture = session.user.image
        token.phone = session.user.phone
        token.university = session.user.university
        token.bio = session.user.bio
        token.location = session.user.location
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
        ;(session as any).accessToken = token.accessToken
        ;(session.user as any).phone = token.phone
        ;(session.user as any).university = token.university
        ;(session.user as any).bio = token.bio
        ;(session.user as any).location = token.location
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      // Handle OAuth redirects to always go to production URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // If redirecting to localhost from production, redirect to production instead
      if (url.includes('localhost') && baseUrl.includes('vercel.app')) {
        return baseUrl
      }
      
      // Otherwise if it's a valid callback URL, use it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      return baseUrl
    }
  },

  pages: {
    signIn: '/login',
    error: '/login'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development'
}