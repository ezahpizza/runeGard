import { useParams, Navigate } from 'react-router-dom';
import { useUserById, useUserProjects } from '@/lib/api/users';
import { useUserTestimonials } from '@/lib/api/testimonials';
import { PublicProfile, UserProjectsGrid, TestimonialSection } from '@/components/profile';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const { data: user, isLoading: userLoading, isError: userError } = useUserById(user_id || '');
  const { data: userProjectsData } = useUserProjects(user_id || '');
  const { data: userTestimonialsData } = useUserTestimonials(user_id || '');

  if (!user_id) {
    return <Navigate to="/explore" replace />;
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">User not found</div>
      </div>
    );
  }

  const userProjects = userProjectsData?.projects || [];
  const userTestimonials = userTestimonialsData?.testimonials || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PublicProfile user={user} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <UserProjectsGrid projects={userProjects} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <TestimonialSection testimonials={userTestimonials} userId={user.user_id} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;