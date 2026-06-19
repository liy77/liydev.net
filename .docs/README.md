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
  - Theme presets (save current theme, load, delete)
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

- `theme_mode` — `dark`, `light`, or `system`
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
- Classes:
  - `.glass-card` — frosted glass panel with animated shine on hover
  - `.glass-button` — frosted glass button
  - `.text-gradient` — gradient text using theme colors

## Background Music

- `BackgroundMusic` component fetches settings and plays `background_music` in a loop.
- Player appears bottom-right only when a music file is configured.
- User can mute/unmute and adjust volume.
- Mute state is saved in `localStorage` (`bg-music-muted`).

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
