/**
 * Persistent posts storage.
 * - Production (Vercel): uses Upstash Redis so data survives deployments.
 * - Development / no Redis: falls back to local data/posts.json file.
 *
 * Required env vars for Redis (set in Vercel dashboard + .env.local):
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import fs from 'fs'
import path from 'path'

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json')
const POSTS_KEY = 'baytino:posts'

const NOTIF_FILE = path.join(process.cwd(), 'data', 'notifications.json')
const NOTIF_KEY = 'baytino:notifications'

// ── Redis client (lazy init) ──────────────────────────────────────────────────
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
  } catch {
    return null
  }
}

// ── File helpers (local fallback) ─────────────────────────────────────────────
function readFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) return defaultValue
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return defaultValue
  }
}

function writeFile(filePath: string, data: any) {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Error writing file:', filePath, err)
  }
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export async function readPosts(): Promise<any[]> {
  try {
    const redis = await getRedis()
    if (redis) {
      const posts = await redis.get(POSTS_KEY)
      if (posts) return Array.isArray(posts) ? posts : JSON.parse(posts)
      // First run: seed from local file if exists
      const localPosts = readFile<any[]>(POSTS_FILE, [])
      if (localPosts.length > 0) {
        await redis.set(POSTS_KEY, JSON.stringify(localPosts))
        return localPosts
      }
      return []
    }
    return readFile<any[]>(POSTS_FILE, [])
  } catch {
    return readFile<any[]>(POSTS_FILE, [])
  }
}

export async function writePosts(posts: any[]): Promise<void> {
  try {
    const redis = await getRedis()
    if (redis) {
      await redis.set(POSTS_KEY, JSON.stringify(posts))
      // Also keep local file in sync (useful for git snapshot / backup)
      writeFile(POSTS_FILE, posts)
      return
    }
    writeFile(POSTS_FILE, posts)
  } catch (err) {
    console.error('Error writing posts:', err)
    // Fallback to file even if redis failed
    writeFile(POSTS_FILE, posts)
  }
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function readNotifications(): Promise<Record<string, any[]>> {
  try {
    const redis = await getRedis()
    if (redis) {
      const data = await redis.get(NOTIF_KEY)
      if (data) return typeof data === 'string' ? JSON.parse(data) : (data as Record<string, any[]>)
      const local = readFile<Record<string, any[]>>(NOTIF_FILE, {})
      if (Object.keys(local).length > 0) {
        await redis.set(NOTIF_KEY, JSON.stringify(local))
        return local
      }
      return {}
    }
    return readFile<Record<string, any[]>>(NOTIF_FILE, {})
  } catch {
    return readFile<Record<string, any[]>>(NOTIF_FILE, {})
  }
}

export async function writeNotifications(data: Record<string, any[]>): Promise<void> {
  try {
    const redis = await getRedis()
    if (redis) {
      await redis.set(NOTIF_KEY, JSON.stringify(data))
      writeFile(NOTIF_FILE, data)
      return
    }
    writeFile(NOTIF_FILE, data)
  } catch (err) {
    console.error('Error writing notifications:', err)
    writeFile(NOTIF_FILE, data)
  }
}

export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}
