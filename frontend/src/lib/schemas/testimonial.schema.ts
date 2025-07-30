import { z } from 'zod';

export const testimonialPublicSchema = z.object({
  id: z.string(),
  from_user: z.string(),
  to_user: z.string(),
  content: z.string(),
  created_at: z.string().datetime(),
});

export const createTestimonialSchema = z.object({
  to_user: z.string(),
  content: z.string().min(10).max(500),
});

export const testimonialWithUserSchema = z.object({
  id: z.string(),
  from_user: z.string(),
  from_user_name: z.string(),
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

export const checkTestimonialExistsSchema = z.object({
  exists: z.boolean(),
});

export type TestimonialPublic = z.infer<typeof testimonialPublicSchema>;
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = {
  content?: string;
};
export type TestimonialWithUser = z.infer<typeof testimonialWithUserSchema>;
