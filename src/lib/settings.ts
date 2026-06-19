import { getDatabase } from './db'

export interface SiteSettings {
  id: number
  background_start: string
  background_end: string
  background_mid: string
  text_primary: string
  text_secondary: string
  text_muted: string
  accent_color: string
  glass_bg: string
  glass_border: string
  glass_border_highlight: string
  background_image: string | null
  updated_at: string
}

const defaultSettings: Omit<SiteSettings, 'id' | 'updated_at'> = {
  background_start: '#0a0a0f',
  background_end: '#1a1a2e',
  background_mid: '#0f0f1a',
  text_primary: '#f5f5f7',
  text_secondary: 'rgba(255, 255, 255, 0.7)',
  text_muted: 'rgba(255, 255, 255, 0.5)',
  accent_color: '#38bdf8',
  glass_bg: 'rgba(255, 255, 255, 0.08)',
  glass_border: 'rgba(255, 255, 255, 0.18)',
  glass_border_highlight: 'rgba(255, 255, 255, 0.35)',
  background_image: null,
}

export function getSettings(): SiteSettings {
  const db = getDatabase()
  const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get()
  if (!row) {
    db.prepare(
      `INSERT INTO site_settings (id, background_start, background_end, background_mid, text_primary, text_secondary, text_muted, accent_color, glass_bg, glass_border, glass_border_highlight, background_image)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      defaultSettings.background_start,
      defaultSettings.background_end,
      defaultSettings.background_mid,
      defaultSettings.text_primary,
      defaultSettings.text_secondary,
      defaultSettings.text_muted,
      defaultSettings.accent_color,
      defaultSettings.glass_bg,
      defaultSettings.glass_border,
      defaultSettings.glass_border_highlight,
      defaultSettings.background_image
    )
    return db.prepare('SELECT * FROM site_settings WHERE id = 1').get() as SiteSettings
  }
  return row as SiteSettings
}

export function updateSettings(settings: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>): SiteSettings {
  const db = getDatabase()
  const current = getSettings()
  const merged = { ...current, ...settings }
  db.prepare(
    `UPDATE site_settings SET
      background_start = ?, background_end = ?, background_mid = ?,
      text_primary = ?, text_secondary = ?, text_muted = ?,
      accent_color = ?,
      glass_bg = ?, glass_border = ?, glass_border_highlight = ?,
      background_image = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1`
  ).run(
    merged.background_start,
    merged.background_end,
    merged.background_mid,
    merged.text_primary,
    merged.text_secondary,
    merged.text_muted,
    merged.accent_color,
    merged.glass_bg,
    merged.glass_border,
    merged.glass_border_highlight,
    merged.background_image
  )
  return getSettings()
}

export function resetSettings(): SiteSettings {
  const db = getDatabase()
  db.prepare('DELETE FROM site_settings WHERE id = 1').run()
  return getSettings()
}
