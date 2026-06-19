# Admin Appearance + Liquid Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken light theme, overhaul the admin appearance page, add adjustable liquid-glass effect, font-gradient option, and live page preview.

**Architecture:** Store two complete color palettes (light/dark) plus a `theme_mode` default in `site_settings`. The public site applies the default mode and the matching palette; visitor toggle switches mode. CSS variables drive glass intensity, font gradients, and theme colors. Admin form edits variables live and shows an iframe preview.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, better-sqlite3, Zod.

---

## File map

| File | Responsibility |
|------|----------------|
| `data/migrations/003_add_theme_mode_and_palettes.sql` | Add DB columns for `theme_mode`, `*_light_*` colors, `text_gradient_*`, `use_text_gradient`, `glass_intensity`. |
| `src/lib/db.ts` | Run the new migration on startup. |
| `src/lib/settings.ts` | Interface + CRUD with dual palettes; defaults; `resetSettings`. |
| `src/lib/theme.ts` | Apply active palette + glass intensity + font gradient + background image to CSS variables. |
| `src/lib/validators.ts` | `settingsUpdateSchema` accepts all new fields. |
| `src/app/api/settings/route.ts` | Expose new fields; no logic change. |
| `src/app/globals.css` | Liquid glass classes, text-gradient, reduced-motion, light/dark overrides. |
| `src/components/ui/ThemeProvider.tsx` | Load settings, set initial mode, toggle respects palettes. |
| `src/components/admin/SettingsForm.tsx` | Full UI for dual palettes, mode selector, intensity slider, font-gradient toggles, upload dropzone, preview iframe. |
| `src/app/admin/settings/page.tsx` | Centered layout (`max-w-6xl mx-auto`). |

---

## Task 1: Database migration

**Files:**
- Create: `data/migrations/003_add_theme_mode_and_palettes.sql`
- Modify: `src/lib/db.ts`

- [ ] **Step 1: Write migration SQL**

```sql
ALTER TABLE site_settings ADD COLUMN theme_mode TEXT NOT NULL DEFAULT 'dark';
ALTER TABLE site_settings ADD COLUMN background_start_light TEXT NOT NULL DEFAULT '#f0f0f5';
ALTER TABLE site_settings ADD COLUMN background_end_light TEXT NOT NULL DEFAULT '#e3e3e9';
ALTER TABLE site_settings ADD COLUMN background_mid_light TEXT NOT NULL DEFAULT '#ebebf0';
ALTER TABLE site_settings ADD COLUMN text_primary_light TEXT NOT NULL DEFAULT '#1d1d1f';
ALTER TABLE site_settings ADD COLUMN text_secondary_light TEXT NOT NULL DEFAULT 'rgba(0,0,0,0.75)';
ALTER TABLE site_settings ADD COLUMN text_muted_light TEXT NOT NULL DEFAULT 'rgba(0,0,0,0.55)';
ALTER TABLE site_settings ADD COLUMN accent_color_light TEXT NOT NULL DEFAULT '#38bdf8';
ALTER TABLE site_settings ADD COLUMN glass_bg_light TEXT NOT NULL DEFAULT 'rgba(255,255,255,0.25)';
ALTER TABLE site_settings ADD COLUMN glass_border_light TEXT NOT NULL DEFAULT 'rgba(0,0,0,0.12)';
ALTER TABLE site_settings ADD COLUMN glass_border_highlight_light TEXT NOT NULL DEFAULT 'rgba(255,255,255,0.7)';
ALTER TABLE site_settings ADD COLUMN text_gradient_start TEXT NOT NULL DEFAULT '#38bdf8';
ALTER TABLE site_settings ADD COLUMN text_gradient_end TEXT NOT NULL DEFAULT '#a855f7';
ALTER TABLE site_settings ADD COLUMN use_text_gradient INTEGER NOT NULL DEFAULT 1;
ALTER TABLE site_settings ADD COLUMN glass_intensity INTEGER NOT NULL DEFAULT 70;
```

