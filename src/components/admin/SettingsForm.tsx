'use client'

import { useMemo, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import GlassCard from '@/components/ui/GlassCard'
import ThemePresets from './ThemePresets'
import { applySettingsToCSS, rgbaToHex, type ThemeMode } from '@/lib/theme'
import type { SiteSettings } from '@/lib/settings'

interface SettingsFormProps {
  initialSettings: SiteSettings
}

const darkFields: { key: keyof SiteSettings; label: string }[] = [
  { key: 'background_start', label: 'Fundo (início)' },
  { key: 'background_mid', label: 'Fundo (meio)' },
  { key: 'background_end', label: 'Fundo (fim)' },
  { key: 'text_primary', label: 'Texto primário' },
  { key: 'accent_color', label: 'Cor de destaque' },
]

const darkTextFields: { key: keyof SiteSettings; label: string }[] = [
  { key: 'text_secondary', label: 'Texto secundário' },
  { key: 'text_muted', label: 'Texto muted' },
  { key: 'glass_bg', label: 'Glass fundo' },
  { key: 'glass_border', label: 'Glass borda' },
  { key: 'glass_border_highlight', label: 'Glass destaque' },
]

const lightFields: { key: keyof SiteSettings; label: string }[] = [
  { key: 'background_start_light', label: 'Fundo claro (início)' },
  { key: 'background_mid_light', label: 'Fundo claro (meio)' },
  { key: 'background_end_light', label: 'Fundo claro (fim)' },
  { key: 'text_primary_light', label: 'Texto primário claro' },
  { key: 'accent_color_light', label: 'Cor de destaque claro' },
]

const lightTextFields: { key: keyof SiteSettings; label: string }[] = [
  { key: 'text_secondary_light', label: 'Texto secundário claro' },
  { key: 'text_muted_light', label: 'Texto muted claro' },
  { key: 'glass_bg_light', label: 'Glass fundo claro' },
  { key: 'glass_border_light', label: 'Glass borda claro' },
  { key: 'glass_border_highlight_light', label: 'Glass destaque claro' },
]

function toHex(value: string): string {
  if (value.startsWith('#')) return value.slice(0, 7)
  if (value.startsWith('rgba') || value.startsWith('rgb')) return rgbaToHex(value)
  return '#000000'
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-theme-secondary">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={toHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-xl cursor-pointer shrink-0 overflow-hidden"
        />
        <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold text-theme-primary mb-4">{title}</h2>
      {children}
    </GlassCard>
  )
}

function ExpandIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  )
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings)
  const [previewMode, setPreviewMode] = useState<ThemeMode>(
    initialSettings.theme_mode === 'light' ? 'light' : 'dark'
  )
  const [previewImage, setPreviewImage] = useState<string | null>(initialSettings.background_image)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const adminMode: ThemeMode = typeof document !== 'undefined'
    ? document.documentElement.classList.contains('light')
      ? 'light'
      : 'dark'
    : 'dark'

  const previewKey = useMemo(() => {
    return JSON.stringify({ ...settings, background_image: previewImage, previewMode })
  }, [settings, previewImage, previewMode])

  const applyPreview = (next: SiteSettings) => {
    setSettings(next)
    // Only repaint the admin UI using the admin's own active mode so the preview toggle
    // does not change the appearance page itself.
    applySettingsToCSS(next, adminMode)
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
          theme_mode: 'dark',
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
          text_gradient_end: '#a855f7',
          use_text_gradient: true,
          glass_intensity: 70,
          background_image: null,
        }),
      })
      if (res.ok) {
        const fresh = await fetch('/api/settings').then((r) => r.json())
        applyPreview(fresh)
        setPreviewImage(null)
        setPreviewMode('dark')
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

  const openPreviewFullscreen = () => {
    const iframe = iframeRef.current
    if (iframe && iframe.requestFullscreen) {
      iframe.requestFullscreen().catch(() => {})
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Modo padrão do site">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-48">
            <Select
              value={settings.theme_mode}
              onChange={(e) => {
                const mode = e.target.value as SiteSettings['theme_mode']
                const next = { ...settings, theme_mode: mode }
                const effectiveMode: ThemeMode = mode === 'light' ? 'light' : 'dark'
                setPreviewMode(effectiveMode)
                applyPreview(next)
              }}
            >
              <option value="dark">Escuro</option>
              <option value="light">Claro</option>
              <option value="system">Sistema</option>
            </Select>
          </div>
          <p className="text-sm text-theme-secondary">
            Define qual tema o site carrega por padrão para novos visitantes.
          </p>
        </div>
      </Section>

      <Section title="Paleta escura">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {darkFields.map((field) => (
            <ColorInput
              key={field.key}
              label={field.label}
              value={settings[field.key] as string}
              onChange={(v) => handleColorChange(field.key, v)}
            />
          ))}
          {darkTextFields.map((field) => (
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
      </Section>

      <Section title="Paleta clara">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lightFields.map((field) => (
            <ColorInput
              key={field.key}
              label={field.label}
              value={settings[field.key] as string}
              onChange={(v) => handleColorChange(field.key, v)}
            />
          ))}
          {lightTextFields.map((field) => (
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
      </Section>

      <Section title="Gradiente de fonte">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.use_text_gradient}
              onChange={(e) => applyPreview({ ...settings, use_text_gradient: e.target.checked })}
              className="w-5 h-5 rounded border-theme-border bg-theme-surface text-accent-blue focus:ring-accent-blue"
            />
            <span className="text-theme-primary">Usar gradiente no título</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorInput
            label="Início do gradiente"
            value={settings.text_gradient_start}
            onChange={(v) => handleColorChange('text_gradient_start', v)}
          />
          <ColorInput
            label="Fim do gradiente"
            value={settings.text_gradient_end}
            onChange={(v) => handleColorChange('text_gradient_end', v)}
          />
        </div>
      </Section>

      <Section title="Intensidade do liquid glass">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-secondary">Blur + saturação</span>
            <span className="text-sm font-medium text-theme-primary">{settings.glass_intensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.glass_intensity}
            onChange={(e) => applyPreview({ ...settings, glass_intensity: Number(e.target.value) })}
            className="w-full accent-[var(--accent-blue)]"
          />
          <p className="text-sm text-theme-secondary">0 = quase plano · 100 = glass bem líquido</p>
        </div>
      </Section>

      <Section title="Imagem de fundo">
        <label className="glass-button inline-flex items-center justify-center gap-2 px-4 py-2 cursor-pointer text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span>Escolher imagem de fundo</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {uploading && <p className="text-theme-muted text-sm mt-2">Enviando...</p>}
        {previewImage && (
          <div className="mt-4 space-y-3">
            <img src={previewImage} alt="Preview" className="w-full max-w-md rounded-xl border border-theme-border" />
            <Button type="button" variant="danger" onClick={handleRemoveImage}>
              Remover imagem
            </Button>
          </div>
        )}
      </Section>

      <Section title="Preview ao vivo">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-sm text-theme-secondary">Preview modo:</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={previewMode === 'dark' ? 'primary' : 'secondary'}
              onClick={() => setPreviewMode('dark')}
            >
              Escuro
            </Button>
            <Button
              type="button"
              variant={previewMode === 'light' ? 'primary' : 'secondary'}
              onClick={() => setPreviewMode('light')}
            >
              Claro
            </Button>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={openPreviewFullscreen}
          >
            <ExpandIcon />
            <span>Expandir</span>
          </Button>
          <a
            href={`/?theme=${previewMode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-theme-secondary hover:text-theme-primary underline"
          >
            Abrir em nova aba
          </a>
        </div>
        <div className="rounded-xl border border-theme-border overflow-hidden">
          <iframe
            ref={iframeRef}
            key={previewKey}
            src={`/?theme=${previewMode}`}
            title="Preview do site"
            className="w-full h-80 sm:h-96 bg-theme-surface"
          />
        </div>
      </Section>

      <Section title="Temas salvos">
        <ThemePresets currentSettings={{ ...settings, background_image: previewImage }} onLoad={applyPreview} />
      </Section>

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
