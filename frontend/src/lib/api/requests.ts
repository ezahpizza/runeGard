import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRoutes } from '@/lib/api/apiUrl';
import { apiClient } from '@/lib/api/apiClient';
import { 
  teammateRequestSchema, 
  teammateRequestPublicSchema, 
  paginatedTeammateRequestsSchema 
} from '@/lib/schemas/request.schema';
import type { 
  CreateTeammateRequestInput, 
  UpdateTeammateRequestInput, 
  PaginatedTeammateRequests 
} from '@/lib/types/request';

// Fetch all requests with filters 
export const useTeammateRequests = (params?: {
  tags?: string[];
  search?: string;
  project_id?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ['requests', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.tags) params.tags.forEach(tag => searchParams.append('tags', tag));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.project_id) searchParams.set('project_id', params.project_id);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const data = await apiClient.get(`${apiRoutes.requests}${query}`, { skipAuth: true });
      return paginatedTeammateRequestsSchema.parse(data);
    },
  });

// Fetch current user's requests 
export const useMyRequests = (page: number = 1, limit: number = 10) =>
  useQuery({
    queryKey: ['requests', 'my', { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const data = await apiClient.get(`${apiRoutes.requests}/my?${params}`);
      return paginatedTeammateRequestsSchema.parse(data);
    },
  });

// Fetch recent requests 
export const useRecentRequests = (limit: number = 10) =>
  useQuery({
    queryKey: ['requests', 'recent', limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      const data = await apiClient.get(`${apiRoutes.requests}/recent?${params}`, { skipAuth: true });
      return z.array(teammateRequestPublicSchema).parse(data);
    },
  });

// Fetch requests by tags 
export const useRequestsByTags = (tags: string[], limit: number = 10) =>
  useQuery({
    queryKey: ['requests', 'by-tags', tags, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      tags.forEach(tag => params.append('tags', tag));
      const data = await apiClient.get(`${apiRoutes.requests}/by-tags?${params}`, { skipAuth: true });
      return z.array(teammateRequestPublicSchema).parse(data);
    },
    enabled: tags.length > 0,
  });

// Fetch requests for a specific project 
export const useProjectRequests = (projectId: string, page: number = 1, limit: number = 10) =>
  useQuery({
    queryKey: ['requests', 'project', projectId, { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const data = await apiClient.get(`${apiRoutes.requests}/project/${projectId}?${params}`, { skipAuth: true });
      return paginatedTeammateRequestsSchema.parse(data);
    },
    enabled: !!projectId,
  });

// Fetch request by ID 
export const useRequestById = (id: string) =>
  useQuery({
    queryKey: ['request', id],
    queryFn: async () => {
      const data = await apiClient.get(`${apiRoutes.requests}/${id}`, { skipAuth: true });
      return teammateRequestSchema.parse(data);
    },
    enabled: !!id,
  });

// Create request 
export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTeammateRequestInput) => {
      const data = await apiClient.post(`${apiRoutes.requests}`, input);
      return teammateRequestPublicSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

// Update request
export const useUpdateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTeammateRequestInput }) => {
      const data = await apiClient.put(`${apiRoutes.requests}/${id}`, input);
      return teammateRequestSchema.parse(data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request', id] });
    },
  });
};

// Delete request
export const useDeleteRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${apiRoutes.requests}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};
