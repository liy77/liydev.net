import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const dbPath = process.env.DATABASE_URL
  ? path.resolve(process.env.DATABASE_URL)
  : path.resolve(process.cwd(), 'data/portfolio.db')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

export function initializeDatabase(): void {
  const schemaPath = resolveSchemaPath()
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  db.exec(schema)
}

export function closeDatabase(): void {
  db.close()
}

function resolveSchemaPath(): string {
  const candidates = [
    path.join(__dirname, 'schema.sql'),
    path.join(process.cwd(), 'src/lib/schema.sql'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  // Fallback to the __dirname candidate so readFileSync throws a clear ENOENT.
  return candidates[0]
}
