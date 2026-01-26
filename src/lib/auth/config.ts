import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

function readUsers() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2))
      return []
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users:', error)
    return []
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'dummy',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy'
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Login attempt for:', credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials')
            throw new Error('Please provide email and password')
          }

          const users = readUsers()
          console.log('📊 Total users in database:', users.length)
          
          const user = users.find((u: any) => 
            u.email.toLowerCase() === credentials.email.toLowerCase()
          )

          if (!user) {
            console.log('❌ User not found:', credentials.email)
            throw new Error('Invalid email or password')
          }

          // Check if this is an OAuth user (no password)
          if (!user.password) {
            console.log('❌ OAuth user trying to login with password:', credentials.email)
            throw new Error('This account uses Google/Facebook login. Please sign in with the same method you used to create your account.')
          }

          console.log('🔍 Comparing passwords...')
          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) {
            console.log('❌ Invalid password for:', credentials.email)
            throw new Error('Invalid email or password')
          }

          console.log('✅ Login successful:', user.email)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image || null
          }
        } catch (error: any) {
          console.error('❌ Authorization error:', error.message)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        const users = readUsers()
        const existingUser = users.find((u: any) => u.email === user.email)

        if (!existingUser) {
          const newUser = {
            id: user.email?.split('@')[0] || Date.now().toString(),
            email: user.email,
            name: user.name || 'User',
            role: 'student',
            image: user.image,
            phone: '',
            bio: '',
            university: '',
            location: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          users.push(newUser)
          fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2))
          console.log('✅ OAuth user created:', newUser.email)
        } else {
          // Update image if not set
          if (!existingUser.image && user.image) {
            existingUser.image = user.image
            existingUser.updatedAt = new Date().toISOString()
            fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2))
            console.log('✅ OAuth user image updated:', existingUser.email)
          }
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'student'
      }

      // Handle session update from client
      if (trigger === 'update' && session) {
        if (session.user?.name) token.name = session.user.name
        if (session.user?.image) token.picture = session.user.image
        
        // Update in database
        const users = readUsers()
        const userIndex = users.findIndex((u: any) => u.email === token.email)
        if (userIndex !== -1) {
          if (session.user?.name) users[userIndex].name = session.user.name
          if (session.user?.image) users[userIndex].image = session.user.image
          users[userIndex].updatedAt = new Date().toISOString()
          fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2))
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role || 'student';
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)