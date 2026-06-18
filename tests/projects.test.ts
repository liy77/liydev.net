import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { getDatabase, initializeDatabase, closeDatabase } from '@/lib/db'
import {
  createProject,
  getAllProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
  updateProjectOrder,
} from '@/lib/projects'

describe('projects repository', () => {
  beforeEach(() => {
    initializeDatabase()
    getDatabase().prepare('DELETE FROM projects').run()
  })

  afterAll(() => {
    closeDatabase()
  })

  it('creates and retrieves a project', () => {
    const project = createProject({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'A language that transpiles to Rust.',
      description: 'Long description here.',
      image_path: '/uploads/copper.png',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: null,
      display_order: 0,
    })

    expect(project.title).toBe('Copper Lang')
    const found = getProjectBySlug('copper-lang')
    expect(found).toBeDefined()
    expect(found?.title).toBe('Copper Lang')
  })

  it('updates a project', () => {
    const project = createProject({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'Short',
      description: 'Long',
      image_path: '/uploads/copper.png',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: null,
      display_order: 0,
    })

    const updated = updateProject(project.id, { title: 'Copper' })
    expect(updated.title).toBe('Copper')
  })

  it('deletes a project', () => {
    const project = createProject({
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'Short',
      description: 'Long',
      image_path: '/uploads/copper.png',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: null,
      display_order: 0,
    })

    deleteProject(project.id)
    expect(getProjectBySlug('copper-lang')).toBeUndefined()
  })

  it('updates project order', () => {
    const p1 = createProject({
      title: 'A',
      slug: 'a',
      short_description: 'Short A',
      description: 'Long A',
      image_path: '/uploads/a.png',
      github_url: 'https://github.com/liy77/a',
      website_url: null,
      display_order: 0,
    })
    const p2 = createProject({
      title: 'B',
      slug: 'b',
      short_description: 'Short B',
      description: 'Long B',
      image_path: '/uploads/b.png',
      github_url: 'https://github.com/liy77/b',
      website_url: null,
      display_order: 1,
    })

    updateProjectOrder([
      { id: p1.id, display_order: 1 },
      { id: p2.id, display_order: 0 },
    ])

    const projects = getAllProjects()
    expect(projects[0].id).toBe(p2.id)
    expect(projects[1].id).toBe(p1.id)
  })
})
