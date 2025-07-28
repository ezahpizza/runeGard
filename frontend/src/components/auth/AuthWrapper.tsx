import { ReactNode, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { setClerkAuth } from '@/lib/auth/tokenManager';
import { useAuthStateMonitor } from '@/lib/hooks/useAuthStateMonitor';
import { debug } from '@/lib/utils/debug';
import Loading from '@/components/ui/Loading';

interface AuthWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}


export const AuthWrapper = ({ children, fallback }: AuthWrapperProps) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  
  // Monitor auth state changes and handle cleanup
  useAuthStateMonitor();
  
  // Use refs to store current values that can be accessed by the auth function
  const userRef = useRef(user);
  const getTokenRef = useRef(getToken);
  
  // Update refs when values change
  userRef.current = user;
  getTokenRef.current = getToken;

  // Set up auth function immediately when component mounts
  useEffect(() => {
    debug.log('AuthWrapper: Setting up auth function', { isLoaded, isSignedIn, hasUser: !!user });
    
    // Set up the auth function with access to current values via refs
    setClerkAuth(async () => {
      debug.log('getClerkToken called, checking current auth state...');
      
      // Check if user is currently signed in using the ref
      if (!userRef.current) {
        debug.log('getClerkToken: No user object, returning null');
        return null;
      }
      
      debug.log('getClerkToken: User exists, getting token with template runeGard');
      try {
        const token = await getTokenRef.current({ template: 'runeGard' });
        debug.log('getClerkToken: Token retrieved successfully');
        return token;
      } catch (error) {
        debug.error('getClerkToken: Error getting token:', error);
        return null;
      }
    });
    debug.log('AuthWrapper: Auth function set up successfully');
  }, []);

  if (!isLoaded) {
    return <Loading message="Initializing authentication..." />;
  }
  return <>{children}</>;
};

export default AuthWrapper;
