import { useParams, Navigate } from 'react-router-dom';
import { useTestimonialById } from '@/lib/api/testimonials';
import { TestimonialInfo } from '@/components/testimonials';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';

const TestimonialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: testimonial, isLoading, isError } = useTestimonialById(id || '');

  if (!id) {
    return <Navigate to="/explore" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Loading testimonial..." />
      </div>
    );
  }

  if (isError || !testimonial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">Testimonial not found</div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-heading font-bold mb-4">Testimonial Details</h1>
          <p className="text-muted-foreground">Read about collaboration experiences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TestimonialInfo testimonial={testimonial} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TestimonialDetail;
