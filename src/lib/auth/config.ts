import 'server-only'

import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'users.json')

/* ======================
   FILE HELPERS (LOCAL ONLY)
====================== */

function readUsers() {
  if (isProd) return []

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2))
      return []
    }

    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('❌ readUsers error:', err)
    return []
  }
}

function writeUsers(users: any[]) {
  if (isProd) return
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2))
}

/* ======================
   NEXT AUTH CONFIG
====================== */

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'dummy',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy',
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (isProd) {
          throw new Error('Credentials login disabled in production')
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const users = readUsers()

        const user = users.find(
          (u: any) =>
            u.email.toLowerCase() === credentials.email.toLowerCase()
        )

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image || null,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (
        !isProd &&
        (account?.provider === 'google' ||
          account?.provider === 'facebook')
      ) {
        const users = readUsers()
        const existingUser = users.find(
          (u: any) => u.email === user.email
        )

        if (!existingUser) {
          users.push({
            id: user.email?.split('@')[0] ?? Date.now().toString(),
            email: user.email,
            name: user.name || 'User',
            role: 'student',
            image: user.image,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          writeUsers(users)
        }
      }

      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role || 'student'
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
