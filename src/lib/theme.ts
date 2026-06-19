import type { SiteSettings } from './settings'

export function applySettingsToCSS(settings: SiteSettings) {
  const root = document.documentElement
  root.style.setProperty('--background-start', settings.background_start)
  root.style.setProperty('--background-end', settings.background_end)
  root.style.setProperty('--background-mid', settings.background_mid)
  root.style.setProperty('--text-primary', settings.text_primary)
  root.style.setProperty('--text-secondary', settings.text_secondary)
  root.style.setProperty('--text-muted', settings.text_muted)
  root.style.setProperty('--accent-blue', settings.accent_color)
  root.style.setProperty('--glass-bg', settings.glass_bg)
  root.style.setProperty('--glass-border', settings.glass_border)
  root.style.setProperty('--glass-border-highlight', settings.glass_border_highlight)

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
}
