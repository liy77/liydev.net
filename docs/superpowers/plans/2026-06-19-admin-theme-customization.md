# Admin theme customization implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o admin customize cores do tema e imagem de fundo, com preview, salvar e resetar; site lê da DB; usar `liquid-glass-react` para glass real.

**Architecture:** Adicionar tabela `site_settings` ao SQLite, data layer, API pública/protegida e página de admin. `ThemeProvider` busca as configurações da API e aplica CSS variables. Componentes glass usam `LiquidGlass` da biblioteca.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, better-sqlite3, Zod, liquid-glass-react.

---

## Files

- `package.json` — adicionar `liquid-glass-react`.
- `src/lib/schema.sql` — tabela `site_settings`.
- `src/lib/db.ts` — garantir criação da tabela.
- `src/lib/settings.ts` — data layer (get/update/reset).
- `src/lib/validators.ts` — schema Zod para settings.
- `src/app/api/settings/route.ts` — GET/PUT.
- `src/app/admin/settings/page.tsx` — página de configuração.
- `src/components/admin/SettingsForm.tsx` — formulário com preview.
- `src/components/admin/AdminHeader.tsx` — link para configurações.
- `src/components/ui/ThemeProvider.tsx` — buscar settings e aplicar variáveis.
- `src/components/ui/GlassCard.tsx` — usar `LiquidGlass`.
- `src/components/ui/Button.tsx` — usar `LiquidGlass`.
- `src/components/ui/Navbar.tsx` — usar `LiquidGlass`.
- `src/app/layout.tsx` — ajustar para aplicar imagem de fundo.
- `src/app/globals.css` — ajustar glass e admin.

---

### Task 1: Instalar biblioteca liquid-glass-react

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (via npm install)

- [ ] **Step 1: Instalar pacote**

Run: `npm install liquid-glass-react`
Expected: pacote instalado sem erros.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add liquid-glass-react"
```

---

### Task 2: Schema e data layer para site_settings

**Files:**
- Modify: `src/lib/schema.sql`
- Modify: `src/lib/db.ts`
- Create: `src/lib/settings.ts`

- [ ] **Step 1: Adicionar tabela ao schema**

Adicionar ao final de `src/lib/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  background_start TEXT NOT NULL DEFAULT '#0a0a0f',
  background_end TEXT NOT NULL DEFAULT '#1a1a2e',
  background_mid TEXT NOT NULL DEFAULT '#0f0f1a',
  text_primary TEXT NOT NULL DEFAULT '#f5f5f7',
  text_secondary TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.7)',
  text_muted TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.5)',
  accent_color TEXT NOT NULL DEFAULT '#38bdf8',
  glass_bg TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.08)',
  glass_border TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.18)',
  glass_border_highlight TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.35)',
  background_image TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] **Step 2: Recriar banco local**

Como ainda não há migrações, remover `data/portfolio.db` e reinicializar:

```bash
rm data/portfolio.db
npm run seed
```

- [ ] **Step 3: Criar data layer**

Create `src/lib/settings.ts`:

```ts
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
    db.prepare(`INSERT INTO site_settings (id, background_start, background_end, background_mid, text_primary, text_secondary, text_muted, accent_color, glass_bg, glass_border, glass_border_highlight, background_image)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
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
        defaultSettings.background_image,
      )
    return db.prepare('SELECT * FROM site_settings WHERE id = 1').get() as SiteSettings
  }
  return row as SiteSettings
}

export function updateSettings(settings: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>): SiteSettings {
  const db = getDatabase()
  const current = getSettings()
  const merged = { ...current, ...settings }
  db.prepare(`UPDATE site_settings SET
    background_start = ?, background_end = ?, background_mid = ?,
    text_primary = ?, text_secondary = ?, text_muted = ?,
    accent_color = ?,
    glass_bg = ?, glass_border = ?, glass_border_highlight = ?,
    background_image = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1`)
    .run(
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
      merged.background_image,
    )
  return getSettings()
}

