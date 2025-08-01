import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Plus, Calendar, Trash2, Quote, Building2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils/dateUtils';
import { useDeleteTestimonial } from '@/lib/api/testimonials';
import { useToast } from '@/hooks/use-toast';
import type { TestimonialWithProject } from '@/lib/types/testimonial';

interface MyTestimonialsListProps {
  testimonials: TestimonialWithProject[];
  isLoading: boolean;
}

export const MyTestimonialsList = ({ testimonials, isLoading }: MyTestimonialsListProps) => {
  const deleteTestimonialMutation = useDeleteTestimonial();
  const { toast } = useToast();

  const handleDelete = async (testimonial: TestimonialWithProject) => {
    try {
      await deleteTestimonialMutation.mutateAsync(testimonial.id);
      toast({
        title: "Testimonial Deleted",
        description: "Your testimonial has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground bg-lavenda">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-2xl text-midBlack flex items-center gap-2">
              <Quote size={20} />
              My Testimonials
            </CardTitle>
            <Button asChild size="sm" className="bg-nightBlue text-boneWhite">
              <Link to="/testimonials/new">
                <Plus size={16} />
                Write Testimonial
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading your testimonials...</div>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-8 text-midBlack">
              <p className="text-lg mb-4">You haven't written any testimonials yet.</p>
              <Button asChild className='text-midBlack'>
                <Link to="/testimonials/new">Write your first testimonial</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-rumba rounded-lg p-4 border-2 border-midBlack"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Quote size={16} className="text-midBlack" />
                          <span className="text-sm text-midBlack/80">
                            My Testimonial
                          </span>
                        </div>
                        
                        {/* Project information */}
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 size={14} className="text-midBlack/60" />
                          <span className="text-sm text-midBlack/70 font-medium">
                            {testimonial.project_title || 'Unknown Project'}
                          </span>
                        </div>
                        
                        <p className="text-midBlack line-clamp-2 leading-relaxed">
                          {testimonial.content}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-midBlack/70">
                        <Calendar size={14} />
                        <span>{formatDate(testimonial.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="hover:bg-apricot">
                          <Link to={`/testimonials/${testimonial.id}`}>
                            <Eye size={14} />
                            View
                          </Link>
                        </Button>
                        
                        <Button asChild size="sm" className='bg-mint text-midBlack'>
                          <Link to={`/testimonials/edit/${testimonial.id}`}>
                            <Edit size={14} />
                            Edit
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex items-center gap-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              disabled={deleteTestimonialMutation.isPending}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this testimonial? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(testimonial)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
