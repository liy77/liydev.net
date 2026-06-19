import type { SiteSettings } from './settings'

export type ThemeMode = 'light' | 'dark'

function parseRgba(rgba: string): { r: number; g: number; b: number; a: number } | null {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!m) return null
  return {
    r: parseInt(m[1], 10),
    g: parseInt(m[2], 10),
    b: parseInt(m[3], 10),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  }
}

export function rgbaToHex(rgba: string): string {
  const c = parseRgba(rgba)
  if (!c) return rgba.startsWith('#') ? rgba.slice(0, 7) : '#000000'
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`
}

export function getActiveMode(settings: SiteSettings): ThemeMode {
  if (settings.theme_mode === 'system') {
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return settings.theme_mode
}

export function applySettingsToCSS(
  settings: SiteSettings,
  mode?: ThemeMode
): ThemeMode {
  const root = document.documentElement
  const activeMode = mode || getActiveMode(settings)
  const isLight = activeMode === 'light'

  root.classList.toggle('light', isLight)
  root.classList.toggle('dark', !isLight)

  root.style.setProperty('--background-start', isLight ? settings.background_start_light : settings.background_start)
  root.style.setProperty('--background-end', isLight ? settings.background_end_light : settings.background_end)
  root.style.setProperty('--background-mid', isLight ? settings.background_mid_light : settings.background_mid)
  root.style.setProperty('--text-primary', isLight ? settings.text_primary_light : settings.text_primary)
  root.style.setProperty('--text-secondary', isLight ? settings.text_secondary_light : settings.text_secondary)
  root.style.setProperty('--text-muted', isLight ? settings.text_muted_light : settings.text_muted)
  root.style.setProperty('--accent-blue', isLight ? settings.accent_color_light : settings.accent_color)
  root.style.setProperty('--accent-purple', settings.text_gradient_end)
  root.style.setProperty('--glass-bg', isLight ? settings.glass_bg_light : settings.glass_bg)
  root.style.setProperty('--glass-border', isLight ? settings.glass_border_light : settings.glass_border)
  root.style.setProperty('--glass-border-highlight', isLight ? settings.glass_border_highlight_light : settings.glass_border_highlight)
  root.style.setProperty('--text-gradient-start', settings.text_gradient_start)
  root.style.setProperty('--text-gradient-end', settings.text_gradient_end)
  root.style.setProperty('--use-text-gradient', settings.use_text_gradient ? '1' : '0')
  root.style.setProperty('--glass-intensity', String(settings.glass_intensity))

  document.body.setAttribute('data-text-gradient', settings.use_text_gradient ? 'true' : 'false')

  if (settings.background_image) {
    root.style.backgroundImage = `url(${settings.background_image})`
    root.style.backgroundSize = 'cover'
    root.style.backgroundPosition = 'center'
    root.style.backgroundAttachment = 'fixed'
  } else {
    root.style.backgroundImage = ''
    root.style.backgroundSize = ''
    root.style.backgroundPosition = ''
    root.style.backgroundAttachment = ''
  }

  return activeMode
}
