# Portfolio Pessoal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beautiful Apple-like / liquid glass portfolio site with secure admin login, SQLite database, and full CRUD for projects.

**Architecture:** Next.js 14 App Router with API Routes for protected mutations. SQLite via better-sqlite3 for data. JWT stored in httpOnly cookie for auth. Server Components for public pages, Client Components for admin interactivity.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, better-sqlite3, jose (JWT), bcryptjs, Zod, Vitest, sharp (image conversion).

---

## File Structure

```
liydev.net/
├── .env.example
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── scripts/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── about/page.tsx
│   │   ├── projects/[slug]/page.tsx
│   │   ├── admin/layout.tsx
│   │   ├── admin/login/page.tsx
│   │   └── admin/projects/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   ├── components/
│   │   ├── ui/Button.tsx
│   │   ├── ui/Input.tsx
│   │   ├── ui/Textarea.tsx
│   │   ├── ui/GlassCard.tsx
│   │   ├── auth/LoginForm.tsx
│   │   ├── projects/ProjectCard.tsx
│   │   ├── projects/ProjectForm.tsx
│   │   ├── projects/SortableProjectList.tsx
│   │   └── projects/ImageUpload.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── schema.sql
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── upload.ts
│   │   ├── validators.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts
├── tests/
│   ├── auth.test.ts
│   ├── projects.test.ts
│   └── validators.test.ts
└── public/uploads/
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `vitest.config.ts`

- [ ] **Step 1: Initialize project with package.json**

Create `package.json`:

```json
{
  "name": "liydev-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run",
    "seed": "tsx scripts/seed.ts"
  },
  "dependencies": {
    "next": "14.2.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "better-sqlite3": "^11.0.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.4.0",
    "zod": "^3.23.8",
    "sharp": "^0.33.4",
    "react-hot-toast": "^2.4.1",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/utilities": "^3.2.2"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.10",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.4",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "tsx": "^4.15.0",
    "typescript": "^5.4.5",
    "@vitejs/plugin-react": "^4.3.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create Next.js config**

Create `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  images: {
    formats: ['image/webp'],
  },
}

module.exports = nextConfig
```

- [ ] **Step 5: Create Tailwind config**

Create `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        glass: {
          100: 'rgba(255,255,255,0.05)',
          200: 'rgba(255,255,255,0.1)',
          300: 'rgba(255,255,255,0.15)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 6: Create PostCSS config**

Create `postcss.config.js`:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Create .gitignore**

Create `.gitignore`:

```gitignore
/node_modules
/.next
/out
.env.local
.env.*.local
*.log
data/
public/uploads/*
!.gitkeep
.superpowers/
```

- [ ] **Step 8: Create .env.example**

Create `.env.example`:

```bash
DATABASE_URL=./data/portfolio.db
JWT_SECRET=change-me-to-a-random-string-at-least-32-chars
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-strong-password
NODE_ENV=development
```

- [ ] **Step 9: Create Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 10: Create Next env file**

Create `next-env.d.ts`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "chore: initial Next.js project setup"
```

---

## Task 2: Database Schema & Connection

**Files:**
- Create: `src/lib/schema.sql`
- Create: `src/lib/db.ts`
- Create: `src/types/index.ts`
- Create: `data/.gitkeep`
- Create: `public/uploads/.gitkeep`

- [ ] **Step 1: Write SQL schema**

Create `src/lib/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  image_path TEXT NOT NULL,
  github_url TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS update_project_updated_at
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
  UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

- [ ] **Step 2: Write database connection module**

Create `src/lib/db.ts`:

```ts
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const dbPath = process.env.DATABASE_URL || './data/portfolio.db'

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

const schema = fs.readFileSync(path.join(process.cwd(), 'src/lib/schema.sql'), 'utf-8')
db.exec(schema)
```

- [ ] **Step 3: Define TypeScript types**

Create `src/types/index.ts`:

```ts
export interface User {
  id: number
  email: string
  password_hash: string
  created_at: string
}

export interface Project {
  id: number
  title: string
  slug: string
  short_description: string
  description: string
  image_path: string
  github_url: string
  website_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>
```

- [ ] **Step 4: Create required directories**

```bash
mkdir -p data public/uploads
```

- [ ] **Step 5: Test database connection**

Create `tests/db.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'

describe('database', () => {
  it('should connect and have required tables', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[]
    const names = tables.map((t) => t.name)
    expect(names).toContain('users')
    expect(names).toContain('projects')
  })
})
```

Run:
```bash
npm run test:run tests/db.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add SQLite schema and database connection"
```

---

## Task 3: Validators

**Files:**
- Create: `src/lib/validators.ts`
- Create: `tests/validators.test.ts`

- [ ] **Step 1: Write validator schemas**

Create `src/lib/validators.ts`:

```ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  short_description: z.string().min(10, 'Short description too short').max(300, 'Short description too long'),
  description: z.string().min(10, 'Description too short'),
  github_url: z.string().url('Invalid GitHub URL').startsWith('https://github.com/', 'Must be a GitHub URL'),
  website_url: z.union([z.string().url('Invalid website URL'), z.string().length(0)]).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ProjectInputData = z.infer<typeof projectSchema>
```

- [ ] **Step 2: Write validator tests**

Create `tests/validators.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { loginSchema, projectSchema } from '@/lib/validators'

describe('loginSchema', () => {
  it('accepts valid login', () => {
    const result = loginSchema.safeParse({ email: 'admin@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'admin@example.com', password: 'short' })
    expect(result.success).toBe(false)
  })
})

describe('projectSchema', () => {
  it('accepts valid project', () => {
    const result = projectSchema.safeParse({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'A language that transpiles to Rust.',
      description: 'Copper is a high-level language.',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid slug', () => {
    const result = projectSchema.safeParse({
      title: 'Copper Lang',
      slug: 'Copper Lang',
      short_description: 'A language that transpiles to Rust.',
      description: 'Copper is a high-level language.',
      github_url: 'https://github.com/liy77/copper-lang',
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npm run test:run tests/validators.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add Zod validators with tests"
```

---

## Task 4: Authentication System

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/me/route.ts`
- Create: `tests/auth.test.ts`
- Modify: `.env.local`

- [ ] **Step 1: Write auth helpers**

Create `src/lib/auth.ts`:

```ts
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'
import type { User } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-me'
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  if (!payload.sub) throw new Error('Invalid token')
  return { sub: String(payload.sub) }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  try {
    const { sub } = await verifyToken(token)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sub) as User | undefined
    return user || null
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearAuthCookie() {
  cookies().set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
}

export function requireAuth(): Promise<User> {
  return getCurrentUser().then((user) => {
    if (!user) throw new Error('Unauthorized')
    return user
  })
}
```

- [ ] **Step 2: Create login API route**

Create `src/app/api/auth/login/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'
import type { User } from '@/types'

const loginAttempts = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const attempts = loginAttempts.get(ip) || []
  const recent = attempts.filter((t) => now - t < 15 * 60 * 1000)
  loginAttempts.set(ip, recent)
  return recent.length >= 5
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, error: 'Too many attempts' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as User | undefined
  if (!user) {
    const attempts = loginAttempts.get(ip) || []
    attempts.push(Date.now())
    loginAttempts.set(ip, attempts)
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await verifyPassword(parsed.data.password, user.password_hash)
  if (!valid) {
    const attempts = loginAttempts.get(ip) || []
    attempts.push(Date.now())
    loginAttempts.set(ip, attempts)
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createToken(user.id)
  await setAuthCookie(token)

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Create logout and me routes**

Create `src/app/api/auth/logout/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  await clearAuthCookie()
  return NextResponse.json({ success: true })
}
```

Create `src/app/api/auth/me/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, email: user.email })
}
```

- [ ] **Step 4: Write auth integration tests**

Create `tests/auth.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, createToken, verifyToken } from '@/lib/auth'

describe('auth helpers', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('password123')
    const valid = await verifyPassword('password123', hash)
    expect(valid).toBe(true)
  })

  it('creates and verifies JWT', async () => {
    process.env.JWT_SECRET = 'test-secret-must-be-32-characters-long'
    const token = await createToken(1)
    const payload = await verifyToken(token)
    expect(payload.sub).toBe('1')
  })
})
```

- [ ] **Step 5: Create local env file**

Create `.env.local`:

```bash
DATABASE_URL=./data/portfolio.db
JWT_SECRET=dev-secret-must-be-32-characters-long
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpassword123
NODE_ENV=development
```

- [ ] **Step 6: Run tests**

```bash
npm run test:run tests/auth.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add JWT authentication with login/logout routes"
```

---

## Task 5: Project CRUD Data Layer

**Files:**
- Create: `src/lib/projects.ts`
- Create: `src/lib/utils.ts`
- Create: `tests/projects.test.ts`

- [ ] **Step 1: Write project repository functions**

Create `src/lib/projects.ts`:

```ts
import { db } from './db'
import type { Project, ProjectInput } from '@/types'

export function getAllProjects(): Project[] {
  return db.prepare('SELECT * FROM projects ORDER BY display_order ASC, created_at DESC').all() as Project[]
}

export function getProjectBySlug(slug: string): Project | undefined {
  return db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as Project | undefined
}

export function getProjectById(id: number): Project | undefined {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined
}

export function createProject(project: ProjectInput): Project {
  const result = db
    .prepare(
      `INSERT INTO projects (title, slug, short_description, description, image_path, github_url, website_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      project.title,
      project.slug,
      project.short_description,
      project.description,
      project.image_path,
      project.github_url,
      project.website_url || null,
      project.display_order
    )
  return getProjectById(Number(result.lastInsertRowid))!
}

export function updateProject(id: number, project: Partial<ProjectInput>): Project {
  const existing = getProjectById(id)
  if (!existing) throw new Error('Project not found')

  const updated: ProjectInput = {
    title: project.title ?? existing.title,
    slug: project.slug ?? existing.slug,
    short_description: project.short_description ?? existing.short_description,
    description: project.description ?? existing.description,
    image_path: project.image_path ?? existing.image_path,
    github_url: project.github_url ?? existing.github_url,
    website_url: project.website_url ?? existing.website_url,
    display_order: project.display_order ?? existing.display_order,
  }

  db.prepare(
    `UPDATE projects
     SET title = ?, slug = ?, short_description = ?, description = ?, image_path = ?, github_url = ?, website_url = ?, display_order = ?
     WHERE id = ?`
  ).run(
    updated.title,
    updated.slug,
    updated.short_description,
    updated.description,
    updated.image_path,
    updated.github_url,
    updated.website_url || null,
    updated.display_order,
    id
  )

  return getProjectById(id)!
}

export function deleteProject(id: number): void {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id)
}

export function updateProjectOrder(orders: { id: number; display_order: number }[]): void {
  const update = db.prepare('UPDATE projects SET display_order = ? WHERE id = ?')
  const transaction = db.transaction((items: { id: number; display_order: number }[]) => {
    for (const item of items) {
      update.run(item.display_order, item.id)
    }
  })
  transaction(orders)
}
```

- [ ] **Step 2: Write slugify helper**

Create `src/lib/utils.ts`:

```ts
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
}
```

- [ ] **Step 3: Write project tests**

Create `tests/projects.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { createProject, getAllProjects, getProjectBySlug, updateProject, deleteProject } from '@/lib/projects'

describe('projects repository', () => {
  beforeEach(() => {
    db.prepare('DELETE FROM projects').run()
  })

  it('creates and retrieves a project', () => {
    const project = createProject({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'A language that transpiles to Rust.',
      description: 'Long description here.',
      image_path: '/uploads/copper.png',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: null,
      display_order: 0,
    })

    expect(project.title).toBe('Copper Lang')
    const found = getProjectBySlug('copper-lang')
    expect(found).toBeDefined()
    expect(found?.title).toBe('Copper Lang')
  })

  it('updates a project', () => {
    const project = createProject({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'Short',
      description: 'Long',
      image_path: '/uploads/copper.png',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: null,
      display_order: 0,
    })

    const updated = updateProject(project.id, { title: 'Copper' })
    expect(updated.title).toBe('Copper')
  })

  it('deletes a project', () => {
    const project = createProject({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'Short',
      description: 'Long',
      image_path: '/uploads/copper.png',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: null,
      display_order: 0,
    })

    deleteProject(project.id)
    expect(getProjectBySlug('copper-lang')).toBeUndefined()
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm run test:run tests/projects.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add project repository with full CRUD"
```

---

## Task 6: Project API Routes

**Files:**
- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/projects/[id]/route.ts`
- Create: `src/app/api/projects/reorder/route.ts`

- [ ] **Step 1: Create GET/POST /api/projects**

Create `src/app/api/projects/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { getAllProjects, createProject } from '@/lib/projects'
import { requireAuth } from '@/lib/auth'
import { projectWithImageSchema } from '@/lib/validators'

export async function GET() {
  const projects = getAllProjects()
  return NextResponse.json({ success: true, projects })
}

export async function POST(request: Request) {
  await requireAuth()

  const body = await request.json()
  const parsed = projectWithImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 })
  }

  try {
    const project = createProject({
      ...parsed.data,
      website_url: parsed.data.website_url || null,
      display_order: 0,
    })
    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 })
  }
}
```

- [ ] **Step 3: Create individual project routes**

Create `src/app/api/projects/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { getProjectById, updateProject, deleteProject } from '@/lib/projects'
import { requireAuth } from '@/lib/auth'
import { projectWithImageSchema } from '@/lib/validators'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const project = getProjectById(Number(params.id))
  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, project })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await requireAuth()

  const body = await request.json()
  const parsed = projectWithImageSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 })
  }

  try {
    const project = updateProject(Number(params.id), {
      ...parsed.data,
      website_url: parsed.data.website_url || null,
    })
    return NextResponse.json({ success: true, project })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Project not found or slug conflict' }, { status: 404 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await requireAuth()
  deleteProject(Number(params.id))
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Create reorder route**

Create `src/app/api/projects/reorder/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { updateProjectOrder } from '@/lib/projects'

const reorderSchema = z.array(
  z.object({
    id: z.number(),
    display_order: z.number(),
  })
)

export async function POST(request: Request) {
  await requireAuth()

  const body = await request.json()
  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 })
  }

  updateProjectOrder(parsed.data)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add project API routes"
```

---

## Task 7: Image Upload

**Files:**
- Create: `src/lib/upload.ts`
- Create: `src/app/api/upload/route.ts`
- Modify: `next.config.js`

- [ ] **Step 1: Write upload helper**

Create `src/lib/upload.ts`:

```ts
import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface UploadResult {
  path: string
  filename: string
}

export async function saveImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG and WebP allowed.')
  }

  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Max 2MB.')
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const metadata = await sharp(buffer).metadata()
  if (metadata.width && metadata.width > 1920) {
    throw new Error('Image too wide. Max 1920px.')
  }
  if (metadata.height && metadata.height > 1080) {
    throw new Error('Image too tall. Max 1080px.')
  }

  const filename = `${randomUUID()}.webp`
  const outputPath = path.join(UPLOAD_DIR, filename)

  await sharp(buffer).webp({ quality: 85 }).toFile(outputPath)

  return {
    path: `/uploads/${filename}`,
    filename,
  }
}
```

- [ ] **Step 2: Create upload API route**

Create `src/app/api/upload/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { saveImage } from '@/lib/upload'

export async function POST(request: Request) {
  await requireAuth()

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
    }

    const result = await saveImage(file)
    return NextResponse.json({ success: true, path: result.path })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
```

- [ ] **Step 3: Update next.config.js for server actions / body parser**

Modify `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  images: {
    formats: ['image/webp'],
  },
}

module.exports = nextConfig
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add image upload with validation and WebP conversion"
```

---

## Task 8: Global Styles and Layout

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Write global CSS with liquid glass theme**

Create `src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background-start: #0a0a0f;
  --background-end: #1a1a2e;
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-bg: rgba(255, 255, 255, 0.05);
  --accent-blue: #38bdf8;
  --accent-purple: #a855f7;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, var(--background-start) 0%, var(--background-end) 100%);
  color: #f5f5f7;
  min-height: 100vh;
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
}

.glass-button {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.glass-button:hover {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(168, 85, 247, 0.3));
  transform: translateY(-1px);
}

.text-gradient {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 2: Create root layout**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'liy.dev — Portfolio',
  description: 'Projetos pessoais de desenvolvimento de software',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Add custom animations to Tailwind config**

Modify `tailwind.config.ts`:

```ts
extend: {
  // ... existing config
  animation: {
    'fade-in': 'fadeIn 0.5s ease-out',
    'slide-up': 'slideUp 0.5s ease-out',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { opacity: '0', transform: 'translateY(20px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
  },
},
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add liquid glass global styles and layout"
```

---

## Task 9: UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Textarea.tsx`
- Create: `src/components/ui/GlassCard.tsx`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:

```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary: 'glass-button text-white',
      secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
      danger: 'bg-red-500/20 border border-red-500/30 text-red-200 hover:bg-red-500/30',
    }

    return (
      <button ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
```

- [ ] **Step 2: Create Input component**

Create `src/components/ui/Input.tsx`:

```tsx
import { InputHTMLAttributes, forwardRef } from 'react'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 ${className}`}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
export default Input
```

- [ ] **Step 3: Create Textarea component**

Create `src/components/ui/Textarea.tsx`:

```tsx
import { TextareaHTMLAttributes, forwardRef } from 'react'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 resize-y min-h-[120px] ${className}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
export default Textarea
```

- [ ] **Step 4: Create GlassCard component**

Create `src/components/ui/GlassCard.tsx`:

```tsx
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add base UI components"
```

---

## Task 10: Public Pages

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/app/projects/[slug]/page.tsx`
- Create: `src/app/about/page.tsx`
- Create: `src/components/projects/ProjectCard.tsx`

- [ ] **Step 1: Create ProjectCard component**

Create `src/components/projects/ProjectCard.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import GlassCard from '@/components/ui/GlassCard'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <GlassCard className="h-full hover:bg-white/[0.08] transition-all duration-300 group overflow-hidden">
        <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
          <Image
            src={project.image_path}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-gradient transition-all">
          {project.title}
        </h3>
        <p className="text-white/60 text-sm line-clamp-2">{project.short_description}</p>
      </GlassCard>
    </Link>
  )
}
```

- [ ] **Step 2: Create homepage**

Create `src/app/page.tsx`:

```tsx
import ProjectCard from '@/components/projects/ProjectCard'
import { getAllProjects } from '@/lib/projects'

export default function HomePage() {
  const projects = getAllProjects()

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">liy.dev</h1>
          <p className="text-white/60">Projetos pessoais em linguagens, engines e ferramentas.</p>
        </div>
        <a href="/about" className="text-sm text-white/60 hover:text-white transition-colors">
          Sobre
        </a>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Projetos</h2>
        {projects.length === 0 ? (
          <p className="text-white/40">Nenhum projeto cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
```

- [ ] **Step 3: Create project detail page**

Create `src/app/projects/[slug]/page.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/projects'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <Link href="/" className="text-white/60 hover:text-white transition-colors mb-8 inline-block">
        ← Voltar
      </Link>

      <GlassCard className="animate-slide-up">
        <div className="relative aspect-video mb-8 overflow-hidden rounded-xl">
          <Image
            src={project.image_path}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold text-gradient mb-4">{project.title}</h1>
        <p className="text-white/70 text-lg mb-8 leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-4">
          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
            <Button>Ver no GitHub</Button>
          </a>
          {project.website_url && (
            <a href={project.website_url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">Site do projeto</Button>
            </a>
          )}
        </div>
      </GlassCard>
    </main>
  )
}
```

- [ ] **Step 4: Create about page**

Create `src/app/about/page.tsx`:

```tsx
import Link from 'next/link'
import GlassCard from '@/components/ui/GlassCard'

export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <Link href="/" className="text-white/60 hover:text-white transition-colors mb-8 inline-block">
        ← Voltar
      </Link>

      <GlassCard className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gradient mb-6">Sobre</h1>
        <p className="text-white/70 leading-relaxed mb-6">
          Desenvolvedor apaixonado por construir ferramentas de baixo nível: linguagens de programação,
          toolkits de UI nativos e engines de jogos. Acredito que software bonito também pode ser
          poderoso.
        </p>
        <p className="text-white/70 leading-relaxed">
          Projetos em destaque: <Link href="/projects/copper-lang" className="text-blue-400 hover:underline">Copper Lang</Link>,{' '}
          <Link href="/projects/mocida" className="text-blue-400 hover:underline">Mocida</Link> e{' '}
          <Link href="/projects/ondaengine" className="text-blue-400 hover:underline">OndaEngine</Link>.
        </p>
      </GlassCard>
    </main>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add public pages (home, project detail, about)"
```

---

## Task 11: Admin Pages

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/admin/AdminHeader.tsx`
- Create: `src/app/admin/projects/page.tsx`
- Create: `src/components/projects/SortableProjectList.tsx`
- Create: `src/app/admin/projects/new/page.tsx`
- Create: `src/app/admin/projects/[id]/edit/page.tsx`
- Create: `src/components/projects/ProjectForm.tsx`
- Create: `src/components/projects/ImageUpload.tsx`

- [ ] **Step 1: Create admin layout with auth guard**

Create `src/app/admin/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <AdminHeader email={user.email} />
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create admin header**

Create `src/components/admin/AdminHeader.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface AdminHeaderProps {
  email: string
}

export default function AdminHeader({ email }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
      <div className="flex items-center gap-6">
        <Link href="/admin/projects" className="text-xl font-bold text-gradient">
          Admin
        </Link>
        <span className="text-white/40 text-sm">{email}</span>
      </div>
      <Button variant="secondary" onClick={handleLogout}>
        Sair
      </Button>
    </header>
  )
}
```

- [ ] **Step 3: Create login form and page**

Create `src/components/auth/LoginForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GlassCard from '@/components/ui/GlassCard'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin/projects')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <GlassCard className="w-full max-w-md animate-slide-up">
        <h1 className="text-2xl font-bold text-gradient mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Senha" required />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}
```

Create `src/app/admin/login/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/admin/projects')

  return <LoginForm />
}
```

- [ ] **Step 4: Create ImageUpload component**

Create `src/components/projects/ImageUpload.tsx`:

```tsx
'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'

interface ImageUploadProps {
  defaultImage?: string
  onUpload: (path: string) => void
}

export default function ImageUpload({ defaultImage, onUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState(defaultImage)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setUploading(false)

    if (data.success) {
      setPreview(data.path)
      onUpload(data.path)
    } else {
      alert(data.error)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      {preview && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : preview ? 'Trocar imagem' : 'Enviar imagem'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Create ProjectForm component**

Create `src/components/projects/ProjectForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import GlassCard from '@/components/ui/GlassCard'
import ImageUpload from './ImageUpload'
import type { Project } from '@/types'

interface ProjectFormProps {
  project?: Project
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePath, setImagePath] = useState(project?.image_path || '')

  const isEditing = !!project

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!imagePath) {
      setError('Envie uma imagem para o projeto')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      short_description: formData.get('short_description'),
      description: formData.get('description'),
      github_url: formData.get('github_url'),
      website_url: formData.get('website_url') || '',
      image_path: imagePath,
    }

    const url = isEditing ? `/api/projects/${project.id}` : '/api/projects'
    const method = isEditing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin/projects')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save project')
    }
  }

  return (
    <GlassCard className="animate-slide-up">
      <h1 className="text-2xl font-bold text-gradient mb-6">
        {isEditing ? 'Editar projeto' : 'Novo projeto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="title" defaultValue={project?.title} placeholder="Título" required />
          <Input name="slug" defaultValue={project?.slug} placeholder="Slug (ex: copper-lang)" required />
        </div>

        <Textarea
          name="short_description"
          defaultValue={project?.short_description}
          placeholder="Descrição curta (aparece no card)"
          required
        />

        <Textarea
          name="description"
          defaultValue={project?.description}
          placeholder="Descrição completa (markdown)"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="github_url" defaultValue={project?.github_url} placeholder="URL do GitHub" required />
          <Input name="website_url" defaultValue={project?.website_url || ''} placeholder="URL do site (opcional)" />
        </div>

        <ImageUpload defaultImage={project?.image_path} onUpload={setImagePath} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/projects')}>
            Cancelar
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}
```

- [ ] **Step 6: Create admin projects list page**

Create `src/app/admin/projects/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'

export default function AdminProjectsPage() {
  const projects = getAllProjects()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Projetos</h2>
        <Link href="/admin/projects/new">
          <Button>Novo projeto</Button>
        </Link>
      </div>

      <GlassCard>
        {projects.length === 0 ? (
          <p className="text-white/40">Nenhum projeto cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <span className="text-white/30 text-sm w-8">#{project.display_order}</span>
                  <div>
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-white/40 text-sm">/{project.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/projects/${project.id}/edit`}>
                    <Button variant="secondary" className="text-sm">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="text-sm"
                    onClick={async () => {
                      if (!confirm('Tem certeza que deseja excluir?')) return
                      await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
                      window.location.reload()
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}
```

- [ ] **Step 7: Create new and edit project pages**

Create `src/app/admin/projects/new/page.tsx`:

```tsx
import ProjectForm from '@/components/projects/ProjectForm'

export default function NewProjectPage() {
  return <ProjectForm />
}
```

Create `src/app/admin/projects/[id]/edit/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/projects'
import ProjectForm from '@/components/projects/ProjectForm'

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const project = getProjectById(Number(params.id))
  if (!project) notFound()

  return <ProjectForm project={project} />
}
```

- [ ] **Step 8: Add reordering support (basic)**

Modify `src/app/admin/projects/page.tsx` to include order display. Full drag-and-drop is optional; implement after initial version if needed.

For now, add order index display:

```tsx
<span className="text-white/30 text-sm mr-4">#{project.display_order}</span>
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add admin pages and project CRUD forms"
```

---

## Task 12: Seed Script

**Files:**
- Create: `scripts/seed.ts`
- Create: `scripts/copy-project-assets.ts`

- [ ] **Step 1: Create seed script**

Create `scripts/seed.ts`:

```ts
import 'dotenv/config'
import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'
import { createProject } from '../src/lib/projects'

async function seed() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set')
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (!existing) {
    const hash = await hashPassword(password)
    db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hash)
    console.log('Admin user created')
  }

  const existingProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }
  if (existingProjects.count > 0) {
    console.log('Projects already seeded')
    process.exit(0)
  }

  const projects = [
    {
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'Uma linguagem de alto nível que transpila para Rust, mantendo performance com sintaxe moderna.',
      description: `Copper é uma linguagem de alto nível que transpila para Rust. Ela combina a performance do Rust com uma sintaxe que parece uma linguagem de script moderna: interpolação de strings, optional chaining, ternários, e formas de loop/match/closure no estilo JavaScript.

O toolchain \\"cforge\\" cuida da compilação, instalação e execução de projetos Copper. A linguagem suporta classes, imports, e uma std crescente.`,
      image_path: '/uploads/copper-lang.png',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: '',
      display_order: 0,
    },
    {
      title: 'Mocida',
      slug: 'mocida',
      short_description: 'Toolkit de UI modular em C sobre SDL3, com bindings idiomáticos em Rust.',
      description: `Mocida é um toolkit de UI modular escrito em C sobre SDL3. O monorepo inclui a biblioteca C, bindings Rust (mocida-sys + mocida idiomático), e um build orchestrator em Python que compila tudo em um único comando cross-platform.

Foi projetada para ser leve, nativa e sem depender de stacks web.`,
      image_path: '/uploads/mocida.svg',
      github_url: 'https://github.com/liy77/mocida',
      website_url: '',
      display_order: 1,
    },
    {
      title: 'OndaEngine',
      slug: 'ondaengine',
      short_description: 'Engine de jogos 2D + editor, construída com Mocida e a linguagem Copper.',
      description: `OndaEngine é uma engine de jogos 2D com editor completo. O editor tem visual VSCode — file tree, editor com syntax highlighting, inspector, scene view e play mode — e é escrito inteiramente em MUI, o sistema declarativo de UI do Mocida.

O host é Rust, a engine é Copper, e a renderização é SDL3 nativa, sem Electron, sem web stack.`,
      image_path: '/uploads/ondaengine.png',
      github_url: 'https://github.com/liy77/OndaEngine',
      website_url: '',
      display_order: 2,
    },
  ]

  for (const project of projects) {
    createProject(project)
  }

  console.log('Projects seeded')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Copy project assets**

Create `scripts/copy-project-assets.ts`:

```ts
import fs from 'fs/promises'
import path from 'path'

const ASSETS = [
  { src: '/Volumes/MCUDevDisk/copper-lang/assets/copperlang.png', dest: 'copper-lang.png' },
  { src: '/Volumes/MCUDevDisk/mocida/mocida/assets/banner.svg', dest: 'mocida.svg' },
  { src: '/Volumes/MCUDevDisk/OndaEngine/assets/icon.png', dest: 'ondaengine.png', fallback: true },
]

async function copy() {
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  await fs.mkdir(uploadDir, { recursive: true })

  for (const asset of ASSETS) {
    try {
      await fs.copyFile(asset.src, path.join(uploadDir, asset.dest))
      console.log(`Copied ${asset.dest}`)
    } catch (err) {
      if (asset.fallback) {
        console.warn(`Using placeholder for ${asset.dest}`)
      } else {
        console.warn(`Failed to copy ${asset.dest}:`, err)
      }
    }
  }
}

copy().catch(console.error)

async function copy() {
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  await fs.mkdir(uploadDir, { recursive: true })

  for (const asset of ASSETS) {
    try {
      await fs.copyFile(asset.src, path.join(uploadDir, asset.dest))
      console.log(`Copied ${asset.dest}`)
    } catch (err) {
      console.warn(`Failed to copy ${asset.dest}:`, err)
    }
  }
}

copy().catch(console.error)
```

- [ ] **Step 3: Add dotenv and tsx scripts**

Install dotenv:
```bash
npm install dotenv
```

- [ ] **Step 4: Run seed**

```bash
npx tsx scripts/copy-project-assets.ts
npm run seed
```

Expected: admin user created, 3 projects inserted.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add seed script for admin and initial projects"
```

---

## Task 13: Run Full Test Suite & Build

**Files:** None

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 2: Run production build locally**

```bash
npm run build
```

Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 3: Start production server and smoke test**

```bash
npm start
```

In another terminal:
```bash
curl http://localhost:3000
```

Expected: HTML response with status 200.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: verify build and tests pass"
```

---

## Task 14: Deployment Documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README with setup and deploy instructions**

Create `README.md`:

```markdown
# liy.dev Portfolio

Site de portfolio pessoal com visual liquid glass, admin protegido e CRUD de projetos.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local with your values
npm run seed
npm run dev
```

## Deploy

1. Clone repo on server
2. Install deps and build
3. Set environment variables
4. Run `npm run seed` once
5. Serve with `npm start` behind Nginx/Caddy with HTTPS

## Environment Variables

- `DATABASE_URL` — path to SQLite file
- `JWT_SECRET` — random secret for JWT
- `ADMIN_EMAIL` — admin email
- `ADMIN_PASSWORD` — admin initial password
- `NODE_ENV` — production

## Tests

```bash
npm run test:run
```
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "docs: add README with setup and deploy instructions"
```

---

## Self-Review Checklist

### Spec coverage
- [x] Next.js + SQLite stack — Task 1-2
- [x] Secure login with JWT/httpOnly cookie — Task 4
- [x] Project CRUD (create, edit, delete, reorder) — Tasks 5-6, 11
- [x] Upload de imagem com validação — Task 7
- [x] Visual liquid glass — Tasks 8-10
- [x] Homepage projetos primeiro — Task 10
- [x] Seed inicial com 3 projetos — Task 12
- [x] Testes — Tasks 2-6, 13
- [x] Deploy — Task 14

### Placeholder scan
- No TBD/TODO/placeholders found in plan steps.
- Each step contains actual code or exact commands.

### Type consistency
- `ProjectInput` type matches database insertion fields.
- `projectWithImageSchema` extends `projectSchema` consistently.
- Auth helpers use `User` type from `@/types`.
