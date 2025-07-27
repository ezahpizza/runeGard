import { useUser } from '@clerk/clerk-react';
import { useCurrentUser } from '@/lib/api/users';
import { debug } from '@/lib/utils/debug';


export interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  clerkUser: any;
  backendUser: any;
  needsInitialization: boolean;
}

/**
 * Hook to get the complete authentication state
 * Includes both Clerk authentication and backend user initialization
 */
export const useAuthState = (): AuthState => {
  const { user: clerkUser, isSignedIn, isLoaded: clerkLoaded } = useUser();
  const { data: backendUser, isLoading: backendLoading, error: backendError } = useCurrentUser({
    enabled: clerkLoaded && isSignedIn && !!clerkUser // Only fetch when user is authenticated
  });

  const isAuthenticated = clerkLoaded && isSignedIn && !!clerkUser;
  const isLoading = !clerkLoaded || (isAuthenticated && backendLoading);
  
  // User is initialized if they are authenticated and we have backend user data
  // backendUser will be null for 404 (not initialized) and contain data if initialized
  // We only consider it an error if there's a backendError AND backendUser is undefined (not null)
  const isInitialized = isAuthenticated && !!backendUser;
  const needsInitialization = isAuthenticated && !backendLoading && backendUser === null && !backendError;

  // Debug logging
  debug.log('Auth State Debug:', {
    clerkLoaded,
    isSignedIn,
    hasClerkUser: !!clerkUser,
    clerkUserId: clerkUser?.id,
    backendUser: backendUser ? 'USER_DATA' : backendUser,
    backendUserId: backendUser?.user_id,
    backendLoading,
    backendError: backendError ? backendError.message : null,
    isAuthenticated,
    isInitialized,
    needsInitialization,
    isLoading
  });

  return {
    isAuthenticated,
    isInitialized,
    isLoading,
    clerkUser,
    backendUser,
    needsInitialization,
  };
};

export default useAuthState;
