import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema } from '@/lib/schemas/project.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { CreateProjectInput } from '@/lib/types/project';

interface ProjectFormProps {
  defaultValues?: Partial<CreateProjectInput>;
  onSubmit: (data: CreateProjectInput) => void;
  isLoading?: boolean;
}

export const ProjectForm = ({ defaultValues, onSubmit, isLoading }: ProjectFormProps) => {
  const [currentTag, setCurrentTag] = useState('');
  const [currentTech, setCurrentTech] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      abstract: '',
      tech_stack: [],
      tags: [],
      contributors: [],
      github_link: '',
      demo_link: '',
      report_url: '',
      status: 'open',
      ...defaultValues,
    },
  });

  const tags = watch('tags') || [];
  const techStack = watch('tech_stack') || [];

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setValue('tags', [...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const addTech = () => {
    if (currentTech.trim() && !techStack.includes(currentTech.trim())) {
      setValue('tech_stack', [...techStack, currentTech.trim()]);
      setCurrentTech('');
    }
  };

  const removeTech = (techToRemove: string) => {
    setValue('tech_stack', techStack.filter(tech => tech !== techToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleTechKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTech();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-heading">Project Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter your project title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Project Abstract</Label>
            <Textarea
              id="abstract"
              {...register('abstract')}
              placeholder="Describe your project, its goals, and what makes it special"
              rows={4}
            />
            {errors.abstract && (
              <p className="text-sm text-destructive">{errors.abstract.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_link">GitHub Link</Label>
            <Input
              id="github_link"
              {...register('github_link')}
              placeholder="https://github.com/username/repository"
              type="url"
            />
            {errors.github_link && (
              <p className="text-sm text-destructive">{errors.github_link.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo_link">Demo Link (Optional)</Label>
            <Input
              id="demo_link"
              {...register('demo_link')}
              placeholder="https://your-demo.com"
              type="url"
            />
            {errors.demo_link && (
              <p className="text-sm text-destructive">{errors.demo_link.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="report_url">Report URL (Optional)</Label>
            <Input
              id="report_url"
              {...register('report_url')}
              placeholder="https://link-to-your-report.com"
              type="url"
            />
            {errors.report_url && (
              <p className="text-sm text-destructive">{errors.report_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech_stack">Technology Stack</Label>
            <div className="flex gap-2">
              <Input
                id="tech_stack"
                value={currentTech}
                onChange={(e) => setCurrentTech(e.target.value)}
                onKeyPress={handleTechKeyPress}
                placeholder="Add technologies (e.g., React, Node.js, Python)"
              />
              <Button type="button" onClick={addTech} variant="outline">
                Add
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-destructive"
                      onClick={() => removeTech(tech)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {errors.tech_stack && (
              <p className="text-sm text-destructive">{errors.tech_stack.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags (e.g., Web App, AI, Mobile)"
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

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : defaultValues ? 'Update Project' : 'Create Project'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};