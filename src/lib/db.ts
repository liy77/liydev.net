import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { seedDefaultPresets } from './themePresets'

let db: InstanceType<typeof Database> | null = null
let initialized = false

const SCHEMA_SQL = `
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

CREATE TABLE IF NOT EXISTS theme_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  settings TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  theme_mode TEXT NOT NULL DEFAULT 'dark',
  background_start TEXT NOT NULL DEFAULT '#0a0a0f',
  background_end TEXT NOT NULL DEFAULT '#1a1a2e',
  background_mid TEXT NOT NULL DEFAULT '#0f0f1a',
  background_start_light TEXT NOT NULL DEFAULT '#f0f0f5',
  background_end_light TEXT NOT NULL DEFAULT '#e3e3e9',
  background_mid_light TEXT NOT NULL DEFAULT '#ebebf0',
  text_primary TEXT NOT NULL DEFAULT '#f5f5f7',
  text_secondary TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.7)',
  text_muted TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.5)',
  text_primary_light TEXT NOT NULL DEFAULT '#1d1d1f',
  text_secondary_light TEXT NOT NULL DEFAULT 'rgba(0, 0, 0, 0.75)',
  text_muted_light TEXT NOT NULL DEFAULT 'rgba(0, 0, 0, 0.55)',
  accent_color TEXT NOT NULL DEFAULT '#38bdf8',
  accent_color_light TEXT NOT NULL DEFAULT '#38bdf8',
  glass_bg TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.08)',
  glass_border TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.18)',
  glass_border_highlight TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.35)',
  glass_bg_light TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.25)',
  glass_border_light TEXT NOT NULL DEFAULT 'rgba(0, 0, 0, 0.12)',
  glass_border_highlight_light TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.7)',
  text_gradient_start TEXT NOT NULL DEFAULT '#38bdf8',
  text_gradient_end TEXT NOT NULL DEFAULT '#a855f7',
  use_text_gradient INTEGER NOT NULL DEFAULT 1,
  glass_intensity INTEGER NOT NULL DEFAULT 70,
  background_image TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

export function getDatabase(): InstanceType<typeof Database> {
  if (db) {
    return db
  }

  const rawDbPath = process.env.DATABASE_URL ?? path.join('data', 'portfolio.db')
  const effectiveDbPath =
    typeof rawDbPath === 'string' && rawDbPath.trim() !== ''
      ? rawDbPath
      : path.join('data', 'portfolio.db')

  // SQLite treats `:memory:` as a special name for an in-memory database.
  // Do not resolve it to an absolute path or create parent directories.
  const dbPath = effectiveDbPath === ':memory:' ? ':memory:' : path.resolve(effectiveDbPath)

  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  }

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  // In production/runtime environments, initialize the schema automatically
  // on first connection. Tests continue to initialize explicitly.
  if (!initialized && process.env.NODE_ENV !== 'test') {
    initializeDatabase()
  }

  return db
}

export function initializeDatabase(): void {
  const database = getDatabase()
  database.exec(SCHEMA_SQL)
  runMigrations(database)
  seedDefaultPresets()
  initialized = true
}

function runMigrations(database: InstanceType<typeof Database>): void {
  const columns = database
    .prepare<[], { name: string }>("PRAGMA table_info(site_settings)")
    .all()
    .map((c) => c.name)

  const addColumn = (name: string, def: string) => {
    if (!columns.includes(name)) {
      database.exec(`ALTER TABLE site_settings ADD COLUMN ${name} ${def}`)
    }
  }

  addColumn("theme_mode", "TEXT NOT NULL DEFAULT 'dark'")
  addColumn("background_start_light", "TEXT NOT NULL DEFAULT '#f0f0f5'")
  addColumn("background_end_light", "TEXT NOT NULL DEFAULT '#e3e3e9'")
  addColumn("background_mid_light", "TEXT NOT NULL DEFAULT '#ebebf0'")
  addColumn("text_primary_light", "TEXT NOT NULL DEFAULT '#1d1d1f'")
  addColumn("text_secondary_light", "TEXT NOT NULL DEFAULT 'rgba(0,0,0,0.75)'")
  addColumn("text_muted_light", "TEXT NOT NULL DEFAULT 'rgba(0,0,0,0.55)'")
  addColumn("accent_color_light", "TEXT NOT NULL DEFAULT '#38bdf8'")
  addColumn("glass_bg_light", "TEXT NOT NULL DEFAULT 'rgba(255,255,255,0.25)'")
  addColumn("glass_border_light", "TEXT NOT NULL DEFAULT 'rgba(0,0,0,0.12)'")
  addColumn("glass_border_highlight_light", "TEXT NOT NULL DEFAULT 'rgba(255,255,255,0.7)'")
  addColumn("text_gradient_start", "TEXT NOT NULL DEFAULT '#38bdf8'")
  addColumn("text_gradient_end", "TEXT NOT NULL DEFAULT '#a855f7'")
  addColumn("use_text_gradient", "INTEGER NOT NULL DEFAULT 1")
  addColumn("glass_intensity", "INTEGER NOT NULL DEFAULT 70")
}

/**
 * Closes the global singleton database connection and resets the singleton.
 * Tests run with an in-memory database (`:memory:`) and Vitest isolates each
 * test file in its own process because `pool: 'forks'` is configured.
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    initialized = false
  }
}
