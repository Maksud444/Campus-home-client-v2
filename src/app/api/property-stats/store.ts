import fs from 'fs'
import path from 'path'

const STATS_FILE = path.join(process.cwd(), 'data', 'property-stats.json')

export type StatsEntry = { views: number; likes: string[] }

// globalThis is shared across ALL Next.js route bundles in the same process.
// Module-level variables are NOT shared between separate route handler bundles.
declare global {
  // eslint-disable-next-line no-var
  var __propertyStats: Record<string, StatsEntry> | undefined
  // eslint-disable-next-line no-var
  var __propertyStatsInit: boolean | undefined
}

function getRawStore(): Record<string, StatsEntry> {
  if (!globalThis.__propertyStats) globalThis.__propertyStats = {}
  return globalThis.__propertyStats
}

export function ensureInitialized() {
  if (globalThis.__propertyStatsInit) return
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8')) as Record<string, StatsEntry>
      Object.assign(getRawStore(), data)
    }
  } catch {
    // file missing / corrupt — start fresh, still works in memory
  }
  globalThis.__propertyStatsInit = true
}

export function getStore(): Record<string, StatsEntry> {
  ensureInitialized()
  return getRawStore()
}

export function persist() {
  try {
    const dir = path.dirname(STATS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(STATS_FILE, JSON.stringify(getRawStore(), null, 2))
  } catch (e) {
    // non-fatal: data is still live in globalThis for this process lifetime
    console.error('Stats: file persist failed (data still in memory):', e)
  }
}
