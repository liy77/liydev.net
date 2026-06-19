'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { applySettingsToCSS } from '@/lib/theme'
import type { SiteSettings } from '@/lib/settings'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  mounted: false,
})

export function useTheme() {
  return useContext(ThemeContext)
}

interface ThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((settings: SiteSettings | null) => {
        const saved = localStorage.getItem('theme') as Theme | null
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialMode: Theme =
          saved ||
          (settings?.theme_mode === 'system'
            ? prefersDark
              ? 'dark'
              : 'light'
            : settings?.theme_mode === 'light'
              ? 'light'
              : 'dark')

        setTheme(initialMode)
        if (settings) {
          applySettingsToCSS(settings, initialMode)
        } else {
          document.documentElement.classList.toggle('light', initialMode === 'light')
          document.documentElement.classList.toggle('dark', initialMode === 'dark')
        }
        setMounted(true)
      })
      .catch(() => {
        document.documentElement.classList.add('dark')
        setMounted(true)
      })
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
    document.documentElement.classList.toggle('dark', newTheme === 'dark')

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((settings: SiteSettings | null) => {
        if (settings) applySettingsToCSS(settings, newTheme)
      })
      .catch(() => {})
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}
