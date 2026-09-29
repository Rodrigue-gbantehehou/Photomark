import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings'

const SETTINGS_KEY = 'photomark_settings'
const LOGO_LS_KEY = 'photomark_logo'
const DB_NAME = 'photomark_db'
const DB_STORE = 'assets'
const DB_KEY = 'logo'

// ─── Deep merge helper ────────────────────────────────────────────────────────

function deepMerge<T extends object>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults }
  for (const key in overrides) {
    const val = overrides[key]
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = deepMerge(
        (defaults[key] as object) ?? {},
        val as object
      ) as T[typeof key]
    } else if (val !== undefined) {
      result[key] = val as T[typeof key]
    }
  }
  return result
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function saveSettings(settings: AppSettings): void {
  try {
    // Exclude logo dataUrl from settings JSON — stored separately
    const toSave = { ...settings, logo: { ...settings.logo, dataUrl: null } }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('[Photomark] Could not save settings:', e)
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return deepMerge(DEFAULT_SETTINGS, parsed)
  } catch {
    return DEFAULT_SETTINGS
  }
}

// ─── IndexedDB helper ─────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

export async function saveLogo(dataUrl: string | null): Promise<void> {
  if (!dataUrl) {
    try { localStorage.removeItem(LOGO_LS_KEY) } catch {}
    try {
      const db = await openDB()
      const tx = db.transaction(DB_STORE, 'readwrite')
      tx.objectStore(DB_STORE).delete(DB_KEY)
    } catch {}
    return
  }

  // Try localStorage first (quick access), fall back to IndexedDB for large logos
  try {
    localStorage.setItem(LOGO_LS_KEY, dataUrl)
  } catch {
    // localStorage quota exceeded — use IndexedDB
    try { localStorage.removeItem(LOGO_LS_KEY) } catch {}
    try {
      const db = await openDB()
      const tx = db.transaction(DB_STORE, 'readwrite')
      tx.objectStore(DB_STORE).put(dataUrl, DB_KEY)
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res()
        tx.onerror = () => rej(tx.error)
      })
    } catch (e) {
      console.warn('[Photomark] Could not persist logo:', e)
    }
  }
}

export async function loadLogo(): Promise<string | null> {
  // 1. Try localStorage
  try {
    const val = localStorage.getItem(LOGO_LS_KEY)
    if (val) return val
  } catch {}

  // 2. Try IndexedDB
  try {
    const db = await openDB()
    return new Promise<string | null>((resolve) => {
      const tx = db.transaction(DB_STORE, 'readonly')
      const req = tx.objectStore(DB_STORE).get(DB_KEY)
      req.onsuccess = () => resolve((req.result as string) ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}
