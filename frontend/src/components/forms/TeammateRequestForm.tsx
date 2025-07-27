import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTeammateRequestSchema } from '@/lib/schemas/request.schema';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateTeammateRequestInput } from '@/lib/types/request';

interface TeammateRequestFormProps {
  defaultValues?: Partial<CreateTeammateRequestInput>;
  onSubmit: (data: CreateTeammateRequestInput) => void;
  isLoading?: boolean;
  projectId?: string;
}

export const TeammateRequestForm = ({ 
  defaultValues, 
  onSubmit, 
  isLoading,
  projectId 
}: TeammateRequestFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeammateRequestInput>({
    resolver: zodResolver(createTeammateRequestSchema),
    defaultValues: {
      looking_for: '',
      description: '',
      project_id: projectId || '',
      tags: [],
      ...defaultValues,
    },
  });

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-heading">
          {defaultValues ? 'Edit Request' : 'Send Teammate Request'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="looking_for">What are you looking for?</Label>
            <Input
              id="looking_for"
              {...register('looking_for')}
              placeholder="e.g., Frontend Developer, Backend Developer, Designer..."
            />
            {errors.looking_for && (
              <p className="text-sm text-destructive">{errors.looking_for.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your project and what kind of teammate you're looking for..."
              rows={6}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Sending...' : defaultValues ? 'Update Request' : 'Send Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};