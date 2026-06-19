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

export function seedDefaultPresets(): void {
  const db = getDatabase()

  const ocarinaSettings = {
    theme_mode: 'dark',
    background_start: '#0d2b1d',
    background_mid: '#1a3c28',
    background_end: '#2c1e12',
    background_start_light: '#d4e8d0',
    background_mid_light: '#e0e8c8',
    background_end_light: '#f0e6c8',
    text_primary: '#f5ecd9',
    text_secondary: 'rgba(245, 236, 217, 0.75)',
    text_muted: 'rgba(245, 236, 217, 0.55)',
    text_primary_light: '#1a2f1f',
    text_secondary_light: 'rgba(26, 47, 31, 0.75)',
    text_muted_light: 'rgba(26, 47, 31, 0.55)',
    accent_color: '#f6c946',
    accent_color_light: '#c69a1e',
    glass_bg: 'rgba(80, 140, 90, 0.15)',
    glass_border: 'rgba(246, 201, 70, 0.25)',
    glass_border_highlight: 'rgba(246, 201, 70, 0.45)',
    glass_bg_light: 'rgba(255, 255, 255, 0.35)',
    glass_border_light: 'rgba(26, 47, 31, 0.12)',
    glass_border_highlight_light: 'rgba(246, 201, 70, 0.6)',
    text_gradient_start: '#f6c946',
    text_gradient_end: '#4ade80',
    use_text_gradient: true,
    glass_intensity: 75,
    background_image: '/uploads/presets/ocarina-of-time-bg.jpg',
    background_music: '/uploads/presets/sarias-theme.mp3',
    music_volume: 50,
  }

  const existing = db.prepare('SELECT id FROM theme_presets WHERE name = ?').get('Ocarina of Time — Remake')
  if (existing) {
    db.prepare('UPDATE theme_presets SET settings = ? WHERE id = ?').run(
      JSON.stringify(ocarinaSettings),
      (existing as { id: number }).id
    )
  } else {
    db.prepare('INSERT INTO theme_presets (name, settings) VALUES (?, ?)').run(
      'Ocarina of Time — Remake',
      JSON.stringify(ocarinaSettings)
    )
  }
}
