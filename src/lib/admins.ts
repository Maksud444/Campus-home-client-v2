import fs from 'fs'
import path from 'path'

const ADMINS_FILE = path.join(process.cwd(), 'data', 'admins.json')

export interface LocalAdmin {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  createdBy: string  // 'local-admin' = main admin created this
  isActive: boolean
}

export function readAdmins(): LocalAdmin[] {
  try {
    if (!fs.existsSync(ADMINS_FILE)) {
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
      fs.writeFileSync(ADMINS_FILE, JSON.stringify([], null, 2))
      return []
    }
    return JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

export function writeAdmins(admins: LocalAdmin[]) {
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2))
  } catch (error) {
    console.error('Error writing admins:', error)
  }
}
