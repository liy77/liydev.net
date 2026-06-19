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
