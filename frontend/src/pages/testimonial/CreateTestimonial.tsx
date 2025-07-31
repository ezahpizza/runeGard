import { useUser } from '@clerk/clerk-react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useCreateTestimonial } from '@/lib/api/testimonials';
import { useProjects } from '@/lib/api/projects';
import { TestimonialForm } from '@/components/forms/TestimonialForm';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';
import type { CreateTestimonialInput } from '@/lib/types/testimonial';

const CreateTestimonial = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const createTestimonialMutation = useCreateTestimonial();
  
  const { data: projectsData, isLoading: isLoadingProjects, isError: projectsError } = useProjects({
    limit: 100
  });

  // Get redirect URL and context from location state
  const redirectTo = location.state?.redirectTo || '/';
  const context = location.state?.context;
  const preselectedProjectId = location.state?.projectId;

  if (!isLoaded || isLoadingProjects) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message={
          !isLoaded 
            ? "Preparing testimonial creation..." 
            : "Loading available projects..."
        } />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (projectsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg text-destructive">Failed to load projects</div>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CreateTestimonialInput) => {
    try {
      const testimonial = await createTestimonialMutation.mutateAsync(data);
      
      toast({
        title: "Testimonial Created",
        description: "Your testimonial has been successfully submitted!",
      });
      
      // Redirect to the project or testimonial detail
      navigate(redirectTo === '/' ? `/testimonials/${testimonial.id}` : redirectTo);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message?.includes('already left a testimonial')
          ? "You have already left a testimonial for this project"
          : "Failed to create testimonial. Please try again.",
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
          <h1 className="text-4xl font-heading font-bold mb-4">Write Testimonial</h1>
          <p className="text-muted-foreground">
            {context || "Share your experience and accomplishments with the community"}
          </p>
          {projectsData?.projects && (
            <p className="text-sm text-muted-foreground mt-2">
              {projectsData.projects.length} projects available for testimonials
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TestimonialForm
            defaultValues={preselectedProjectId ? { project_id: preselectedProjectId } : undefined}
            onSubmit={handleSubmit}
            isLoading={createTestimonialMutation.isPending}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateTestimonial;