export function resetSettings(): SiteSettings {
  const db = getDatabase()
  db.prepare('DELETE FROM site_settings WHERE id = 1').run()
  return getSettings()
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/schema.sql src/lib/db.ts src/lib/settings.ts
git commit -m "feat(settings): add site_settings data layer"
```

---

### Task 3: Validadores Zod

**Files:**
- Modify: `src/lib/validators.ts`

- [ ] **Step 1: Adicionar schema settingsUpdateSchema**

Adicionar em `src/lib/validators.ts`:

```ts
export const settingsUpdateSchema = z.object({
  background_start: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_end: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_mid: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_secondary: z.string().optional(),
  text_muted: z.string().optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  glass_bg: z.string().optional(),
  glass_border: z.string().optional(),
  glass_border_highlight: z.string().optional(),
  background_image: z.string().nullable().optional(),
})
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validators.ts
git commit -m "feat(settings): add settings update validator"
```

---

### Task 4: API routes

**Files:**
- Create: `src/app/api/settings/route.ts`

- [ ] **Step 1: Criar route**

Create `src/app/api/settings/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/settings'
import { settingsUpdateSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const settings = getSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = settingsUpdateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const updated = updateSettings(result.data)
  return NextResponse.json(updated)
}
```

- [ ] **Step 2: Testar GET**

Run: `curl http://localhost:3002/api/settings`
Expected: JSON com as configurações padrão.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/settings/route.ts
git commit -m "feat(api): add settings GET/PUT endpoints"
```

---

### Task 5: Formulário de settings com preview

**Files:**
- Create: `src/components/admin/SettingsForm.tsx`

- [ ] **Step 1: Criar componente**

Create `src/components/admin/SettingsForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GlassCard from '@/components/ui/GlassCard'
import type { SiteSettings } from '@/lib/settings'

interface SettingsFormProps {
  initialSettings: SiteSettings
}

const fields: { key: keyof SiteSettings; label: string; type: string }[] = [
  { key: 'background_start', label: 'Fundo (início)', type: 'color' },
  { key: 'background_end', label: 'Fundo (fim)', type: 'color' },
  { key: 'background_mid', label: 'Fundo (meio)', type: 'color' },
  { key: 'text_primary', label: 'Texto primário', type: 'color' },
  { key: 'text_secondary', label: 'Texto secundário', type: 'text' },
  { key: 'text_muted', label: 'Texto muted', type: 'text' },
  { key: 'accent_color', label: 'Cor de destaque', type: 'color' },
  { key: 'glass_bg', label: 'Glass background', type: 'text' },
  { key: 'glass_border', label: 'Glass border', type: 'text' },
  { key: 'glass_border_highlight', label: 'Glass border highlight', type: 'text' },
]

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(initialSettings.background_image)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const applyPreview = (next: SiteSettings) => {
    setSettings(next)
    const root = document.documentElement
    root.style.setProperty('--background-start', next.background_start)
    root.style.setProperty('--background-end', next.background_end)
    root.style.setProperty('--background-mid', next.background_mid)
    root.style.setProperty('--text-primary', next.text_primary)
    root.style.setProperty('--text-secondary', next.text_secondary)
    root.style.setProperty('--text-muted', next.text_muted)
    root.style.setProperty('--accent-blue', next.accent_color)
    root.style.setProperty('--glass-bg', next.glass_bg)
    root.style.setProperty('--glass-border', next.glass_border)
    root.style.setProperty('--glass-border-highlight', next.glass_border_highlight)
    if (next.background_image) {
      document.documentElement.style.backgroundImage = `url(${next.background_image})`
      document.documentElement.style.backgroundSize = 'cover'
    } else {
      document.documentElement.style.backgroundImage = ''
    }
  }

  const handleChange = (key: keyof SiteSettings, value: string) => {
    applyPreview({ ...settings, [key]: value })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.success) {
      setPreviewImage(data.path)
      applyPreview({ ...settings, background_image: data.path })
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setPreviewImage(null)
    applyPreview({ ...settings, background_image: null })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...settings, background_image: previewImage }
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) {
      setMessage('Configurações salvas')
    } else {
      setMessage('Erro ao salvar')
    }
  }

  const handleReset = async () => {
    if (!confirm('Voltar ao tema padrão?')) return
    setLoading(true)
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ background_image: null }) })
    if (res.ok) {
      const fresh = await fetch('/api/settings').then((r) => r.json())
      applyPreview(fresh)
      setPreviewImage(null)
      setMessage('Tema padrão restaurado')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold text-theme-primary mb-4">Cores do tema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm text-theme-secondary">{field.label}</label>
              {field.type === 'color' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings[field.key] as string}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings[field.key] as string}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                </div>
              ) : (
                <Input
                  type="text"
                  value={(settings[field.key] as string) || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold text-theme-primary mb-4">Imagem de fundo</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} className="block mb-4" />
        {previewImage && (
          <div className="space-y-2">
            <img src={previewImage} alt="Preview" className="w-full max-w-md rounded-xl" />
            <Button type="button" variant="danger" onClick={handleRemoveImage}>Remover imagem</Button>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold text-theme-primary mb-4">Preview</h2>
        <div className="p-6 rounded-xl bg-theme-surface border border-theme-border">
          <p className="text-theme-primary font-medium mb-2">Título de exemplo</p>
          <p className="text-theme-secondary text-sm mb-4">Texto secundário de exemplo.</p>
          <Button>Botão de exemplo</Button>
        </div>
      </GlassCard>

      {message && <p className="text-theme-secondary text-sm">{message}</p>}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
        <Button type="button" variant="secondary" onClick={handleReset}>Voltar ao padrão</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/SettingsForm.tsx
git commit -m "feat(admin): add settings form with live preview"
```

---

### Task 6: Página /admin/settings

**Files:**
- Create: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Criar página**

Create `src/app/admin/settings/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')

  const settings = getSettings()

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-theme-primary">Aparência do site</h1>
      <SettingsForm initialSettings={settings} />
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "feat(admin): add settings page"
```

---

### Task 7: Link no AdminHeader

**Files:**
- Modify: `src/components/admin/AdminHeader.tsx`

- [ ] **Step 1: Adicionar link para settings**

Adicionar ao lado do título Admin:

```tsx
<Link href="/admin/settings" className="text-sm text-theme-secondary hover:text-theme-primary transition-colors">
  Aparência
</Link>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminHeader.tsx
git commit -m "feat(admin): add appearance link to header"
```

---

### Task 8: ThemeProvider buscar settings

**Files:**
- Modify: `src/components/ui/ThemeProvider.tsx`

- [ ] **Step 1: Buscar settings da API e aplicar**

Atualizar `ThemeProvider` para buscar `/api/settings` e aplicar variáveis.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ThemeProvider.tsx
git commit -m "feat(theme): load site settings from API"
```

---

### Task 9: Aplicar imagem de fundo no layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Remover background do html/CSS e deixar ThemeProvider controlar**

Ajustar layout para que `ThemeProvider` injete estilo de fundo dinamicamente.

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(layout): apply dynamic background image from settings"
```

---

### Task 10: Substituir glass por LiquidGlass

**Files:**
- Modify: `src/components/ui/GlassCard.tsx`
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Navbar.tsx`

- [ ] **Step 1: GlassCard com LiquidGlass**

Usar `LiquidGlass` como wrapper.

- [ ] **Step 2: Button com LiquidGlass**

Aplicar `LiquidGlass` nos botões primários/secondary.

- [ ] **Step 3: Navbar com LiquidGlass**

Aplicar `LiquidGlass` no container da navbar.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/GlassCard.tsx src/components/ui/Button.tsx src/components/ui/Navbar.tsx
git commit -m "feat(ui): replace glass effect with LiquidGlass component"
```

---

### Task 11: Ajustar CSS do admin

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Reduzir opacidade do glass no tema claro e melhorar contraste**

Ajustar variáveis `html.light` para glass menos opaco e cores de texto mais escuras.

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "fix(css): improve admin contrast on light theme"
```

---

### Task 12: Verificação final

**Files:** todos acima.

- [ ] **Step 1: Rodar testes**

Run: `npm test -- --run`
Expected: 47 tests pass.

- [ ] **Step 2: Rodar build**

Run: `npm run build`
Expected: sucesso.

- [ ] **Step 3: Testar fluxo manual**

- Abrir `/admin/settings`.
- Alterar uma cor e ver preview.
- Fazer upload de imagem.
- Salvar.
- Abrir `/` e verificar cores/fundo.
- Clicar em "Voltar ao padrão" e confirmar reset.

- [ ] **Step 4: Commit final se necessário**

```bash
git add .
git commit -m "fix: final adjustments"
```

---

## Self-review

- **Spec coverage:**
  - Tabela DB + data layer → Task 2.
  - Validadores → Task 3.
  - API → Task 4.
  - Formulário preview → Task 5.
  - Página admin → Task 6.
  - Link header → Task 7.
  - ThemeProvider → Task 8.
  - Imagem de fundo → Task 9.
  - LiquidGlass → Task 10.
  - Ajuste admin → Task 11.
  - Testes → Task 12.
- **Placeholder scan:** tasks com código ou comandos concretos.
- **Type consistency:** `SiteSettings` usada em data layer, form e página.
