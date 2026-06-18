import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'

vi.hoisted(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-32-characters-long'
})

const mockCookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookieStore),
}))

import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
} from '@/lib/auth'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { initializeDatabase, getDatabase, closeDatabase } from '@/lib/db'

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

describe('auth API routes', () => {
  beforeAll(async () => {
    initializeDatabase()
    const db = getDatabase()
    const hash = await hashPassword('password123')
    db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run('admin@example.com', hash)
  })

  afterAll(() => {
    closeDatabase()
  })

  beforeEach(() => {
    mockCookieStore.get.mockReset()
    mockCookieStore.set.mockReset()
  })

  it('login route returns success for valid credentials', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
    })
    const response = await loginPOST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('login route returns 401 for invalid credentials', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpassword' }),
    })
    const response = await loginPOST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('login route returns 400 for malformed JSON', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })
    const response = await loginPOST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('logout route returns success', async () => {
    const response = await logoutPOST()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('me route returns 401 when not authenticated', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    const response = await meGET()
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.authenticated).toBe(false)
  })

  it('me route returns user when authenticated', async () => {
    const token = await createToken(1)
    mockCookieStore.get.mockReturnValue({ value: token })
    const response = await meGET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.authenticated).toBe(true)
    expect(data.email).toBe('admin@example.com')
  })
})
