# RuneGard Frontend Business Logic Layer

## Overview

This directory contains the complete business logic layer for the RuneGard frontend application, including Zod schemas, TanStack Query hooks, and utilities for interacting with the FastAPI backend.

## User Initialization Flow

### The Problem
The backend requires users to be initialized in the database before they can perform most actions. However, Clerk authentication happens independently, so a user can be authenticated with Clerk but not exist in the RuneGard database.

### The Solution
1. **Check User Status**: Use `useCurrentUser()` hook to check if the current user exists in the database
2. **Handle Uninitialized State**: If the hook returns `null`, the user needs to be initialized
3. **Initialize User**: Use `useInitUser()` mutation to create the user profile
4. **Redirect Flow**: After initialization, the user can access all app features

### Implementation Example

```tsx
import { useCurrentUser, useInitUser } from '@/lib/api';

function App() {
  const { data: currentUser, isLoading, error } = useCurrentUser();
  const initUser = useInitUser();

  if (isLoading) return <div>Loading...</div>;
  
  // User not initialized - redirect to onboarding
  if (!currentUser && !error) {
    return <UserInitForm onSubmit={(data) => initUser.mutate(data)} />;
  }
  
  // User initialized - show main app
  if (currentUser) {
    return <MainApp user={currentUser} />;
  }
  
  // Handle other errors
  return <div>Error: {error?.message}</div>;
}
```

## API Setup

### 1. Configure Clerk Token Provider

In your main App component, set up the Clerk auth provider:

```tsx
import { useAuth } from '@clerk/clerk-react';
import { setClerkAuth } from '@/lib/utils/getClerkToken';
import { useEffect } from 'react';

function AppWithAuth() {
  const { getToken } = useAuth();
  
  useEffect(() => {
    setClerkAuth(() => getToken());
  }, [getToken]);
  
  return <App />;
}
```

### 2. Set Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Available Hooks

### User Management
- `useCurrentUser()` - Get current authenticated user profile
- `useInitUser()` - Initialize user profile on first login
- `useUpdateUser()` - Update user profile
- `useDeleteCurrentUser()` - Delete current user account
- `useUserById(id)` - Get public user profile by ID  
- `useUserProjects(userId, page, limit)` - Get user's projects
- `useUserStats(userId)` - Get user statistics
- `useSearchUsers(params)` - Search users with filters

### Project Management  
- `useProjects(params)` - Get projects with filters and pagination
- `useTrendingProjects(limit)` - Get trending projects
- `useProjectById(id)` - Get project by ID
- `useCreateProject()` - Create new project
- `useUpdateProject()` - Update project
- `useDeleteProject()` - Delete project
- `useUpvoteProject()` - Upvote/remove upvote from project
- `useAddContributor()` - Add contributor to project

### Teammate Requests
- `useTeammateRequests(params)` - Get requests with filters
- `useMyRequests(page, limit)` - Get current user's requests
- `useRecentRequests(limit)` - Get recent requests
- `useRequestsByTags(tags, limit)` - Get requests by tags
- `useProjectRequests(projectId, page, limit)` - Get requests for a project
- `useRequestById(id)` - Get request by ID
- `useCreateRequest()` - Create teammate request
- `useUpdateRequest()` - Update request
- `useDeleteRequest()` - Delete request

### Testimonials
- `useAllTestimonials(page, limit)` - Get all testimonials with pagination
- `useMyTestimonials(page, limit)` - Get current user's testimonials 
- `useTestimonialById(id)` - Get testimonial by ID
- `useCreateTestimonial()` - Create testimonial
- `useUpdateTestimonial()` - Update testimonial
- `useDeleteTestimonial()` - Delete testimonial

## Error Handling

All hooks include proper error handling:
- Network errors are thrown and can be caught by error boundaries
- Backend validation errors are parsed and thrown with descriptive messages
- Authentication errors are handled automatically

## Data Validation

All API responses are validated using Zod schemas before being returned to components, ensuring type safety and runtime validation.

## Query Key Structure

Query keys follow a consistent pattern:
- `['users']` - All users
- `['user', 'me']` - Current user
- `['user', userId]` - Specific user
- `['projects']` - All projects  
- `['project', projectId]` - Specific project
- `['requests']` - All requests
- `['testimonials', 'user', userId]` - User testimonials

This ensures proper cache invalidation and data consistency.
