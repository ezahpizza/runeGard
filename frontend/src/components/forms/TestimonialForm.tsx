import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@clerk/clerk-react';
import { createTestimonialSchema, createTestimonialContentSchema } from '@/lib/schemas/testimonial.schema';
import { useProjects } from '@/lib/api/projects';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateTestimonialInput, CreateTestimonialContentInput } from '@/lib/types/testimonial';

interface TestimonialFormProps {
  defaultValues?: Partial<CreateTestimonialInput>;
  onSubmit: (data: CreateTestimonialInput) => void;
  isLoading?: boolean;
  projectId?: string; 
}

export const TestimonialForm = ({ 
  defaultValues, 
  onSubmit, 
  isLoading,
  projectId 
}: TestimonialFormProps) => {
  const { user } = useUser();
  // Using maximum allowed limit (100) - if more projects exist, pagination would be needed
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({
    limit: 100
  });
  
  const isProjectSpecific = !!projectId;
  const schema = isProjectSpecific ? createTestimonialContentSchema : createTestimonialSchema;
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTestimonialInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: '',
      project_id: projectId || '',
      ...defaultValues,
    },
  });

  const selectedProjectId = watch('project_id');

  const handleFormSubmit = (data: CreateTestimonialInput | CreateTestimonialContentInput) => {
    if (isProjectSpecific) {
      onSubmit({ ...data, project_id: projectId } as CreateTestimonialInput);
    } else {
      onSubmit(data as CreateTestimonialInput);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-heading">
          {defaultValues ? 'Edit Testimonial' : 'Share Your Experience'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {!isProjectSpecific && (
            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Select
                value={selectedProjectId}
                onValueChange={(value) => setValue('project_id', value)}
                disabled={isLoadingProjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingProjects 
                      ? "Loading projects..." 
                      : "Select a project to write testimonial for"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {projectsData?.projects?.length === 0 ? (
                    <SelectItem value="" disabled>
                      No projects available
                    </SelectItem>
                  ) : (
                    projectsData?.projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.project_id && (
                <p className="text-sm text-destructive">{errors.project_id.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Select any project from the platform to share your experience or testimonial
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Testimonial *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Share your experience. What did you accomplish? What skills did you develop or demonstrate? What impact did your work have?"
              rows={6}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : defaultValues ? 'Update Testimonial' : 'Submit Testimonial'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};