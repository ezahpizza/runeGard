import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { clearAuthToken } from '@/lib/auth/tokenManager';
import { useQueryClient } from '@tanstack/react-query';
import { debug } from '@/lib/utils/debug';


/**
 * Hook to handle authentication state changes
 * Clears tokens and cache when user logs out
 */
export const useAuthStateMonitor = () => {
  const { isSignedIn, isLoaded } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoaded) return;

    // If user is not signed in, clear everything
    if (!isSignedIn) {
      debug.log('AuthStateMonitor: User signed out, clearing tokens and cache');
      
      // Clear cached token
      clearAuthToken();
      
      // Clear all React Query cache to prevent showing stale authenticated data
      queryClient.clear();
      
      // Optionally, you could also invalidate specific queries instead:
      // queryClient.removeQueries({ queryKey: ['user'] });
      // queryClient.removeQueries({ queryKey: ['projects'] });
      // etc.
    }
  }, [isSignedIn, isLoaded, queryClient]);

  return { isSignedIn, isLoaded };
};

export default useAuthStateMonitor;
