import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTeammateRequestSchema } from '@/lib/schemas/request.schema';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useState } from 'react';
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
  const [currentTag, setCurrentTag] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
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

  const tags = watch('tags') || [];

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setValue('tags', [...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto bg-mint">
      <CardHeader>
        <CardTitle className="font-heading text-midBlack">
          {defaultValues ? 'Edit Request' : 'Send Teammate Request'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="looking_for" className="text-midBlack">What are you looking for?</Label>
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
            <Label htmlFor="description" className="text-midBlack">Description</Label>
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

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-midBlack">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags (e.g., React, Python, UI/UX)"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full text-midBlack">
            {isLoading ? 'Saving...' : defaultValues ? 'Update Request' : 'Send Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};