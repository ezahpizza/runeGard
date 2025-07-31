import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Quote, Plus, Edit, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjectTestimonials, useCreateProjectTestimonial, useUpdateTestimonial } from '@/lib/api/testimonials';
import { TestimonialCard } from '@/components/testimonials';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTestimonialContentSchema } from '@/lib/schemas/testimonial.schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TestimonialWithUser, UpdateTestimonialInput, CreateTestimonialContentInput } from '@/lib/types/testimonial';

// Edit form component for testimonials
interface EditTestimonialFormProps {
  defaultContent: string;
  onSubmit: (data: UpdateTestimonialInput) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const EditTestimonialForm = ({ defaultContent, onSubmit, isLoading, onCancel }: EditTestimonialFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateTestimonialInput>({
    resolver: zodResolver(createTestimonialContentSchema),
    defaultValues: {
      content: defaultContent,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="edit-content">Your Testimonial *</Label>
        <Textarea
          id="edit-content"
          {...register('content')}
          placeholder="Share your experience working on this project..."
          rows={6}
          className="resize-none"
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-nightBlue text-boneWhite hover:bg-nightBlue/90"
        >
          {isLoading ? 'Updating...' : 'Update Testimonial'}
        </Button>
      </div>
    </form>
  );
};

interface ProjectTestimonialsProps {
  projectId: string;
  projectTitle: string;
}

export const ProjectTestimonials = ({ projectId, projectTitle }: ProjectTestimonialsProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialWithUser | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch project-specific testimonials
  const { data: testimonialsData, isLoading } = useProjectTestimonials(projectId, 1, 20);
  const createTestimonialMutation = useCreateProjectTestimonial();
  const updateTestimonialMutation = useUpdateTestimonial();

  const testimonials = testimonialsData?.testimonials || [];

  // Form for creating new testimonial
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTestimonialContentInput>({
    resolver: zodResolver(createTestimonialContentSchema),
    defaultValues: {
      content: '',
    },
  });

  const handleCreateTestimonial = async (data: CreateTestimonialContentInput) => {
    try {
      await createTestimonialMutation.mutateAsync({
        projectId,
        input: data
      });
      
      toast({
        title: "Testimonial Created",
        description: "Your testimonial has been added to this project.",
      });
      
      setShowCreateDialog(false);
      reset();
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

  const handleAddTestimonial = () => {
    setShowCreateDialog(true);
  };

  const handleUpdateTestimonial = async (data: UpdateTestimonialInput) => {
    if (!editingTestimonial) return;

    try {
      await updateTestimonialMutation.mutateAsync({
        id: editingTestimonial.id,
        input: data
      });
      
      toast({
        title: "Testimonial Updated",
        description: "Your testimonial has been updated successfully.",
      });
      
      setShowEditDialog(false);
      setEditingTestimonial(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update testimonial. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if current user has already left a testimonial for this project
  const userHasTestimonial = testimonials.some(t => t.from_user === user?.id);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-r-4 border-b-4 border-foreground bg-lavenda">
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <Quote size={20} />
              Community Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading testimonials...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-r-4 border-b-4 border-foreground bg-lavenda">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-xl flex items-center gap-2 text-midBlack">
                <Quote size={20} />
                Project Testimonials ({testimonials.length})
              </CardTitle>
              
              {user && !userHasTestimonial && (
                <Button 
                  size="sm"
                  onClick={handleAddTestimonial}
                  className="bg-nightBlue text-boneWhite hover:bg-nightBlue/90"
                >
                  <Plus size={16} />
                  Add Testimonial
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {testimonials.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 space-y-4"
              >
                <MessageSquare size={48} className="mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-midBlack font-medium">
                    No testimonials yet for this project
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Be the first to share your experience working on "{projectTitle}"
                  </p>
                </div>
                {user && !userHasTestimonial && (
                  <Button 
                    onClick={handleAddTestimonial}
                    className="bg-nightBlue text-boneWhite"
                  >
                    <Plus size={16} />
                    Add the First Testimonial
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {userHasTestimonial && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✓ You have already shared your testimonial for this project
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <TestimonialCard testimonial={testimonial} />
                      
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Testimonial Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Your Experience</DialogTitle>
            <DialogDescription>
              Write a testimonial about your experience working on "{projectTitle}"
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleCreateTestimonial)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content">Your Testimonial *</Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder="Share your experience working on this project. What did you accomplish? What skills did you develop? What impact did your work have?"
                rows={6}
                className="resize-none"
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Write 10-500 characters about your contribution to this project
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={createTestimonialMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTestimonialMutation.isPending}
                className="bg-nightBlue text-boneWhite hover:bg-nightBlue/90"
              >
                {createTestimonialMutation.isPending ? 'Submitting...' : 'Submit Testimonial'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Testimonial Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Update your testimonial to reflect your current experience.
            </DialogDescription>
          </DialogHeader>
          
          {editingTestimonial && (
            <EditTestimonialForm
              defaultContent={editingTestimonial.content}
              onSubmit={handleUpdateTestimonial}
              isLoading={updateTestimonialMutation.isPending}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
