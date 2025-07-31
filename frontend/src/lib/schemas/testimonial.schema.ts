import { z } from 'zod';

export const testimonialPublicSchema = z.object({
  id: z.string(),
  from_user: z.string(),
  project_id: z.string(),
  content: z.string(),
  created_at: z.string().datetime(),
});

export const createTestimonialSchema = z.object({
  content: z.string().min(10).max(500),
  project_id: z.string(),
});

export const createTestimonialContentSchema = z.object({
  content: z.string().min(10).max(500),
});

export const testimonialWithUserSchema = z.object({
  id: z.string(),
  from_user: z.string(),
  from_user_name: z.string(),
  project_id: z.string(),
  content: z.string(),
  created_at: z.string().datetime(),
});

export const testimonialWithProjectSchema = z.object({
  id: z.string(),
  from_user: z.string(),
  from_user_name: z.string(),
  project_id: z.string(),
  project_title: z.string(),
  content: z.string(),
  created_at: z.string().datetime(),
});

export const paginatedTestimonialsSchema = z.object({
  testimonials: z.array(testimonialWithUserSchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
});

export const paginatedTestimonialsPublicSchema = z.object({
  testimonials: z.array(testimonialPublicSchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
});

export const paginatedTestimonialsWithProjectSchema = z.object({
  testimonials: z.array(testimonialWithProjectSchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
});

export type TestimonialPublic = z.infer<typeof testimonialPublicSchema>;
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type CreateTestimonialContentInput = z.infer<typeof createTestimonialContentSchema>;
export type UpdateTestimonialInput = {
  content?: string;
};
export type TestimonialWithUser = z.infer<typeof testimonialWithUserSchema>;
export type TestimonialWithProject = z.infer<typeof testimonialWithProjectSchema>;
