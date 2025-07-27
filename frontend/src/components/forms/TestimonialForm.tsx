import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTestimonialSchema } from '@/lib/schemas/testimonial.schema';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateTestimonialInput } from '@/lib/types/testimonial';

interface TestimonialFormProps {
  defaultValues?: Partial<CreateTestimonialInput>;
  onSubmit: (data: CreateTestimonialInput) => void;
  isLoading?: boolean;
  recipientId?: string;
  projectId?: string;
}

export const TestimonialForm = ({ 
  defaultValues, 
  onSubmit, 
  isLoading,
  recipientId,
  projectId 
}: TestimonialFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTestimonialInput>({
    resolver: zodResolver(createTestimonialSchema),
    defaultValues: {
      content: '',
      to_user: recipientId || '',
      ...defaultValues,
    },
  });

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-heading">
          {defaultValues ? 'Edit Testimonial' : 'Leave a Testimonial'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">Testimonial</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Share your experience working with this person. What did they contribute to the project? What skills did they demonstrate?"
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