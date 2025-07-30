import { z } from 'zod';

export const teammateRequestSchema = z.object({
  id: z.string(), 
  user_id: z.string(),
  looking_for: z.string().min(1).max(200),
  description: z.string().min(10).max(1000),
  project_id: z.string().nullable().optional(),
  tags: z.array(z.string()).max(10).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable().optional(),
});

export const teammateRequestPublicSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  looking_for: z.string(),
  description: z.string(),
  project_id: z.string().nullable().optional(),
  tags: z.array(z.string()),
  created_at: z.string().datetime(),
});

export const createTeammateRequestSchema = z.object({
  looking_for: z.string().min(1).max(200),
  description: z.string().min(10).max(1000),
  project_id: z.string().optional(),
  tags: z.array(z.string()).max(10).default([]),
});

export const updateTeammateRequestSchema = z.object({
  looking_for: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const paginatedTeammateRequestsSchema = z.object({
  requests: z.array(teammateRequestPublicSchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
});

export type TeammateRequest = z.infer<typeof teammateRequestSchema>;
export type TeammateRequestPublic = z.infer<typeof teammateRequestPublicSchema>;
export type CreateTeammateRequestInput = z.infer<typeof createTeammateRequestSchema>;
export type UpdateTeammateRequestInput = z.infer<typeof updateTeammateRequestSchema>;
export type PaginatedTeammateRequests = z.infer<typeof paginatedTeammateRequestsSchema>;
