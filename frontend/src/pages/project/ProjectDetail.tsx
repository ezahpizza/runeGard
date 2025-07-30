import { useParams, Navigate } from 'react-router-dom';
import { useProjectById } from '@/lib/api/projects';
import { useUsers } from '@/lib/api/users';
import { ProjectInfo, ContributorList } from '@/components/project';
import { motion } from 'framer-motion';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useProjectById(id || '');
  const { data: users } = useUsers({ limit: 50 }); // Get all users for contributor lookup

  if (!id) {
    return <Navigate to="/explore" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">Project not found</div>
      </div>
    );
  }

  const contributors = users?.users?.filter(user => 
    project.contributors.includes(user.user_id) || user.user_id === project.created_by
  ) || [];

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
          <ProjectInfo project={project} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <ContributorList contributors={contributors} createdBy={project.created_by} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;