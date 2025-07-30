import { z } from 'zod';

export const userSchema = z.object({
  user_id: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  bio: z.string().max(500).nullable().optional(),
  skills: z.array(z.string()).max(20).default([]),
  institute: z.string().min(1).max(200),
  grad_year: z.number().int().gte(2020).lte(2030),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable().optional(),
});

export const userPublicSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  institute: z.string(),
  grad_year: z.number().int(),
  created_at: z.string().datetime(),
});

export const userInitSchema = z.object({
  name: z.string().min(1).max(100),
  institute: z.string().min(1).max(200),
  grad_year: z.number().int().gte(2020).lte(2030),
  skills: z.array(z.string()).max(20).default([]),
  bio: z.string().max(500).optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).max(20).optional(),
  institute: z.string().min(1).max(200).optional(),
  grad_year: z.number().int().gte(2020).lte(2030).optional(),
});

export const userStatsSchema = z.object({
  total_projects: z.number().int(),
  total_requests: z.number().int(),
  total_testimonials_received: z.number().int(),
  total_upvotes_received: z.number().int(),
});

export const paginatedUsersSchema = z.object({
  users: z.array(userPublicSchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
});

export type User = z.infer<typeof userSchema>;
export type UserPublic = z.infer<typeof userPublicSchema>;
export type UserInitInput = z.infer<typeof userInitSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
export type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;
