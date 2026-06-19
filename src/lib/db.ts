import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

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
  initialized = true
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
