# liy.dev — Project Guide for Agents

> This document exists so any future agent can understand the project structure, features, and conventions without re-exploring the entire codebase.

## Project Overview

**liy.dev** is a personal portfolio + admin dashboard built with:

- **Next.js 14** (App Router, Server Components by default)
- **React 18** (Client Components marked with `'use client'`)
- **TypeScript**
- **Tailwind CSS**
- **better-sqlite3** for local SQLite database
- **Zod** for validation
- **bcryptjs + jose** for auth
- **sharp** for image processing

## Getting Started

```bash
npm install --legacy-peer-deps
npm run dev -- -p 3002
```

- Dev server runs on `http://localhost:3002`
- Database file: `data/portfolio.db`
- Admin login: `/admin/login` (credentials in `.env.local`)

## Environment Variables

Create `.env.local`:

```env
DATABASE_URL=data/portfolio.db
JWT_SECRET=your-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-password
```

## Project Structure

```
/Volumes/MCUDevDisk/liydev.net
├── data/                       # SQLite database + migrations
│   └── portfolio.db
├── public/
│   ├── uploads/                # User uploaded images/audio
│   │   ├── thumbnails/         # Project thumbnails (force-added to git)
│   │   └── presets/            # Theme preset assets (force-added)
│   └── favicon.svg
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public pages (homepage, about, projects)
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── (public)/login
│   │   │   └── (protected)/    # Logged-in admin pages
│   │   ├── api/                # API routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/              # Admin-specific React components
│   │   ├── projects/           # Project list / upload components
│   │   └── ui/                 # Reusable UI (Button, GlassCard, Navbar, etc.)
│   ├── lib/                    # Data layer, auth, validation, theme helpers
│   └── types/                  # Shared TypeScript types
├── .docs/                      # This documentation
└── package.json
```

## Public Pages

### `/` — Homepage

- Shows hero section, projects grid, and about teaser.
- Uses `ThemeProvider` to load appearance settings from `/api/settings`.
- Background can be gradient, solid color, or image depending on admin settings.
- Animated background particles are drawn by `AnimatedBackground`.

### `/projects/[slug]` — Project Detail

- Renders a single project from the database.
- Static paths generated at build time for all projects.

### `/about` — About Me

- Shows bio, skill icons (Rust, C, C++, TypeScript, SDL3), and contact info.

## Admin Pages

All admin pages under `/admin/(protected)` require login via JWT cookie.

### `/admin/login`

- Simple email/password form.
- On success, sets HTTP-only cookie and redirects to `/admin/projects`.

### `/admin/projects`

- Lists all projects with order, edit, and delete actions.
- Uses `SortableProjectList` for reordering.
- "Novo projeto" button goes to `/admin/projects/new`.

### `/admin/projects/new` & `/admin/projects/[id]/edit`

- Form to create/edit a project.
- Requires title, slug, description, GitHub URL, and image upload.
- Image is uploaded to `/api/upload` and stored in `public/uploads`.

### `/admin/settings`

- **Appearance customization page.**
- Allows editing:
  - Default theme mode (dark / light / system)
  - Full dark and light color palettes
  - Font gradient toggle + colors
  - Liquid glass intensity (0–100)
  - Background image upload
  - Background music upload + default volume
  - Live iframe preview (dark/light toggle, fullscreen, open in new tab)
  - Theme scope (works for dark only / light only / both) — single-mode themes lock the public toggle
  - Theme presets (save current theme, load into editor, **Aplicar no site** to push a preset live to all visitors, delete)
