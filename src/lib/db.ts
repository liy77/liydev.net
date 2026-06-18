import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const dbPath = process.env.DATABASE_URL || './data/portfolio.db'

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

const schema = fs.readFileSync(path.join(process.cwd(), 'src/lib/schema.sql'), 'utf-8')
db.exec(schema)
