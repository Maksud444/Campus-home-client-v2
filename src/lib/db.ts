import fs from 'fs'
import path from 'path'

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'student' | 'agent' | 'owner'
  image?: string
  provider: string
  createdAt: string
}

const ensureDataDir = () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      console.log('📁 Creating data directory...')
      fs.mkdirSync(dataDir, { recursive: true })
    }
    if (!fs.existsSync(usersFilePath)) {
      console.log('📄 Creating users.json file...')
      fs.writeFileSync(usersFilePath, JSON.stringify([]))
    }
  } catch (error) {
    console.error('❌ Error ensuring data directory:', error)
  }
}

export const getUsers = (): User[] => {
  try {
    ensureDataDir()
    const data = fs.readFileSync(usersFilePath, 'utf-8')
    const users = JSON.parse(data)
    console.log(`📊 Found ${users.length} users in database`)
    return users
  } catch (error) {
    console.error('❌ Error reading users:', error)
    return []
  }
}

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail)
  console.log(`🔍 Search for ${normalizedEmail}:`, user ? 'FOUND' : 'NOT FOUND')
  return user
}

export const createUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  try {
    ensureDataDir()
    const users = getUsers()
    
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
    console.log('✅ User created:', newUser.email)
    
    return newUser
  } catch (error) {
    console.error('❌ Error creating user:', error)
    throw error
  }
}