- Changes are previewed live in the admin UI and in the iframe.
- Clicking **Salvar** persists to `site_settings` table.
- Clicking **Voltar ao padrão** restores default theme.

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/login` | POST | No | Returns JWT cookie |
| `/api/auth/logout` | POST | Yes | Clears cookie |
| `/api/auth/me` | GET | Yes | Returns current user |
| `/api/projects` | GET | No | List projects ordered by `display_order` |
| `/api/projects` | POST | Yes | Create project |
| `/api/projects/[id]` | GET | No | Single project |
| `/api/projects/[id]` | PUT | Yes | Update project |
| `/api/projects/[id]` | DELETE | Yes | Delete project |
| `/api/projects/reorder` | POST | Yes | Update display order |
| `/api/settings` | GET | No | Get site settings |
| `/api/settings` | PUT | Yes | Update site settings |
| `/api/theme-presets` | GET | Yes | List saved theme presets |
| `/api/theme-presets` | POST | Yes | Save new preset |
| `/api/theme-presets` | DELETE | Yes | Delete preset by `?id=` |
| `/api/upload` | POST | Yes | Upload image or audio. Send `type=image\|audio` and `file` |

## Database Schema

### `users`

- `id`, `email`, `password_hash`, `created_at`

### `projects`

- `id`, `title`, `slug`, `short_description`, `description`, `image_path`, `github_url`, `website_url`, `display_order`, `created_at`, `updated_at`

### `site_settings`

Single-row table (`id = 1`) storing:

- `theme_mode` — `dark`, `light`, or `system` (default mode when scope is `both`)
- `theme_scope` — `both`, `dark`, or `light`. When `dark`/`light`, the public site is locked to that mode and the theme toggle is hidden from visitors (`ThemeProvider` exposes `locked`, `ThemeToggle` renders `null`). When `both`, both palettes are used and the toggle is shown.
- Dark palette: `background_start`, `background_mid`, `background_end`, `text_primary`, `text_secondary`, `text_muted`, `accent_color`, `glass_bg`, `glass_border`, `glass_border_highlight`
- Light palette: same fields with `_light` suffix
- `text_gradient_start`, `text_gradient_end`, `use_text_gradient`
- `glass_intensity` — integer 0–100
- `background_image` — path string or null
- `background_music` — path string or null
- `music_volume` — integer 0–100

### `theme_presets`

- `id`, `name`, `settings` (JSON string of `SiteSettings`), `created_at`

## Theme System

- CSS variables are defined in `src/app/globals.css`.
- `ThemeProvider` fetches `/api/settings` and applies active palette + mode.
- `applySettingsToCSS(settings, mode?)` in `src/lib/theme.ts` writes variables to the document root.
- The background image is painted on a fixed `#site-bg` layer (rendered in `layout.tsx`), **not** via `background-attachment: fixed` on `<html>` (which is broken on iOS Safari and caused white gaps near the status/URL bars). `applySettingsToCSS` also syncs the `<meta name="theme-color">` and `html` background-color to the active palette so mobile browser chrome matches.
- `viewport` export in `layout.tsx` sets `viewport-fit=cover` + a dark default `themeColor`; iOS status bar style is `black-translucent`.
- `AnimatedBackground` reduces particle count and disables connection lines on mobile/touch (`pointer: coarse`) and pauses on `visibilitychange` for performance.
- Classes:
  - `.glass-card` — frosted glass panel with animated shine on hover
  - `.glass-button` — frosted glass button
  - `.text-gradient` — gradient text using theme colors
  - `.text-on-bg` — subtle text-shadow for text sitting directly over the background image (hero eyebrow/title/subtitle, section headings). Needed for legibility on themes with a background image; glass-card text doesn't use it.
- **Comboboxes (`Select`)**: native `<select>`/`<option>` don't inherit the translucent glass surface, so the value/options were unreadable. The select uses a solid `var(--background-mid)` background and `globals.css` styles `select option` with solid `--background-mid`/`--text-primary`. Keep this when adding new selects.
- **Readability over a background image**: cream/light text needs the image darkened. Background presets are pre-processed with a dark scrim (see "Theme presets & assets"); also bump `text_secondary`/`text_muted` alpha and apply `.text-on-bg` to over-image text.

## Theme presets & assets

