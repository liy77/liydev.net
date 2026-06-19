'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { SiteSettings } from '@/lib/settings'

export interface ThemePreset {
  id: number
  name: string
  settings: SiteSettings
  created_at: string
}

interface ThemePresetsProps {
  currentSettings: SiteSettings
  onLoad: (settings: SiteSettings) => void
}

export default function ThemePresets({ currentSettings, onLoad }: ThemePresetsProps) {
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/theme-presets')
      if (res.ok) {
        const data = await res.json()
        setPresets(data.presets || [])
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchPresets()
  }, [])

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/theme-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, settings: currentSettings }),
      })
      if (res.ok) {
        setName('')
        await fetchPresets()
        setMessage('Tema salvo')
      } else {
        setMessage('Erro ao salvar tema')
      }
    } catch {
      setMessage('Erro de rede ao salvar tema')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir tema salvo?')) return
    try {
      const res = await fetch(`/api/theme-presets?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchPresets()
      }
    } catch {
      setMessage('Erro ao excluir tema')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Nome do tema"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="button" onClick={handleSave} disabled={loading || !name.trim()}>
          {loading ? 'Salvando...' : 'Salvar tema atual'}
        </Button>
      </div>

      {message && <p className="text-sm text-theme-secondary">{message}</p>}

      {presets.length === 0 ? (
        <p className="text-sm text-theme-muted">Nenhum tema salvo ainda.</p>
      ) : (
        <ul className="space-y-2">
          {presets.map((preset) => (
            <li
              key={preset.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-theme-surface/50 border border-theme-border"
            >
              <span className="text-theme-primary font-medium truncate">{preset.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 px-3 text-sm"
                  onClick={() => onLoad(preset.settings)}
                >
                  Carregar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="h-8 px-3 text-sm"
                  onClick={() => handleDelete(preset.id)}
                >
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
