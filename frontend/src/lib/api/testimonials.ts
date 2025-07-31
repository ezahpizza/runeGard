import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRoutes } from '@/lib/api/apiUrl';
import { apiClient } from '@/lib/api/apiClient';
import { 
  testimonialPublicSchema, 
  paginatedTestimonialsSchema, 
  paginatedTestimonialsPublicSchema,
  paginatedTestimonialsWithProjectSchema
} from '@/lib/schemas/testimonial.schema';
import type { 
  CreateTestimonialInput,
  CreateTestimonialContentInput, 
  UpdateTestimonialInput
} from '@/lib/types/testimonial';

// Fetch all testimonials
export const useAllTestimonials = (page: number = 1, limit: number = 10) =>
  useQuery({
    queryKey: ['testimonials', 'all', { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const data = await apiClient.get(`${apiRoutes.testimonials}?${params}`, { skipAuth: true });

      return paginatedTestimonialsSchema.parse(data);
    },
  });

// Fetch testimonials created by current user 
export const useMyTestimonials = (page: number = 1, limit: number = 10) =>
  useQuery({
    queryKey: ['testimonials', 'my', { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const data = await apiClient.get(`${apiRoutes.testimonials}/my?${params}`);
      return paginatedTestimonialsWithProjectSchema.parse(data);
    },
  });

// Fetch testimonial by ID 
export const useTestimonialById = (id: string) =>
  useQuery({
    queryKey: ['testimonial', id],
    queryFn: async () => {
      const data = await apiClient.get(`${apiRoutes.testimonials}/${id}`, { skipAuth: true });
      return testimonialPublicSchema.parse(data);
    },
    enabled: !!id,
  });

// Fetch testimonials for a project
export const useProjectTestimonials = (projectId: string, page: number = 1, limit: number = 10) =>
  useQuery({
    queryKey: ['testimonials', 'project', projectId, { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const data = await apiClient.get(`${apiRoutes.projects}/${projectId}/testimonials?${params}`, { skipAuth: true });
      return paginatedTestimonialsSchema.parse(data);
    },
    enabled: !!projectId,
  });

// Create testimonial 
export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTestimonialInput) => {
      const data = await apiClient.post(`${apiRoutes.testimonials}`, input);
      return testimonialPublicSchema.parse(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'project', data.project_id] });
    },
  });
};

// Create testimonial for a specific project
export const useCreateProjectTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, input }: { projectId: string; input: CreateTestimonialContentInput }) => {
      const data = await apiClient.post(`${apiRoutes.projects}/${projectId}/testimonials`, input);
      return testimonialPublicSchema.parse(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'project', data.project_id] });
    },
  });
};

// Update testimonial 
export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTestimonialInput }) => {
      const data = await apiClient.put(`${apiRoutes.testimonials}/${id}`, input);
      return testimonialPublicSchema.parse(data);
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial', id] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'project', data.project_id] });
    },
  });
};

// Delete testimonial 
export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const testimonialData = await apiClient.get(`${apiRoutes.testimonials}/${id}`, { skipAuth: true });
      const testimonial = testimonialPublicSchema.parse(testimonialData);
      await apiClient.delete(`${apiRoutes.testimonials}/${id}`);
      return { id, projectId: testimonial.project_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'project', data.projectId] });
    },
  });
};
