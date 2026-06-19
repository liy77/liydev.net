import { getDatabase } from './db'

export interface SiteSettings {
  id: number
  theme_mode: 'light' | 'dark' | 'system'
  theme_scope: 'both' | 'dark' | 'light'
  background_start: string
  background_end: string
  background_mid: string
  background_start_light: string
  background_end_light: string
  background_mid_light: string
  text_primary: string
  text_secondary: string
  text_muted: string
  text_primary_light: string
  text_secondary_light: string
  text_muted_light: string
  accent_color: string
  accent_color_light: string
  glass_bg: string
  glass_border: string
  glass_border_highlight: string
  glass_bg_light: string
  glass_border_light: string
  glass_border_highlight_light: string
  text_gradient_start: string
  text_gradient_mid: string | null
  text_gradient_end: string
  use_text_gradient: boolean
  glass_intensity: number
  background_image: string | null
  background_music: string | null
  music_volume: number
  background_image_credit: string | null
  background_music_credit: string | null
  updated_at: string
}

const defaultSettings: Omit<SiteSettings, 'id' | 'updated_at'> = {
  theme_mode: 'dark',
  theme_scope: 'both',
  background_start: '#0a0a0f',
  background_end: '#1a1a2e',
  background_mid: '#0f0f1a',
  background_start_light: '#f0f0f5',
  background_end_light: '#e3e3e9',
  background_mid_light: '#ebebf0',
  text_primary: '#f5f5f7',
  text_secondary: 'rgba(255, 255, 255, 0.7)',
  text_muted: 'rgba(255, 255, 255, 0.5)',
  text_primary_light: '#1d1d1f',
  text_secondary_light: 'rgba(0, 0, 0, 0.75)',
  text_muted_light: 'rgba(0, 0, 0, 0.55)',
  accent_color: '#38bdf8',
  accent_color_light: '#38bdf8',
  glass_bg: 'rgba(255, 255, 255, 0.08)',
  glass_border: 'rgba(255, 255, 255, 0.18)',
  glass_border_highlight: 'rgba(255, 255, 255, 0.35)',
  glass_bg_light: 'rgba(255, 255, 255, 0.25)',
  glass_border_light: 'rgba(0, 0, 0, 0.12)',
  glass_border_highlight_light: 'rgba(255, 255, 255, 0.7)',
  text_gradient_start: '#38bdf8',
  text_gradient_mid: null,
  text_gradient_end: '#a855f7',
  use_text_gradient: true,
  glass_intensity: 70,
  background_image: null,
  background_music: null,
  music_volume: 50,
  background_image_credit: null,
  background_music_credit: null,
}

const allColumns = Object.keys(defaultSettings)
const columnList = allColumns.join(', ')
const placeholders = allColumns.map(() => '?').join(', ')

export function getSettings(): SiteSettings {
  const db = getDatabase()
  const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get()
  if (!row) {
    db.prepare(
      `INSERT INTO site_settings (id, ${columnList}) VALUES (1, ${placeholders})`
    ).run(...allColumns.map((k) => defaultSettings[k as keyof typeof defaultSettings]))
    return db.prepare('SELECT * FROM site_settings WHERE id = 1').get() as SiteSettings
  }
  return row as SiteSettings
}

export function updateSettings(
  settings: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>
): SiteSettings {
  const db = getDatabase()
  const current = getSettings()
  const merged = { ...current, ...settings }
  db.prepare(
    `UPDATE site_settings SET
      theme_mode = ?,
      theme_scope = ?,
      background_start = ?, background_end = ?, background_mid = ?,
      background_start_light = ?, background_end_light = ?, background_mid_light = ?,
      text_primary = ?, text_secondary = ?, text_muted = ?,
      text_primary_light = ?, text_secondary_light = ?, text_muted_light = ?,
      accent_color = ?, accent_color_light = ?,
      glass_bg = ?, glass_border = ?, glass_border_highlight = ?,
      glass_bg_light = ?, glass_border_light = ?, glass_border_highlight_light = ?,
      text_gradient_start = ?, text_gradient_mid = ?, text_gradient_end = ?, use_text_gradient = ?,
      glass_intensity = ?, background_image = ?, background_music = ?, music_volume = ?,
      background_image_credit = ?, background_music_credit = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1`
  ).run(
    merged.theme_mode,
    merged.theme_scope,
    merged.background_start,
    merged.background_end,
    merged.background_mid,
    merged.background_start_light,
    merged.background_end_light,
    merged.background_mid_light,
    merged.text_primary,
    merged.text_secondary,
    merged.text_muted,
    merged.text_primary_light,
    merged.text_secondary_light,
    merged.text_muted_light,
    merged.accent_color,
    merged.accent_color_light,
    merged.glass_bg,
    merged.glass_border,
    merged.glass_border_highlight,
    merged.glass_bg_light,
    merged.glass_border_light,
    merged.glass_border_highlight_light,
    merged.text_gradient_start,
    merged.text_gradient_mid,
    merged.text_gradient_end,
    merged.use_text_gradient ? 1 : 0,
    merged.glass_intensity,
    merged.background_image,
    merged.background_music,
    merged.music_volume,
    merged.background_image_credit,
    merged.background_music_credit
  )
  return getSettings()
}

export function resetSettings(): SiteSettings {
  const db = getDatabase()
  db.prepare('DELETE FROM site_settings WHERE id = 1').run()
  return getSettings()
}
