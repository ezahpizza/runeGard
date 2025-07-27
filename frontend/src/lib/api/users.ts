import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debug } from '@/lib/utils/debug';
import { apiRoutes } from '@/lib/api/apiUrl';
import { apiClient } from '@/lib/api/apiClient';
import { 
  userSchema, 
  userPublicSchema, 
  userStatsSchema, 
  paginatedUsersSchema 
} from '@/lib/schemas/user.schema';
import { userProjectsSchema } from '@/lib/schemas/project.schema';
import type { 
  UserInitInput, 
  UserUpdateInput, 
} from '@/lib/types/user';

// Initialize user profile on first login
export const useInitUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UserInitInput) => {
      const data = await apiClient.post(`${apiRoutes.users}/init`, input);
      return userSchema.parse(data);
    },
    onSuccess: (data) => {
      // Update the cache with the new user data
      queryClient.setQueryData(['user', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Get current user's profile
export const useCurrentUser = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        const data = await apiClient.get(`${apiRoutes.users}/me`);
        return userSchema.parse(data);
      } catch (error: any) {
        // Handle 404 - user not initialized
        if (error?.status === 404) {
          debug.log('useCurrentUser: User not initialized (404)');
          return null;
        }
        throw error;
      }
    },
    retry: false, // Don't retry on 404 - means user not initialized
    enabled: options?.enabled ?? true, // Allow disabling the query
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

// Update current user's profile
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UserUpdateInput) => {
      const data = await apiClient.put(`${apiRoutes.users}/update`, input);
      return userSchema.parse(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Delete current user
export const useDeleteCurrentUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`${apiRoutes.users}/me`);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Get public user profile by ID
export const useUserById = (userId: string) =>
  useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const data = await apiClient.get(`${apiRoutes.users}/${userId}`, { skipAuth: true });
      return userPublicSchema.parse(data);
    },
    enabled: !!userId,
  });

// Get user's projects - matches backend get_user_projects response structure
export const useUserProjects = (userId: string, page: number = 1, limit: number = 10) =>
  useQuery({
    queryKey: ['user', userId, 'projects', { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const data = await apiClient.get(`${apiRoutes.users}/${userId}/projects?${params}`, { skipAuth: true });
      return userProjectsSchema.parse(data);
    },
    enabled: !!userId,
  });

// Get user statistics - matches backend get_user_stats response structure  
export const useUserStats = (userId: string) =>
  useQuery({
    queryKey: ['user', userId, 'stats'],
    queryFn: async () => {
      const data = await apiClient.get(`${apiRoutes.users}/${userId}/stats`, { skipAuth: true });
      return userStatsSchema.parse(data);
    },
    enabled: !!userId,
  });

// Search users with filters - matches backend search users response structure
export const useUsers = (params?: {
  search?: string;
  skills?: string[];
  institute?: string;
  grad_year?: number;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ['users', 'search', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.skills) params.skills.forEach(skill => searchParams.append('skills', skill));
      if (params?.institute) searchParams.set('institute', params.institute);
      if (params?.grad_year) searchParams.set('grad_year', params.grad_year.toString());
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const data = await apiClient.get(`${apiRoutes.users}${query}`, { skipAuth: true });
      return paginatedUsersSchema.parse(data);
    },
  });

// Create user - for components that need explicit user creation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UserInitInput) => {
      const data = await apiClient.post(`${apiRoutes.users}/init`, input);
      return userSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
