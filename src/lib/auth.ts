import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getDatabase, initializeDatabase } from './db'
import type { User, UserWithPassword } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-me'
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  if (!payload.sub) throw new Error('Invalid token')
  return { sub: String(payload.sub) }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  try {
    const { sub } = await verifyToken(token)
    const db = getDatabase()
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(sub) as User | undefined
    return user || null
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearAuthCookie() {
  cookies().set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function findUserWithPassword(email: string): Promise<UserWithPassword | undefined> {
  const db = getDatabase()
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserWithPassword | undefined
}
