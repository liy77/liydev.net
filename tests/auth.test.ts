import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, createToken, verifyToken } from '@/lib/auth'

describe('auth helpers', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-must-be-32-characters-long'
  })

  it('hashes and verifies password', async () => {
    const hash = await hashPassword('password123')
    const valid = await verifyPassword('password123', hash)
    expect(valid).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('password123')
    const valid = await verifyPassword('wrongpassword', hash)
    expect(valid).toBe(false)
  })

  it('creates and verifies JWT', async () => {
    const token = await createToken(1)
    const payload = await verifyToken(token)
    expect(payload.sub).toBe('1')
  })
})
