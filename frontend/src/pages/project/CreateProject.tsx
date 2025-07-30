import { useUser } from '@clerk/clerk-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/lib/api/projects';
import { ProjectForm } from '@/components/project';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';
import type { CreateProjectInput } from '@/lib/types/project';

const CreateProject = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createProjectMutation = useCreateProject();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Preparing project creation..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (data: CreateProjectInput) => {
    try {
      const project = await createProjectMutation.mutateAsync({
        ...data,
        contributors: [user.id],
      });
      
      toast({
        title: "Project Created",
        description: "Your project has been successfully created!",
      });
      
      navigate(`/projects/${project.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
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
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold mb-4">Create New Project</h1>
          <p className="text-muted-foreground">Share your project with the community and find collaborators</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProjectForm
            onSubmit={handleSubmit}
            isLoading={createProjectMutation.isPending}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateProject;