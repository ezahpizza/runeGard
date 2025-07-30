import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useRequestById, useUpdateRequest } from '@/lib/api/requests';
import { TeammateRequestForm } from '@/components/forms/TeammateRequestForm';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';
import type { UpdateTeammateRequestInput } from '@/lib/types/request';

const EditRequest = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: request, isLoading, isError } = useRequestById(id || '');
  const updateRequestMutation = useUpdateRequest();

  if (!id) {
    return <Navigate to="/explore" replace />;
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Loading request details..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isError || !request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">Request not found</div>
      </div>
    );
  }

  if (request.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">You don't have permission to edit this request</div>
      </div>
    );
  }

  const handleSubmit = async (data: UpdateTeammateRequestInput) => {
    try {
      await updateRequestMutation.mutateAsync({ id: request.id, input: data });
      
      toast({
        title: "Request Updated",
        description: "Your teammate request has been successfully updated!",
      });
      
      navigate(`/requests/${request.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
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
          <h1 className="text-4xl font-heading font-bold mb-4">Edit Request</h1>
          <p className="text-muted-foreground">Update your teammate request details</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TeammateRequestForm
            defaultValues={{
              looking_for: request.looking_for,
              description: request.description,
              tags: request.tags,
            }}
            onSubmit={handleSubmit}
            isLoading={updateRequestMutation.isPending}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EditRequest;
