import fs from 'fs'
import path from 'path'

const ADMINS_FILE = path.join(process.cwd(), 'data', 'admins.json')
const ADMINS_KEY = 'baytino:admins'

// ── Redis client (lazy init, same pattern as posts-store.ts) ─────────────────
let _redis: any = null
async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (_redis) return _redis
  try {
    const { Redis } = await import('@upstash/redis')
    _redis = new Redis({ url, token })
    return _redis
  } catch { return null }
}

export interface LocalAdmin {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  createdBy: string  // 'local-admin' = main admin created this
  isActive: boolean
}

// ── File helpers ──────────────────────────────────────────────────────────────
function readFromFile(): LocalAdmin[] {
  try {
    if (!fs.existsSync(ADMINS_FILE)) {
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
      fs.writeFileSync(ADMINS_FILE, JSON.stringify([], null, 2))
      return []
    }
    return JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf-8'))
  } catch { return [] }
}

function writeToFile(admins: LocalAdmin[]) {
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2))
  } catch (err) {
    console.error('Error writing admins:', err)
  }
}

// ── Public API (async, Redis-first) ──────────────────────────────────────────
export async function readAdmins(): Promise<LocalAdmin[]> {
  try {
    const redis = await getRedis()
    if (redis) {
      const data = await redis.get(ADMINS_KEY)
      if (data) return Array.isArray(data) ? data : JSON.parse(data)
      // First run: seed from local file if it has data
      const local = readFromFile()
      if (local.length > 0) {
        await redis.set(ADMINS_KEY, JSON.stringify(local))
        return local
      }
      return []
    }
    return readFromFile()
  } catch { return readFromFile() }
}

export async function writeAdmins(admins: LocalAdmin[]): Promise<void> {
  try {
    const redis = await getRedis()
    if (redis) {
      await redis.set(ADMINS_KEY, JSON.stringify(admins))
      writeToFile(admins)   // keep local file in sync as backup
      return
    }
    writeToFile(admins)
  } catch (err) {
    console.error('Error writing admins:', err)
    writeToFile(admins)
  }
}
