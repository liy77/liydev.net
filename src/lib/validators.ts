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
  image_path: z.string().min(1, 'Image is required').regex(/^\/uploads\//, 'Image path must start with /uploads/'),
})

export const settingsUpdateSchema = z.object({
  background_start: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_end: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_mid: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_secondary: z.string().optional(),
  text_muted: z.string().optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  glass_bg: z.string().optional(),
  glass_border: z.string().optional(),
  glass_border_highlight: z.string().optional(),
  background_image: z.string().nullable().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ProjectInputData = z.infer<typeof projectSchema>
export type ProjectWithImageData = z.infer<typeof projectWithImageSchema>
export type SettingsUpdateData = z.infer<typeof settingsUpdateSchema>