- **`seedDefaultPresets()` in `src/lib/themePresets.ts` is the canonical source for the built-in "Ocarina of Time" theme.** It runs on every server init (`initializeDatabase`) and UPSERTs the preset by name. If you change the theme, edit the `ocarinaSettings` object there too — otherwise a server restart silently overwrites your DB changes (and a name mismatch creates duplicates). It also deletes the legacy name `Ocarina of Time — Remake`.
- The current built-in theme is **"Ocarina of Time"**: `theme_scope: 'dark'` (forest is dark, light mode would be unreadable over it), Triforce-gold accent (`#f4c64a`), gold→Kokiri-green text gradient, green-tinted glass, cream text, background `=/uploads/presets/kokiri-forest-bg.jpg`, music `=/uploads/presets/sarias-theme.mp3`.
- Preset assets live in `public/uploads/presets/` (gitignored — force-add to commit). Background images are pre-processed with **sharp**: resize to cover, `modulate` (lower brightness ~0.66–0.82, boost saturation), and composite a dark green SVG scrim/vignette so light text stays legible. Output progressive mozjpeg ~80–86 quality (keeps files ~80–210 KB).
- **Background fidelity vs sharpness tradeoff** (learned with the user): the authentic Kokiri Forest is a 1998 N64 render — only ~1080p and soft, so it looks blurry on 4K monitors and that's inherent (no detail to upscale). A true 4K royalty-free forest photo is sharp but isn't the literal game. The user chose the authentic N64 image knowing it's soft at 4K.
- **Copyright note**: actual Zelda/Nintendo art (Kokiri Forest, OoT screenshots) and the original Saria's Song are copyrighted. Using them is the site owner's call/risk for a personal site — don't source/deploy copyrighted assets without explicit user confirmation. Pinterest is login-gated and can't be fetched directly. Alpha Coders full-res URL pattern: `images{N}.alphacoders.com/{first-3-digits}/{id}.png`.

## Background Music

- `BackgroundMusic` component fetches settings and plays `background_music` in a loop.
- Player appears bottom-right only when a music file is configured.
- The round button toggles play/mute **and** expands/collapses the volume panel in one tap (tap-friendly for mobile; no hover dependency). Inside the panel there's also a mute toggle + volume slider.
- Dragging the volume above 0 while muted unmutes automatically.
- Mute state is saved in `localStorage` (`bg-music-muted`).
- **Volume uses the Web Audio API (`AudioContext` → `MediaElementAudioSourceNode` → `GainNode`), NOT `audio.volume`.** On iOS/Safari `HTMLMediaElement.volume` is read-only and silently ignored, so the slider only works through a `GainNode`. The graph is built lazily inside a user gesture (autoplay policy) and the context is `resume()`d on unmute. `audio.volume` is only a pre-graph fallback (desktop).
- `audio.preload` is `'none'` while muted so a large track isn't downloaded on page load (mobile perf); `play()` forces the load on unmute.
- Autoplay with sound is blocked until a user gesture — the track never plays on load by design; first play happens on the user's tap.

## Conventions

- Use `GlassCard` and `Button` for UI consistency.
- Client components must start with `'use client'`.
- Server components are the default.
- API routes use `getCurrentUser()` / `requireAuth()` from `src/lib/auth`.
- Validation schemas live in `src/lib/validators.ts`.
- Database access goes through functions in `src/lib/settings.ts`, `src/lib/projects.ts`, etc.

## Common Issues

- **Next.js cache corruption**: if you see `Cannot find module './XXX.js'` or `Cannot read properties of undefined (reading 'call')`, stop dev and run `rm -rf .next`, then restart.
- **Uploads ignored by git**: `public/uploads/*` is gitignored. Force-add specific preset/thumbnail files with `git add -f public/uploads/path/to/file` when needed.

## Useful Commands

```bash
npm run dev -- -p 3002   # Start dev server
npm run build            # Production build
npm test -- --run        # Run test suite once
npm run seed             # Seed database
```
