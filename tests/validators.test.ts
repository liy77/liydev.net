import { describe, it, expect } from 'vitest'
import { loginSchema, projectSchema, projectWithImageSchema } from '@/lib/validators'

describe('loginSchema', () => {
  it('accepts valid login', () => {
    const result = loginSchema.safeParse({ email: 'admin@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'admin@example.com', password: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(result.success).toBe(false)
  })
})

describe('projectSchema', () => {
  it('accepts valid project', () => {
    const result = projectSchema.safeParse({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'A language that transpiles to Rust.',
      description: 'Copper is a high-level language.',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid slug', () => {
    const result = projectSchema.safeParse({
      title: 'Copper Lang',
      slug: 'Copper Lang',
      short_description: 'A language that transpiles to Rust.',
      description: 'Copper is a high-level language.',
      github_url: 'https://github.com/liy77/copper-lang',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-GitHub URL', () => {
    const result = projectSchema.safeParse({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'A language that transpiles to Rust.',
      description: 'Copper is a high-level language.',
      github_url: 'https://example.com/repo',
    })
    expect(result.success).toBe(false)
  })
})

describe('projectWithImageSchema', () => {
  it('requires image_path', () => {
    const result = projectWithImageSchema.safeParse({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'A language that transpiles to Rust.',
      description: 'Copper is a high-level language.',
      github_url: 'https://github.com/liy77/copper-lang',
    })
    expect(result.success).toBe(false)
  })
})
