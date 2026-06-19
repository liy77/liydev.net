import { getDatabase } from './db'
import type { SiteSettings } from './settings'

export interface ThemePreset {
  id: number
  name: string
  settings: SiteSettings
  created_at: string
}

export function listPresets(): ThemePreset[] {
  const db = getDatabase()
  const rows = db.prepare('SELECT * FROM theme_presets ORDER BY created_at DESC').all()
  return rows.map((row) => ({
    ...(row as ThemePreset),
    settings: JSON.parse((row as { settings: string }).settings),
  }))
}

export function createPreset(name: string, settings: Record<string, unknown>): ThemePreset {
  const db = getDatabase()
  const info = db
    .prepare('INSERT INTO theme_presets (name, settings) VALUES (?, ?)')
    .run(name, JSON.stringify(settings))
  const row = db.prepare('SELECT * FROM theme_presets WHERE id = ?').get(info.lastInsertRowid)
  return {
    ...(row as ThemePreset),
    settings: JSON.parse((row as { settings: string }).settings),
  }
}

export function deletePreset(id: number): void {
  const db = getDatabase()
  db.prepare('DELETE FROM theme_presets WHERE id = ?').run(id)
}
