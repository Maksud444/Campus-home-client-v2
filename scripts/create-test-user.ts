import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

async function createTestUser() {
  console.log('🌱 Creating test user manually...')
  
  const dataDir = path.join(process.cwd(), 'data')
  const usersFile = path.join(dataDir, 'users.json')
  
  // Create directory
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log('✅ Created data directory')
  }
  
  // Hash password
  const password = 'student123'
  const hashedPassword = await bcrypt.hash(password, 12)
  console.log('✅ Password hashed')
  
  // Create user
  const user = {
    id: Date.now().toString(),
    name: 'Ahmed Hassan',
    email: 'student@test.com',
    password: hashedPassword,
    role: 'student',
    provider: 'credentials',
    image: 'https://ui-avatars.com/api/?name=Ahmed+Hassan&background=219ebc&color=fff',
    createdAt: new Date().toISOString()
  }
  
  // Save to file
  const users = [user]
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
  
  console.log('✅ Test user created!')
  console.log('\n📋 Login Details:')
  console.log('Email: student@test.com')
  console.log('Password: student123')
  console.log('\n📂 File saved at:', usersFile)
  
  // Verify
  const savedData = fs.readFileSync(usersFile, 'utf-8')
  const savedUsers = JSON.parse(savedData)
  console.log('\n✅ Verification:')
  console.log('Users in file:', savedUsers.length)
  console.log('First user email:', savedUsers[0].email)
}

createTestUser().catch(console.error)