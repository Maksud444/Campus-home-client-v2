import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password')
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'
          
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await res.json()

          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Login failed')
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            image: data.user.avatar,
            phone: data.user.phone,
            university: data.user.university,
            bio: data.user.bio,
            location: data.user.location,
            accessToken: data.token
          }
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed')
        }
      }
    })
  ],
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('🔑 JWT Callback triggered')
      console.log('- Trigger:', trigger)
      
      // Initial sign in
      if (user) {
        console.log('- User sign in, updating token')
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.university = (user as any).university
        token.bio = (user as any).bio
        token.location = (user as any).location
        token.picture = user.image
        token.accessToken = (user as any).accessToken
      }

      // Handle session update from client
      if (trigger === 'update' && session) {
        console.log('- Session update triggered from client')
        console.log('- New session data:', session)
        
        // Update token with new session data
        if (session.user) {
          token.name = session.user.name || token.name
          token.picture = session.user.image || token.picture
          token.phone = session.user.phone || token.phone
          token.university = session.user.university || token.university
          token.bio = session.user.bio || token.bio
          token.location = session.user.location || token.location
        }
      }

      console.log('- Final token:', {
        id: token.id,
        name: token.name,
        role: token.role,
        picture: token.picture
      })
      
      return token
    },
    
    async session({ session, token }) {
      console.log('📝 Session Callback triggered')
      
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
        session.user.university = token.university as string
        session.user.bio = token.bio as string
        session.user.location = token.location as string
        session.user.image = token.picture as string
        session.accessToken = token.accessToken as string
      }
      
      console.log('- Final session user:', {
        name: session.user?.name,
        image: session.user?.image
      })
      
      return session
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
  debug: true,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }