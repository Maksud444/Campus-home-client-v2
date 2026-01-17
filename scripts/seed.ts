import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const users = [
  { name: 'Ahmed Hassan', email: 'student@test.com', password: 'student123', role: 'student' },
  { name: 'Sarah Mohamed', email: 'sarah@test.com', password: 'sarah123', role: 'student' },
  { name: 'Omar Ali', email: 'omar@test.com', password: 'omar123', role: 'student' },
  { name: 'Mohamed Ali', email: 'agent@test.com', password: 'agent123', role: 'agent' },
  { name: 'Fatima Ahmed', email: 'fatima@test.com', password: 'fatima123', role: 'agent' },
  { name: 'Youssef Ibrahim', email: 'owner@test.com', password: 'owner123', role: 'owner' },
  { name: 'Laila Khalil', email: 'laila@test.com', password: 'laila123', role: 'owner' },
]

async function seed() {
  console.log('🌱 Creating test users...')
  
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  const allUsers = await Promise.all(
    users.map(async (u, i) => ({
      id: (Date.now() + i).toString(),
      name: u.name,
      email: u.email,
      password: await bcrypt.hash(u.password, 12),
      role: u.role,
      provider: 'credentials',
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=219ebc&color=fff`,
      createdAt: new Date().toISOString()
    }))
  )
  
  fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(allUsers, null, 2))
  
  console.log('✅ Created 7 users')
  console.log('\n📋 Test Accounts:')
  console.log('🎓 student@test.com / student123')
  console.log('👨‍💼 agent@test.com / agent123')
  console.log('🏠 owner@test.com / owner123')
  console.log('\n✨ Login at: http://localhost:3000/login\n')
}

seed().catch(console.error)