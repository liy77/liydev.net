import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

let db: InstanceType<typeof Database> | null = null

export function getDatabase(): InstanceType<typeof Database> {
  if (db) {
    return db
  }

  const rawDbPath = process.env.DATABASE_URL ?? path.join('data', 'portfolio.db')

  // SQLite treats `:memory:` as a special name for an in-memory database.
  // Do not resolve it to an absolute path or create parent directories.
  const dbPath = rawDbPath === ':memory:' ? ':memory:' : path.resolve(rawDbPath)

  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  }

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  return db
}

export function initializeDatabase(): void {
  const database = getDatabase()
  const schemaPath = resolveSchemaPath()
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  database.exec(schema)
}

/**
 * Closes the global singleton database connection and resets the singleton.
 * This is acceptable in the current architecture because tests run with an
 * in-memory database (`:memory:`) and Vitest isolates each test file in its
 * own process by default.
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

function resolveSchemaPath(): string {
  const candidates = [
    typeof __dirname !== 'undefined'
      ? path.join(__dirname, 'schema.sql')
      : path.join(process.cwd(), 'src/lib/schema.sql'),
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
