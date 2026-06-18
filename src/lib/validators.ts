import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  short_description: z.string().min(10, 'Short description too short').max(300, 'Short description too long'),
  description: z.string().min(10, 'Description too short'),
  github_url: z.string().url('Invalid GitHub URL').startsWith('https://github.com/', 'Must be a GitHub URL'),
  website_url: z.union([z.string().url('Invalid website URL'), z.string().length(0)]).optional(),
})

export const projectWithImageSchema = projectSchema.extend({
  image_path: z.string().min(1, 'Image is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ProjectInputData = z.infer<typeof projectSchema>
export type ProjectWithImageData = z.infer<typeof projectWithImageSchema>
