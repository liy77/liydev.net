import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  getDatabase,
  initializeDatabase,
  closeDatabase,
} from '@/lib/db'

describe('database', () => {
  beforeAll(() => {
    initializeDatabase()
  })

  afterAll(() => {
    closeDatabase()
  })

  it('should connect and have required tables', () => {
    const db = getDatabase()
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[]
    const names = tables.map((t) => t.name)
    expect(names).toContain('users')
    expect(names).toContain('projects')
  })

  it('should have required users columns', () => {
    const db = getDatabase()
    const columns = db
      .prepare('PRAGMA table_info(users)')
      .all() as { name: string }[]
    const names = columns.map((c) => c.name)
    expect(names).toContain('id')
    expect(names).toContain('email')
    expect(names).toContain('password_hash')
    expect(names).toContain('created_at')
  })

  it('should have required projects columns', () => {
    const db = getDatabase()
    const columns = db
      .prepare('PRAGMA table_info(projects)')
      .all() as { name: string }[]
    const names = columns.map((c) => c.name)
    expect(names).toContain('id')
    expect(names).toContain('title')
    expect(names).toContain('slug')
    expect(names).toContain('short_description')
    expect(names).toContain('description')
    expect(names).toContain('image_path')
    expect(names).toContain('github_url')
    expect(names).toContain('website_url')
    expect(names).toContain('display_order')
    expect(names).toContain('created_at')
    expect(names).toContain('updated_at')
  })
})
