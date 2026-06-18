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

import { createToken } from '@/lib/auth'
import { initializeDatabase, getDatabase, closeDatabase } from '@/lib/db'
import { GET as projectsGET, POST as projectsPOST } from '@/app/api/projects/route'
import { GET as projectGET, PUT as projectPUT, DELETE as projectDELETE } from '@/app/api/projects/[id]/route'
import { POST as reorderPOST } from '@/app/api/projects/reorder/route'

describe('projects API routes', () => {
  let token: string
  let projectId: number

  beforeAll(async () => {
    initializeDatabase()
    const db = getDatabase()
    db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run('admin@example.com', 'hash')
    token = await createToken(1)
  })

  afterAll(() => {
    closeDatabase()
  })

  beforeEach(() => {
    mockCookieStore.get.mockReset()
    mockCookieStore.set.mockReset()
  })

  it('GET /api/projects returns projects', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const createRequest = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Project',
        slug: 'test-project',
        short_description: 'A short description',
        description: 'A longer description',
        image_path: '/uploads/image.png',
        github_url: 'https://github.com/user/repo',
      }),
    })
    await projectsPOST(createRequest)

    const response = await projectsGET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.projects.length).toBeGreaterThan(0)
  })

  it('POST /api/projects without auth returns 401', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    const request = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthorized Project',
        slug: 'unauthorized-project',
        short_description: 'A short description',
        description: 'A longer description',
        image_path: '/uploads/image.png',
        github_url: 'https://github.com/user/repo',
      }),
    })
    const response = await projectsPOST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('POST /api/projects with auth creates project', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const request = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Auth Project',
        slug: 'auth-project',
        short_description: 'A short description',
        description: 'A longer description',
        image_path: '/uploads/image.png',
        github_url: 'https://github.com/user/repo',
        website_url: 'https://example.com',
      }),
    })
    const response = await projectsPOST(request)
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.project.title).toBe('Auth Project')
    projectId = data.project.id
  })

  it('PUT /api/projects/[id] with auth updates project', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const request = new Request(`http://localhost/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Project' }),
    })
    const response = await projectPUT(request, { params: { id: String(projectId) } })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.project.title).toBe('Updated Project')

    const getResponse = await projectGET(new Request(`http://localhost/api/projects/${projectId}`), {
      params: { id: String(projectId) },
    })
    const getData = await getResponse.json()
    expect(getData.project.title).toBe('Updated Project')
  })

  it('DELETE /api/projects/[id] without auth returns 401', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    const request = new Request(`http://localhost/api/projects/${projectId}`, {
      method: 'DELETE',
    })
    const response = await projectDELETE(request, { params: { id: String(projectId) } })
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('Malformed JSON returns 400', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const request = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })
    const response = await projectsPOST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid JSON')
  })

  it('GET /api/projects/[id] returns project', async () => {
    const response = await projectGET(new Request(`http://localhost/api/projects/${projectId}`), {
      params: { id: String(projectId) },
    })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.project.id).toBe(projectId)
  })

  it('GET /api/projects/[id] with invalid ID returns 400', async () => {
    const response = await projectGET(new Request('http://localhost/api/projects/not-a-number'), {
      params: { id: 'not-a-number' },
    })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid project ID')
  })

  it('GET /api/projects/[id] with non-existent ID returns 404', async () => {
    const response = await projectGET(new Request('http://localhost/api/projects/999999'), {
      params: { id: '999999' },
    })
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Project not found')
  })

  it('PUT /api/projects/[id] partial update preserves website_url', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const response = await projectPUT(
      new Request(`http://localhost/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Partially Updated Project' }),
      }),
      { params: { id: String(projectId) } }
    )
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.project.title).toBe('Partially Updated Project')
    expect(data.project.website_url).toBe('https://example.com')
  })

  it('PUT /api/projects/[id] with slug conflict returns 409', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const response = await projectPUT(
      new Request(`http://localhost/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'test-project' }),
      }),
      { params: { id: String(projectId) } }
    )
    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Slug already exists')
  })

  it('POST /api/projects/reorder with auth succeeds', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const request = new Request('http://localhost/api/projects/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: projectId, display_order: 5 }]),
    })
    const response = await reorderPOST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('DELETE /api/projects/[id] with auth succeeds', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const request = new Request(`http://localhost/api/projects/${projectId}`, {
      method: 'DELETE',
    })
    const response = await projectDELETE(request, { params: { id: String(projectId) } })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('DELETE /api/projects/[id] for non-existent returns 404', async () => {
    mockCookieStore.get.mockReturnValue({ value: token })
    const request = new Request('http://localhost/api/projects/999999', {
      method: 'DELETE',
    })
    const response = await projectDELETE(request, { params: { id: '999999' } })
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Project not found')
  })
})