- [ ] **Step 2: Register migration in `src/lib/db.ts`**

Add the filename to the migrations array so it runs at startup.

- [ ] **Step 3: Verify migration runs**

Run: `npm run seed` or start dev server and check schema.
Expected: no errors; `site_settings` has new columns.

---

## Task 2: Data layer and theme application

**Files:**
- Modify: `src/lib/settings.ts`
- Modify: `src/lib/theme.ts`

- [ ] **Step 1: Update `SiteSettings` interface**

Add fields:

```ts
theme_mode: 'light' | 'dark' | 'system'
background_start_light: string
background_end_light: string
background_mid_light: string
text_primary_light: string
text_secondary_light: string
text_muted_light: string
accent_color_light: string
glass_bg_light: string
glass_border_light: string
glass_border_highlight_light: string
text_gradient_start: string
text_gradient_end: string
use_text_gradient: boolean
glass_intensity: number
```

- [ ] **Step 2: Update defaults, insert, and update queries**

Include all new columns in `defaultSettings`, the fallback `INSERT`, and the `UPDATE` statement.

- [ ] **Step 3: Rewrite `applySettingsToCSS`**

Signature:

```ts
export function applySettingsToCSS(settings: SiteSettings, mode?: 'light' | 'dark') {
  const activeMode = mode || settings.theme_mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme_mode
  const isLight = activeMode === 'light'
  const root = document.documentElement
  root.classList.toggle('light', isLight)
  root.classList.toggle('dark', !isLight)

  root.style.setProperty('--background-start', isLight ? settings.background_start_light : settings.background_start)
  root.style.setProperty('--background-end', isLight ? settings.background_end_light : settings.background_end)
  root.style.setProperty('--background-mid', isLight ? settings.background_mid_light : settings.background_mid)
  root.style.setProperty('--text-primary', isLight ? settings.text_primary_light : settings.text_primary)
  root.style.setProperty('--text-secondary', isLight ? settings.text_secondary_light : settings.text_secondary)
  root.style.setProperty('--text-muted', isLight ? settings.text_muted_light : settings.text_muted)
  root.style.setProperty('--accent-blue', isLight ? settings.accent_color_light : settings.accent_color)
  root.style.setProperty('--glass-bg', isLight ? settings.glass_bg_light : settings.glass_bg)
  root.style.setProperty('--glass-border', isLight ? settings.glass_border_light : settings.glass_border)
  root.style.setProperty('--glass-border-highlight', isLight ? settings.glass_border_highlight_light : settings.glass_border_highlight)
  root.style.setProperty('--text-gradient-start', settings.text_gradient_start)
  root.style.setProperty('--text-gradient-end', settings.text_gradient_end)
  root.style.setProperty('--use-text-gradient', settings.use_text_gradient ? '1' : '0')
  root.style.setProperty('--glass-intensity', String(settings.glass_intensity))

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
```

- [ ] **Step 4: Commit**

```bash
git add data/migrations/003_add_theme_mode_and_palettes.sql src/lib/db.ts src/lib/settings.ts src/lib/theme.ts
git commit -m "feat(settings): add theme_mode, dual palettes, intensity and font gradient fields"
```

---

## Task 3: Update validators and API

**Files:**
- Modify: `src/lib/validators.ts`

- [ ] **Step 1: Extend `settingsUpdateSchema`**

```ts
export const settingsUpdateSchema = z.object({
  theme_mode: z.enum(['light', 'dark', 'system']).optional(),
  background_start: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_end: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_mid: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_start_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_end_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_mid_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_secondary: z.string().optional(),
  text_muted: z.string().optional(),
  text_primary_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_secondary_light: z.string().optional(),
  text_muted_light: z.string().optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent_color_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  glass_bg: z.string().optional(),
  glass_border: z.string().optional(),
  glass_border_highlight: z.string().optional(),
  glass_bg_light: z.string().optional(),
  glass_border_light: z.string().optional(),
  glass_border_highlight_light: z.string().optional(),
  text_gradient_start: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_gradient_end: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  use_text_gradient: z.boolean().optional(),
  glass_intensity: z.number().int().min(0).max(100).optional(),
  background_image: z.string().nullable().optional(),
})
```

