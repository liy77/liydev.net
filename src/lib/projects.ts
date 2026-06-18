import { getDatabase } from './db'
import type { Project, ProjectInput } from '@/types'

export function getAllProjects(): Project[] {
  return getDatabase()
    .prepare('SELECT * FROM projects ORDER BY display_order ASC, created_at DESC')
    .all() as Project[]
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getDatabase().prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as Project | undefined
}

export function getProjectById(id: number): Project | undefined {
  return getDatabase().prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined
}

export function createProject(project: ProjectInput): Project {
  const result = getDatabase()
    .prepare(
      `INSERT INTO projects (title, slug, short_description, description, image_path, github_url, website_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      project.title,
      project.slug,
      project.short_description,
      project.description,
      project.image_path,
      project.github_url,
      project.website_url || null,
      project.display_order
    )
  return getProjectById(Number(result.lastInsertRowid))!
}

export function updateProject(id: number, project: Partial<ProjectInput>): Project {
  const existing = getProjectById(id)
  if (!existing) throw new Error('Project not found')

  const updated: ProjectInput = {
    title: project.title ?? existing.title,
    slug: project.slug ?? existing.slug,
    short_description: project.short_description ?? existing.short_description,
    description: project.description ?? existing.description,
    image_path: project.image_path ?? existing.image_path,
    github_url: project.github_url ?? existing.github_url,
    website_url: project.website_url ?? existing.website_url,
    display_order: project.display_order ?? existing.display_order,
  }

  getDatabase()
    .prepare(
      `UPDATE projects
       SET title = ?, slug = ?, short_description = ?, description = ?, image_path = ?, github_url = ?, website_url = ?, display_order = ?
       WHERE id = ?`
    )
    .run(
      updated.title,
      updated.slug,
      updated.short_description,
      updated.description,
      updated.image_path,
      updated.github_url,
      updated.website_url || null,
      updated.display_order,
      id
    )

  return getProjectById(id)!
}

export function deleteProject(id: number): void {
  getDatabase().prepare('DELETE FROM projects WHERE id = ?').run(id)
}

export function updateProjectOrder(orders: { id: number; display_order: number }[]): void {
  const db = getDatabase()
  const update = db.prepare('UPDATE projects SET display_order = ? WHERE id = ?')
  const transaction = db.transaction((items: { id: number; display_order: number }[]) => {
    for (const item of items) {
      update.run(item.display_order, item.id)
    }
  })
  transaction(orders)
}
