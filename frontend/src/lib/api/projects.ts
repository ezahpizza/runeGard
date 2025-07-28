import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRoutes } from '@/lib/api/apiUrl';
import { apiClient } from '@/lib/api/apiClient';
import {
  projectSchema,
  projectSummarySchema,
  projectUpvoteSchema,
  paginatedProjectsSchema
} from '@/lib/schemas/project.schema';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  PaginatedProjects
} from '@/lib/types/project';

// Fetch all projects with filters 
export const useProjects = (params?: {
  tech_stack?: string[];
  tags?: string[];
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured_only?: boolean;
}) =>
  useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.tech_stack) params.tech_stack.forEach(tech => searchParams.append('tech_stack', tech));
      if (params?.tags) params.tags.forEach(tag => searchParams.append('tags', tag));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.featured_only) searchParams.set('featured_only', params.featured_only.toString());
      
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const data = await apiClient.get(`${apiRoutes.projects}${query}`, { skipAuth: true });
      return paginatedProjectsSchema.parse(data);
    },
  });

// Fetch trending projects 
export const useTrendingProjects = (limit: number = 10) =>
  useQuery({
    queryKey: ['projects', 'trending', limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      const data = await apiClient.get(`${apiRoutes.projects}/trending?${params}`, { skipAuth: true });
      return z.array(projectSummarySchema).parse(data);
    },
  });

// Fetch project by ID 
export const useProjectById = (id: string) =>
  useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const data = await apiClient.get(`${apiRoutes.projects}/${id}`, { skipAuth: true });
      return projectSchema.parse(data);
    },
    enabled: !!id,
  });

// Create project
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const data = await apiClient.post(`${apiRoutes.projects}`, input);
      return projectSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Update project 
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateProjectInput }) => {
      const data = await apiClient.put(`${apiRoutes.projects}/${id}`, input);
      return projectSchema.parse(data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });
};

// Delete project 
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${apiRoutes.projects}/${id}`);
      return id;
    },
    onSuccess: (deletedProjectId) => {
      // Invalidate general project queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Invalidate specific project query
      queryClient.invalidateQueries({ queryKey: ['project', deletedProjectId] });
      
      // Invalidate trending projects 
      queryClient.invalidateQueries({ queryKey: ['projects', 'trending'] });
      
      // Invalidate all user-specific project queries since we don't know which user deleted it
      queryClient.invalidateQueries({ queryKey: ['user'], predicate: (query) => {
        return query.queryKey.includes('projects');
      }});
      
      //  remove the deleted project from cache immediately 
      queryClient.removeQueries({ queryKey: ['project', deletedProjectId] });
    },
  });
};

// Upvote/remove upvote from project 
export const useUpvoteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const data = await apiClient.post(`${apiRoutes.projects}/${projectId}/upvote`);
      return projectUpvoteSchema.parse(data);
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};

// Add contributor to project 
export const useAddContributor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, contributorId }: { projectId: string; contributorId: string }) => {
      const data = await apiClient.post(`${apiRoutes.projects}/${projectId}/contributors/${contributorId}`);
      return projectSchema.parse(data);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};
