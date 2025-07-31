import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useProjects } from '@/lib/api/projects';
import { useMyRequests } from '@/lib/api/requests';
import { useMyTestimonials } from '@/lib/api/testimonials';
import { useCurrentUser } from '@/lib/api/users';
import { DashboardHeader, MyStatsCard, MyProjectsList, MyRequestsList, MyTestimonialsList } from '@/components/dashboard';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { data: backendUser } = useCurrentUser();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: requests, isLoading: requestsLoading } = useMyRequests();
  const { data: testimonials, isLoading: testimonialsLoading } = useMyTestimonials();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userId = backendUser?.user_id || user.id;
  const userProjects = projects?.projects?.filter(project => project.created_by === userId) || [];
  
  const stats = {
    projectsCount: userProjects.length,
    requestsCount: requests?.requests?.length || 0,
    testimonialsCount: testimonials?.testimonials?.length || 0,
    collaborationsCount: 0, 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DashboardHeader user={user} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <MyStatsCard stats={stats} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <MyProjectsList 
            projects={userProjects} 
            isLoading={projectsLoading} 
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <MyRequestsList 
            requests={requests?.requests || []} 
            isLoading={requestsLoading} 
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <MyTestimonialsList 
            testimonials={testimonials?.testimonials || []} 
            isLoading={testimonialsLoading} 
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;