import { z } from 'zod';

export const projectStatusEnum = z.enum(['open', 'completed']);

export const projectSchema = z.object({
  id: z.string(), 
  title: z.string().min(1).max(200),
  abstract: z.string().min(10).max(2000),
  tech_stack: z.array(z.string()).min(1).max(20),
  github_link: z.string().url(),
  demo_link: z.string().url().nullable().optional(),
  report_url: z.string().url().nullable().optional(),
  contributors: z.array(z.string()).default([]),
  tags: z.array(z.string()).max(10).default([]),
  status: projectStatusEnum.default('open'),
  created_by: z.string(),
  upvotes: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  upvoted_by: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable().optional(),
});

export const projectSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  abstract: z.string(),
  tech_stack: z.array(z.string()),
  created_by: z.string(),
  upvotes: z.number().int(),
  featured: z.boolean(),
  status: projectStatusEnum,
  created_at: z.string().datetime(),
  tags: z.array(z.string()).default([]),
  upvoted_by: z.array(z.string()).default([]),
});

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  abstract: z.string().min(10).max(2000),
  tech_stack: z.array(z.string()).min(1).max(20),
  github_link: z.string().url(),
  demo_link: z.string().url().or(z.literal("")).optional(),
  report_url: z.string().url().or(z.literal("")).optional(),
  contributors: z.array(z.string()).default([]),
  tags: z.array(z.string()).max(10).default([]),
  status: projectStatusEnum.default('open'),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  abstract: z.string().min(10).max(2000).optional(),
  tech_stack: z.array(z.string()).min(1).max(20).optional(),
  github_link: z.string().url().or(z.literal("")).optional(),
  demo_link: z.string().url().or(z.literal("")).optional(),
  report_url: z.string().url().or(z.literal("")).optional(),
  contributors: z.array(z.string()).optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: projectStatusEnum.optional(),
});

export const projectUpvoteSchema = z.object({
  project_id: z.string(),
  upvoted: z.boolean(),
  upvotes_count: z.number().int(),
});

export const paginatedProjectsSchema = z.object({
  projects: z.array(projectSummarySchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(), 
  limit: z.number().int(),
});

export const userProjectsSchema = z.object({
  projects: z.array(z.object({
    id: z.string(),
    title: z.string(),
    abstract: z.string(),
    tech_stack: z.array(z.string()),
    created_by: z.string(),
    upvotes: z.number().int(),
    featured: z.boolean(),
    status: projectStatusEnum,
    created_at: z.string(), 
    tags: z.array(z.string()).default([]),
    upvoted_by: z.array(z.string()).default([]),
  })),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectUpvote = z.infer<typeof projectUpvoteSchema>;
export type PaginatedProjects = z.infer<typeof paginatedProjectsSchema>;
export type UserProjects = z.infer<typeof userProjectsSchema>;
