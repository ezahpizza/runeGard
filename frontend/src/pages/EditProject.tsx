import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useProjectById, useUpdateProject } from '@/lib/api/projects';
import { ProjectForm } from '@/components/project/ProjectForm';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';
import type { CreateProjectInput } from '@/lib/types/project';

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: project, isLoading, isError } = useProjectById(id || '');
  const updateProjectMutation = useUpdateProject();

  if (!id) {
    return <Navigate to="/explore" replace />;
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Loading project details..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">Project not found</div>
      </div>
    );
  }

  if (project.created_by !== user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">You don't have permission to edit this project</div>
      </div>
    );
  }

  const handleSubmit = async (data: CreateProjectInput) => {
    try {
      await updateProjectMutation.mutateAsync({ id: project.id, input: data });
      
      toast({
        title: "Project Updated",
        description: "Your project has been successfully updated!",
      });
      
      navigate(`/projects/${project.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
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
          <h1 className="text-4xl font-heading font-bold mb-4">Edit Project</h1>
          <p className="text-muted-foreground">Update your project details</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProjectForm
            defaultValues={{
              title: project.title,
              abstract: project.abstract,
              tags: project.tags,
              tech_stack: project.tech_stack,
              github_link: project.github_link,
              demo_link: project.demo_link || '',
              report_url: project.report_url || '',
              contributors: project.contributors,
            }}
            onSubmit={handleSubmit}
            isLoading={updateProjectMutation.isPending}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EditProject;