import { NextResponse } from 'next/server'
import { verifyPassword, createToken, setAuthCookie, findUserWithPassword } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'

const loginAttempts = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const attempts = loginAttempts.get(ip) || []
  const recent = attempts.filter((t) => now - t < 15 * 60 * 1000)
  loginAttempts.set(ip, recent)
  return recent.length >= 5
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, error: 'Too many attempts' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
  }

  const user = await findUserWithPassword(parsed.data.email)
  if (!user) {
    const attempts = loginAttempts.get(ip) || []
    attempts.push(Date.now())
    loginAttempts.set(ip, attempts)
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await verifyPassword(parsed.data.password, user.password_hash)
  if (!valid) {
    const attempts = loginAttempts.get(ip) || []
    attempts.push(Date.now())
    loginAttempts.set(ip, attempts)
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createToken(user.id)
  await setAuthCookie(token)

  return NextResponse.json({ success: true })
}
