export interface User {
  _id?: string
  name: string
  email: string
  password?: string
  role: 'student' | 'agent' | 'owner'
  image?: string
  provider?: 'credentials' | 'google' | 'facebook'
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserRegistration {
  name: string
  email: string
  password: string
  role: 'student' | 'agent' | 'owner'
}
