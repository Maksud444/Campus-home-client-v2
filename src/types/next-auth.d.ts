import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      phone?: string | null
      university?: string | null
      bio?: string | null
      location?: string | null
    } & DefaultSession['user']
    accessToken?: string
  }

  interface User extends DefaultUser {
    id: string
    role: string
    phone?: string | null
    university?: string | null
    bio?: string | null
    location?: string | null
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    phone?: string | null
    university?: string | null
    bio?: string | null
    location?: string | null
    accessToken?: string
  }
}