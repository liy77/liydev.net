'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GlassCard from '@/components/ui/GlassCard'
import { applySettingsToCSS } from '@/lib/theme'
import type { SiteSettings } from '@/lib/settings'

interface SettingsFormProps {
  initialSettings: SiteSettings
}

const colorFields: { key: keyof SiteSettings; label: string }[] = [
  { key: 'background_start', label: 'Fundo (início)' },
  { key: 'background_end', label: 'Fundo (fim)' },
  { key: 'background_mid', label: 'Fundo (meio)' },
  { key: 'text_primary', label: 'Texto primário' },
  { key: 'accent_color', label: 'Cor de destaque' },
]

const textFields: { key: keyof SiteSettings; label: string }[] = [
  { key: 'text_secondary', label: 'Texto secundário' },
  { key: 'text_muted', label: 'Texto muted' },
  { key: 'glass_bg', label: 'Glass background' },
  { key: 'glass_border', label: 'Glass border' },
  { key: 'glass_border_highlight', label: 'Glass border highlight' },
]

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings)
  const [previewImage, setPreviewImage] = useState<string | null>(initialSettings.background_image)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const applyPreview = (next: SiteSettings) => {
    setSettings(next)
    applySettingsToCSS(next)
  }

  const handleColorChange = (key: keyof SiteSettings, value: string) => {
    applyPreview({ ...settings, [key]: value })
  }

  const handleTextChange = (key: keyof SiteSettings, value: string) => {
    applyPreview({ ...settings, [key]: value })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setPreviewImage(data.path)
        applyPreview({ ...settings, background_image: data.path })
        setMessage('')
      } else {
        setMessage(data.error || 'Falha ao enviar imagem')
      }
    } catch {
      setMessage('Erro de rede ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    applyPreview({ ...settings, background_image: null })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const payload = { ...settings, background_image: previewImage }
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setMessage('Configurações salvas')
      } else {
        const data = await res.json()
        setMessage(data.error?.message || 'Erro ao salvar')
      }
    } catch {
      setMessage('Erro de rede ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Voltar ao tema padrão?')) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })
      if (res.ok) {
        const fresh = await fetch('/api/settings').then((r) => r.json())
        applyPreview(fresh)
        setPreviewImage(null)
        setMessage('Tema padrão restaurado')
      } else {
        setMessage('Erro ao restaurar padrão')
      }
    } catch {
      setMessage('Erro de rede ao restaurar padrão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold text-theme-primary mb-4">Cores do tema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorFields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm text-theme-secondary">{field.label}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings[field.key] as string}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                  className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                />
                <Input
                  type="text"
                  value={settings[field.key] as string}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                />
              </div>
            </div>
          ))}
          {textFields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm text-theme-secondary">{field.label}</label>
              <Input
                type="text"
                value={(settings[field.key] as string) || ''}
                onChange={(e) => handleTextChange(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold text-theme-primary mb-4">Imagem de fundo</h2>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageChange}
          disabled={uploading}
          className="block mb-4 text-theme-secondary"
        />
        {uploading && <p className="text-theme-muted text-sm mb-2">Enviando...</p>}
        {previewImage && (
          <div className="space-y-2">
            <img src={previewImage} alt="Preview" className="w-full max-w-md rounded-xl" />
            <Button type="button" variant="danger" onClick={handleRemoveImage}>
              Remover imagem
            </Button>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold text-theme-primary mb-4">Preview</h2>
        <div className="p-6 rounded-xl bg-theme-surface border border-theme-border space-y-4">
          <p className="text-theme-primary font-medium">Título de exemplo</p>
          <p className="text-theme-secondary text-sm">Texto secundário de exemplo.</p>
          <Button>Botão de exemplo</Button>
        </div>
      </GlassCard>

      {message && <p className="text-theme-secondary text-sm">{message}</p>}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
          Voltar ao padrão
        </Button>
      </div>
    </form>
  )
}
