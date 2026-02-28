import fs from 'fs'
import path from 'path'

const STATS_FILE = path.join(process.cwd(), 'data', 'property-stats.json')

export type StatsEntry = { views: number; likes: string[] }

// Module-level store — shared across ALL requests in the same Node.js process
export const store: Record<string, StatsEntry> = {}
let initialized = false

export function ensureInitialized() {
  if (initialized) return
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data: Record<string, StatsEntry> = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'))
      Object.assign(store, data)
    }
  } catch {
    // If file read fails, start with empty store — writes will still work in memory
  }
  initialized = true
}

export function persist() {
  try {
    const dir = path.dirname(STATS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(STATS_FILE, JSON.stringify(store, null, 2))
  } catch (e) {
    // File write failure is non-fatal — data is still in memory for this process lifetime
    console.error('Stats: file persist failed (data still in memory):', e)
  }
}
