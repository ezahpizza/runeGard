import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthState from '@/lib/hooks/useAuthState';
import UserInitForm from '@/components/auth/UserInitForm';
import Loading from '@/components/ui/Loading';

const RequireUserInit = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialized, needsInitialization, isLoading } = useAuthState();
  const [justInitialized, setJustInitialized] = useState(false);

  // Handle successful initialization
  const handleInitSuccess = () => {
    setJustInitialized(true);
  };

  if (isLoading) {
    return <Loading message="Checking authentication status..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user needs initialization and hasn't just been initialized, show init form
  if (needsInitialization && !justInitialized) {
    return <UserInitForm onInit={handleInitSuccess} isLoading={false} />;
  }

  // If user is initialized (either from the start or just completed initialization)
  if (isInitialized || justInitialized) {
    return <>{children}</>;
  }

  // Fallback - should not reach here in normal flow
  return <Loading message="Verifying user status..." />;
};

export default RequireUserInit;
