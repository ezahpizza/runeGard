import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTestimonialById, useUpdateTestimonial } from '@/lib/api/testimonials';
import { TestimonialForm } from '@/components/forms/TestimonialForm';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';
import type { CreateTestimonialInput } from '@/lib/types/testimonial';

const EditTestimonial = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: testimonial, isLoading, isError } = useTestimonialById(id || '');
  const updateTestimonialMutation = useUpdateTestimonial();

  if (!id) {
    return <Navigate to="/explore" replace />;
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Loading testimonial details..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isError || !testimonial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">Testimonial not found</div>
      </div>
    );
  }

  if (testimonial.from_user !== user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">You don't have permission to edit this testimonial</div>
      </div>
    );
  }

  const handleSubmit = async (data: CreateTestimonialInput) => {
    try {
      // Only send the content for update
      await updateTestimonialMutation.mutateAsync({ 
        id: testimonial.id, 
        input: { content: data.content }
      });
      
      toast({
        title: "Testimonial Updated",
        description: "Your testimonial has been successfully updated!",
      });
      
      navigate(`/testimonials/${testimonial.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update testimonial. Please try again.",
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
          <h1 className="text-4xl font-heading font-bold mb-4">Edit Testimonial</h1>
          <p className="text-muted-foreground">Update your testimonial details</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TestimonialForm
            defaultValues={{
              content: testimonial.content,
              project_id: testimonial.project_id,
            }}
            onSubmit={handleSubmit}
            isLoading={updateTestimonialMutation.isPending}
            projectId={testimonial.project_id}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EditTestimonial;
