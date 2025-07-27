// Centralized API URL provider for RuneGard
// Usage: import { API_URL, apiRoutes } from './apiUrl';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiRoutes = {
  users: '/users',
  projects: '/projects',
  requests: '/requests',
  testimonials: '/testimonials',
};
