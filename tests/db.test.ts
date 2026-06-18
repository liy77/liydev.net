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
