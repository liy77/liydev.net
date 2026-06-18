import { NextResponse } from 'next/server'
import { verifyPassword, createToken, setAuthCookie, findUserWithPassword } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

const loginAttempts = new Map<string, number[]>()

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (!forwarded) return 'unknown'
  return forwarded.split(',')[0].trim()
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const attempts = loginAttempts.get(ip) || []
  const recent = attempts.filter((t) => now - t < WINDOW_MS)
  loginAttempts.set(ip, recent)
  return recent.length >= MAX_ATTEMPTS
}

function recordAttempt(ip: string): void {
  const attempts = loginAttempts.get(ip) || []
  attempts.push(Date.now())
  loginAttempts.set(ip, attempts)
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, error: 'Too many attempts' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Malformed JSON' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
  }

  const user = await findUserWithPassword(parsed.data.email)
  if (!user) {
    recordAttempt(ip)
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await verifyPassword(parsed.data.password, user.password_hash)
  if (!valid) {
    recordAttempt(ip)
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createToken(user.id)
  setAuthCookie(token)

  return NextResponse.json({ success: true })
}