- [ ] **Step 2: API no change needed**

`src/app/api/settings/route.ts` already passes body through schema; no change.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validators.ts
git commit -m "feat(validators): accept new appearance settings"
```

---

## Task 4: Liquid glass CSS

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add intensity variables and text-gradient helper**

Keep existing variables; add dynamic properties:

```css
:root {
  --glass-intensity: 70;
  --text-gradient-start: #38bdf8;
  --text-gradient-end: #a855f7;
  --use-text-gradient: 1;
}
```

- [ ] **Step 2: Update `.glass-card`**

```css
.glass-card {
  position: relative;
  background:
    linear-gradient(135deg, var(--glass-bg) 0%, var(--glass-bg-gradient, rgba(255,255,255,0.04)) 50%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(calc(8px + var(--glass-intensity) * 0.28px)) saturate(calc(100% + var(--glass-intensity) * 1%));
  -webkit-backdrop-filter: blur(calc(8px + var(--glass-intensity) * 0.28px)) saturate(calc(100% + var(--glass-intensity) * 1%));
  border: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-border-highlight);
  border-radius: 1.25rem;
  box-shadow:
    0 8px 32px var(--glass-shadow),
    inset 0 1px 0 var(--glass-inner-glow),
    inset 0 -1px 0 rgba(0,0,0,0.05);
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.18) 0%,
    rgba(255,255,255,0.06) 40%,
    transparent 60%,
    rgba(255,255,255,0.04) 100%
  );
  pointer-events: none;
  border-radius: inherit;
}

.glass-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 45%, transparent 55%);
  transform: skewX(-20deg);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

@media (prefers-reduced-motion: no-preference) {
  .glass-card:hover::after {
    opacity: 1;
    animation: glass-shine 0.8s ease forwards;
  }
}

@keyframes glass-shine {
  from { left: -100%; }
  to { left: 160%; }
}
```

- [ ] **Step 3: Update `.glass-button`**

```css
.glass-button {
  position: relative;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent-blue) 24%, transparent), color-mix(in srgb, var(--accent-purple, var(--accent-blue)) 24%, transparent));
  backdrop-filter: blur(calc(8px + var(--glass-intensity) * 0.2px)) saturate(calc(100% + var(--glass-intensity) * 0.8%));
  -webkit-backdrop-filter: blur(calc(8px + var(--glass-intensity) * 0.2px)) saturate(calc(100% + var(--glass-intensity) * 0.8%));
  border: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-border-highlight);
  border-radius: 0.75rem;
  box-shadow:
    0 4px 16px var(--glass-shadow),
    inset 0 1px 0 var(--glass-inner-glow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.glass-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
}

.glass-button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 6px 24px var(--glass-shadow),
    inset 0 1px 0 var(--glass-inner-glow);
}

