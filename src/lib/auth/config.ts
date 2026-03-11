import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

export const authOptions: NextAuthOptions = {
  providers: [
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

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!
    }),

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

          // ── Local admin override (credentials from env vars) ──
          const adminEmail = process.env.ADMIN_EMAIL
          const adminPassword = process.env.ADMIN_PASSWORD
          console.log('🔑 Admin login check:', {
            hasAdminEmail: !!adminEmail,
            hasAdminPassword: !!adminPassword,
            adminEmailLen: adminEmail?.length,
            adminPasswordLen: adminPassword?.length,
            inputEmail: credentials.email,
            emailMatch: credentials.email.toLowerCase() === adminEmail?.toLowerCase(),
            passwordMatch: credentials.password === adminPassword,
          })
          if (
            adminEmail &&
            adminPassword &&
            credentials.email.toLowerCase() === adminEmail.toLowerCase() &&
            credentials.password === adminPassword
          ) {
            console.log('✅ Admin override: login successful')
            return {
              id: 'local-admin',
              email: adminEmail,
              name: process.env.ADMIN_NAME || 'Admin',
              role: 'admin',
              image: '',
              backendToken: '',
            } as any
          }
          console.log('⚠️ Admin override failed, checking local admins...')

          // ── Check locally-created admins (stored in Redis/file) ──
          try {
            const { readAdmins } = await import('@/lib/admins')
            const bcryptLib = await import('bcryptjs')
            const localAdmins = await readAdmins()
            const localAdmin = localAdmins.find(
              a => a.isActive && a.email.toLowerCase() === credentials.email.toLowerCase()
            )
            if (localAdmin) {
              const match = await bcryptLib.default.compare(credentials.password, localAdmin.passwordHash)
              if (match) {
                console.log('✅ Local admin login:', localAdmin.email)
                return {
                  id: localAdmin.id,
                  email: localAdmin.email,
                  name: localAdmin.name,
                  role: 'admin',
                  image: '',
                  backendToken: '',
                } as any
              }
            }
          } catch (err) {
            console.error('Local admin check error:', err)
          }

          console.log('⚠️ No local admin match, trying backend...')

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
            throw new Error(data.message || `Login failed (${response.status})`)
          }

          const user = data.user
          return {
            id: user._id || user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar || user.image,
            backendToken: data.token || data.accessToken || ''
          }
        } catch (error: any) {
          throw new Error(error.message)
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth providers (Google/Facebook)
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          console.log('🔐 OAuth signin:', { provider: account.provider, email: user.email })
          
          const response = await fetch(`${API_URL}/api/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider
            })
          })

          const data = await response.json()
          console.log('📥 OAuth backend response:', data)

          if (!response.ok || !data.success) {
            console.error('❌ OAuth backend failed:', data.message)
            return false
          }

          // Update user object with backend data
          user.id = data.user._id || data.user.id
          user.role = data.user.role || 'student'
          
          console.log('✅ OAuth signin successful')
          return true

        } catch (error) {
          console.error('❌ OAuth error:', error)
          return false
        }
      }

      // Allow credentials login
      return true
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role || 'student'
        token.image = user.image
        token.backendToken = (user as any).backendToken || ''
      }

      // Session update trigger
      if (trigger === 'update' && session) {
        token.name = session.user?.name || token.name
        token.picture = session.user?.image || token.picture
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        ;(session.user as any).backendToken = token.backendToken as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Allow callback URLs on same origin
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
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
  debug: process.env.NODE_ENV === 'development'
}