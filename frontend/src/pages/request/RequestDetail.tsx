import { useParams, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useRequestById } from '@/lib/api/requests';
import { RequestInfo } from '@/components/requests';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';


const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoaded } = useUser();
  const { toast } = useToast();
  const { data: request, isLoading, isError } = useRequestById(id || '');

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

  if (isError || !request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">Request not found</div>
      </div>
    );
  }

  const handleContact = () => {
    // TODO: Implement contact functionality (email, direct message, etc.)
    toast({
      title: "Contact Feature",
      description: "Contact functionality will be implemented soon!",
    });
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
          <h1 className="text-4xl font-heading font-bold mb-4">Teammate Request</h1>
          <p className="text-muted-foreground">Connect with potential collaborators</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RequestInfo
            request={request}
            onContact={handleContact}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RequestDetail;
