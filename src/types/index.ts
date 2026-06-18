export interface User {
  id: number
  email: string
  created_at: string
}

export interface UserWithPassword extends User {
  password_hash: string
}

export interface Project {
  id: number
  title: string
  slug: string
  short_description: string
  description: string
  image_path: string
  github_url: string
  website_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>