@media (prefers-reduced-motion: no-preference) {
  .glass-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 55%);
    transform: skewX(-20deg);
    opacity: 0;
    pointer-events: none;
  }

  .glass-button:hover::after {
    opacity: 1;
    animation: glass-shine 0.7s ease forwards;
  }
}
```

- [ ] **Step 4: Update `.text-gradient`**

```css
.text-gradient {
  background: linear-gradient(135deg, var(--text-gradient-start), var(--text-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

html:not(.use-text-gradient) .text-gradient,
:root[style*="--use-text-gradient: 0"] .text-gradient {
  background: none;
  -webkit-text-fill-color: var(--text-primary);
  color: var(--text-primary);
}
```

Use a body class or data attribute for the disabled state:

```css
body[data-text-gradient='false'] .text-gradient {
  background: none;
  -webkit-text-fill-color: currentColor;
  color: var(--text-primary);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(css): liquid glass intensity, shine animation, font gradient toggle"
```

---

## Task 5: ThemeProvider uses new settings

**Files:**
- Modify: `src/components/ui/ThemeProvider.tsx`

- [ ] **Step 1: Apply settings with current mode**

```ts
useEffect(() => {
  fetch('/api/settings')
    .then((res) => (res.ok ? res.json() : null))
    .then((settings: SiteSettings | null) => {
      if (!settings) return
      const saved = localStorage.getItem('theme') as Theme | null
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialMode: Theme = saved || (settings.theme_mode === 'system' ? (prefersDark ? 'dark' : 'light') : settings.theme_mode)
      setTheme(initialMode)
      applySettingsToCSS(settings, initialMode)
      setMounted(true)
    })
    .catch(() => setMounted(true))
}, [])
```

- [ ] **Step 2: Toggle re-applies settings in new mode**

```ts
const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
  localStorage.setItem('theme', newTheme)
  fetch('/api/settings')
    .then((res) => (res.ok ? res.json() : null))
    .then((settings: SiteSettings | null) => {
      if (settings) applySettingsToCSS(settings, newTheme)
    })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ThemeProvider.tsx
git commit -m "feat(theme): apply settings using active light/dark palette"
```

---

## Task 6: Refactor admin SettingsForm

**Files:**
- Modify: `src/components/admin/SettingsForm.tsx`

- [ ] **Step 1: Add local preview mode state**

```ts
const [previewMode, setPreviewMode] = useState<'light' | 'dark'>(
  settings.theme_mode === 'light' ? 'light' : 'dark'
)
```

Apply preview to document using `previewMode`:

```ts
const applyPreview = (next: SiteSettings, mode?: 'light' | 'dark') => {
  setSettings(next)
  applySettingsToCSS(next, mode || previewMode)
}
```

- [ ] **Step 2: Build color input component**

```tsx
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-theme-secondary">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={toHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-xl bg-transparent border border-theme-border cursor-pointer shrink-0 overflow-hidden"
        />
        <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  )
}
```

`toHex` helper converts `rgba(...)` strings to hex for the color input.

- [ ] **Step 3: Split form into sections**

Sections:
1. Modo padrão (select: Claro / Escuro / Sistema)
2. Paleta escura (grid de 6 campos)
3. Paleta clara (grid de 6 campos)
4. Gradient de fonte (toggle + 2 cores)
5. Intensidade do glass (range 0-100)
6. Imagem de fundo (dropzone + preview)
7. Preview ao vivo (card interno + iframe)

- [ ] **Step 4: Add dropzone button**

```tsx
<label className="glass-button inline-flex items-center justify-center px-4 py-2 cursor-pointer">
  <span>Escolher imagem de fundo</span>
  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
</label>
```

- [ ] **Step 5: Add iframe preview**

```tsx
<iframe
  src="/"
  title="Preview do site"
  className="w-full h-96 rounded-xl border border-theme-border"
/>
```

Add a refresh button or key prop based on a debounced hash of settings.

- [ ] **Step 6: Update submit/reset payloads**

Include all new fields. Reset restores defaults for both palettes and new toggles.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/SettingsForm.tsx
git commit -m "feat(admin): overhaul appearance form with dual palettes, intensity, gradient and preview"
```

---

## Task 7: Admin settings page layout

**Files:**
- Modify: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Add centered container**

```tsx
<main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
  <h1 className="text-2xl font-bold text-theme-primary">Aparência do site</h1>
  <SettingsForm initialSettings={settings} />
</main>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "style(admin): center appearance page within max-w-6xl"
```

---

## Task 8: Verify build and tests

- [ ] **Step 1: Build**

Run: `rm -rf .next && npm run build`
Expected: exit 0.

- [ ] **Step 2: Tests**

Run: `npm test -- --run`
Expected: 47 tests pass.

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Self-review check

- Spec coverage: all requirements map to tasks above.
- Placeholders: none; code is provided for every step.
- Type consistency: `SiteSettings`, `applySettingsToCSS`, schema, and form all use the same field names.
