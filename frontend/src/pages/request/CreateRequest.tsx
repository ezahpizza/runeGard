import { useUser } from '@clerk/clerk-react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useCreateRequest } from '@/lib/api/requests';
import { TeammateRequestForm } from '@/components/forms/TeammateRequestForm';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';
import type { CreateTeammateRequestInput } from '@/lib/types/request';

const CreateRequest = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const createRequestMutation = useCreateRequest();

  // Get projectId from location state if navigated from project detail
  const projectId = location.state?.projectId;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Preparing request creation..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (data: CreateTeammateRequestInput) => {
    try {
      const request = await createRequestMutation.mutateAsync({
        ...data,
        project_id: projectId || data.project_id || undefined,
      });
      
      toast({
        title: "Request Created",
        description: "Your teammate request has been successfully created!",
      });
      
      navigate(`/requests/${request.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
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
          <h1 className="text-4xl font-heading font-bold mb-4">Create Teammate Request</h1>
          <p className="text-muted-foreground">Find collaborators for your project</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TeammateRequestForm
            onSubmit={handleSubmit}
            isLoading={createRequestMutation.isPending}
            projectId={projectId}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateRequest;
