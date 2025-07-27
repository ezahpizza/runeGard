import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRoutes } from '@/lib/api/apiUrl';
import { apiClient } from '@/lib/api/apiClient';
import { 
  testimonialPublicSchema, 
  paginatedTestimonialsSchema, 
  checkTestimonialExistsSchema 
} from '@/lib/schemas/testimonial.schema';
import type { 
  CreateTestimonialInput, 
  UpdateTestimonialInput
} from '@/lib/types/testimonial';

// Fetch testimonials for a specific user - matches backend get_user_testimonials response structure
export const useUserTestimonials = (userId: string, page: number = 1, limit: number = 10) =>
  useQuery({
    queryKey: ['testimonials', 'user', userId, { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const data = await apiClient.get(`${apiRoutes.testimonials}/users/${userId}?${params}`, { skipAuth: true });
      // Backend returns paginated response with testimonials array
      return paginatedTestimonialsSchema.parse(data);
    },
    enabled: !!userId,
  });

// Check if current user has already left a testimonial for target user - matches backend check_testimonial_exists response
export const useCheckTestimonialExists = (toUserId: string) =>
  useQuery({
    queryKey: ['testimonial', 'exists', toUserId],
    queryFn: async () => {
      const params = new URLSearchParams({ to_user: toUserId });
      const data = await apiClient.get(`${apiRoutes.testimonials}/check-exists?${params}`);
      return checkTestimonialExistsSchema.parse(data);
    },
    enabled: !!toUserId,
  });

// Fetch testimonial by ID - matches backend get_testimonial response
export const useTestimonialById = (id: string) =>
  useQuery({
    queryKey: ['testimonial', id],
    queryFn: async () => {
      const data = await apiClient.get(`${apiRoutes.testimonials}/${id}`, { skipAuth: true });
      return testimonialPublicSchema.parse(data);
    },
    enabled: !!id,
  });

// Create testimonial - matches backend create_testimonial response
export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTestimonialInput) => {
      const data = await apiClient.post(`${apiRoutes.testimonials}`, input);
      return testimonialPublicSchema.parse(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'user', data.to_user] });
      queryClient.invalidateQueries({ queryKey: ['testimonial', 'exists', data.to_user] });
    },
  });
};

// Update testimonial - matches backend update_testimonial response
export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTestimonialInput }) => {
      const data = await apiClient.put(`${apiRoutes.testimonials}/${id}`, input);
      return testimonialPublicSchema.parse(data);
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'user', data.to_user] });
      queryClient.invalidateQueries({ queryKey: ['testimonial', id] });
    },
  });
};

// Delete testimonial - matches backend delete_testimonial endpoint
export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${apiRoutes.testimonials}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
};
