import { z } from 'zod';

// Backend TestimonialPublic model - matches exactly with backend TestimonialPublic model
export const testimonialPublicSchema = z.object({
  id: z.string(),
  from_user: z.string(),
  to_user: z.string(),
  content: z.string(),
  created_at: z.string().datetime(),
});

// Backend TestimonialCreate model - matches exactly with backend TestimonialCreate model
export const createTestimonialSchema = z.object({
  to_user: z.string(),
  content: z.string().min(10).max(500),
});

// Backend TestimonialWithUser model - matches exactly with backend TestimonialWithUser model
export const testimonialWithUserSchema = z.object({
  id: z.string(),
  from_user: z.string(),
  from_user_name: z.string(),
  content: z.string(),
  created_at: z.string().datetime(),
});

// Paginated testimonials response - matches backend get_user_testimonials endpoint
export const paginatedTestimonialsSchema = z.object({
  testimonials: z.array(testimonialWithUserSchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
});

// Check testimonial exists response - matches backend check_testimonial_exists endpoint
export const checkTestimonialExistsSchema = z.object({
  exists: z.boolean(),
});

export type TestimonialPublic = z.infer<typeof testimonialPublicSchema>;
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = {
  content?: string;
};
export type TestimonialWithUser = z.infer<typeof testimonialWithUserSchema>;
