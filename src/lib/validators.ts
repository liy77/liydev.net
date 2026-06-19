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
  theme_mode: z.enum(['light', 'dark', 'system']).optional(),
  theme_scope: z.enum(['both', 'dark', 'light']).optional(),
  background_start: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_end: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_mid: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_start_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_end_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_mid_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_secondary: z.string().optional(),
  text_muted: z.string().optional(),
  text_primary_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_secondary_light: z.string().optional(),
  text_muted_light: z.string().optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent_color_light: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  glass_bg: z.string().optional(),
  glass_border: z.string().optional(),
  glass_border_highlight: z.string().optional(),
  glass_bg_light: z.string().optional(),
  glass_border_light: z.string().optional(),
  glass_border_highlight_light: z.string().optional(),
  text_gradient_start: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  text_gradient_mid: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  text_gradient_end: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  use_text_gradient: z.boolean().optional(),
  glass_intensity: z.number().int().min(0).max(100).optional(),
  background_image: z.string().nullable().optional(),
  background_music: z.string().nullable().optional(),
  music_volume: z.number().int().min(0).max(100).optional(),
  background_image_credit: z.string().max(200).nullable().optional(),
  background_music_credit: z.string().max(200).nullable().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ProjectInputData = z.infer<typeof projectSchema>
export type ProjectWithImageData = z.infer<typeof projectWithImageSchema>
export type SettingsUpdateData = z.infer<typeof settingsUpdateSchema>
