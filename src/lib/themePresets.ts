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

  // Tema de floresta (Lost Woods) — combina com a Saria's Song. Por ser uma
  // ambientação escura (texto claro sobre floresta escura), o escopo é "dark":
  // o modo claro deixaria o texto escuro ilegível sobre a imagem de fundo.
  const ocarinaSettings = {
    theme_mode: 'dark',
    theme_scope: 'dark',
    // gradiente de fallback (atrás da imagem): floresta profunda
    background_start: '#0b1d11',
    background_mid: '#0d2417',
    background_end: '#06120c',
    background_start_light: '#dcebcf',
    background_mid_light: '#e7edcb',
    background_end_light: '#f2ead0',
    // texto: pergaminho quente
    text_primary: '#f7efda',
    text_secondary: 'rgba(247, 239, 218, 0.92)',
    text_muted: 'rgba(247, 239, 218, 0.74)',
    text_primary_light: '#15301d',
    text_secondary_light: 'rgba(21, 48, 29, 0.78)',
    text_muted_light: 'rgba(21, 48, 29, 0.55)',
    // acento: dourado Triforce
    accent_color: '#f4c64a',
    accent_color_light: '#b8881a',
    // glass com tom esverdeado sutil + borda dourada
    glass_bg: 'rgba(38, 92, 56, 0.17)',
    glass_border: 'rgba(244, 198, 74, 0.28)',
    glass_border_highlight: 'rgba(244, 198, 74, 0.50)',
    glass_bg_light: 'rgba(255, 255, 255, 0.38)',
    glass_border_light: 'rgba(21, 48, 29, 0.12)',
    glass_border_highlight_light: 'rgba(184, 136, 26, 0.55)',
    // gradiente de texto: dourado -> verde Kokiri
    text_gradient_start: '#f4c64a',
    text_gradient_end: '#6fcf7a',
    use_text_gradient: true,
    glass_intensity: 72,
    background_image: '/uploads/presets/kokiri-forest-bg.jpg',
    background_music: '/uploads/presets/sarias-theme.mp3',
    music_volume: 45,
    background_image_credit: 'Kokiri Forest — The Legend of Zelda: Ocarina of Time © Nintendo',
    background_music_credit: "Saria's Song — The Legend of Zelda © Nintendo",
  }

  // Tema Kill la Kill — vermelho carmesim + preto + dourado, com fundo de raios
  // (sunburst) original gerado por código (sem usar arte protegida do Studio Trigger).
  const killLaKillSettings = {
    theme_mode: 'dark',
    theme_scope: 'dark',
    background_start: '#1a0306',
    background_mid: '#2a0408',
    background_end: '#0a0203',
    background_start_light: '#fbe9ea',
    background_mid_light: '#f6d9da',
    background_end_light: '#ffffff',
    text_primary: '#f7f0e6',
    text_secondary: 'rgba(247, 240, 230, 0.90)',
    text_muted: 'rgba(247, 240, 230, 0.70)',
    text_primary_light: '#1a0306',
    text_secondary_light: 'rgba(26, 3, 6, 0.80)',
    text_muted_light: 'rgba(26, 3, 6, 0.55)',
    accent_color: '#e60012',
    accent_color_light: '#b00010',
    glass_bg: 'rgba(120, 12, 20, 0.22)',
    glass_border: 'rgba(230, 0, 18, 0.40)',
    glass_border_highlight: 'rgba(255, 211, 0, 0.55)',
    glass_bg_light: 'rgba(255, 255, 255, 0.40)',
    glass_border_light: 'rgba(176, 0, 16, 0.20)',
    glass_border_highlight_light: 'rgba(230, 0, 18, 0.55)',
    text_gradient_start: '#e60012',
    text_gradient_mid: '#ffffff',
    text_gradient_end: '#ffd60a',
    use_text_gradient: true,
    glass_intensity: 60,
    background_image: '/uploads/presets/kill-la-kill-bg.jpg',
    background_music: null,
    music_volume: 50,
    background_image_credit: 'KILL la KILL © TRIGGER / Kazuki Nakashima',
    background_music_credit: null,
  }

  // Remove nomes legados para não duplicar.
  db.prepare('DELETE FROM theme_presets WHERE name = ?').run('Ocarina of Time — Remake')

  const upsertPreset = (name: string, settings: Record<string, unknown>) => {
    const existing = db.prepare('SELECT id FROM theme_presets WHERE name = ?').get(name)
    if (existing) {
      db.prepare('UPDATE theme_presets SET settings = ? WHERE id = ?').run(
        JSON.stringify(settings),
        (existing as { id: number }).id
      )
    } else {
      db.prepare('INSERT INTO theme_presets (name, settings) VALUES (?, ?)').run(
        name,
        JSON.stringify(settings)
      )
    }
  }

  upsertPreset('Ocarina of Time', ocarinaSettings)
  upsertPreset('Kill la Kill', killLaKillSettings)
}
