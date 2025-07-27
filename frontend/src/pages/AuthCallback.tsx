import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useCreateUser } from '@/lib/api/users';
import { motion } from 'framer-motion';

const AuthCallback = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Create user profile if it doesn't exist
      const createUserProfile = async () => {
        try {
          await createUserMutation.mutateAsync({
            name: user.fullName || user.firstName || '',
            institute: '',
            grad_year: new Date().getFullYear(),
            skills: [],
            bio: '',
          });
        } catch (error) {
          // User might already exist, that's fine
          console.log('User profile creation:', error);
        } finally {
          navigate('/dashboard');
        }
      };

      createUserProfile();
    }
  }, [isLoaded, user, navigate, createUserMutation]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-heading font-bold mb-2">Setting up your account...</h2>
        <p className="text-muted-foreground">Please wait while we prepare your dashboard</p>
      </motion.div>
    </motion.div>
  );
};

export default AuthCallback;