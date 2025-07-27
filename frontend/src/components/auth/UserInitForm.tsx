import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserInitInput, userInitSchema } from '@/lib/schemas/user.schema';
import { useInitUser } from '@/lib/api/users';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';

interface UserInitFormProps {
  onInit: (data: UserInitInput) => void;
  isLoading: boolean;
}

const UserInitForm = ({ onInit, isLoading }: UserInitFormProps) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const initUserMutation = useInitUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserInitInput>({
    resolver: zodResolver(userInitSchema),
    defaultValues: {
      skills: [],
      bio: '',
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setValue('skills', newSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: UserInitInput) => {
    try {
      await initUserMutation.mutateAsync({ ...data, skills });
      toast({
        title: 'Profile created!',
        description: 'Your profile has been initialized.',
      });
      onInit({ ...data, skills });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to initialize user',
        variant: 'destructive',
      });
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to RuneGard!</CardTitle>
          <CardDescription className="text-lg">
            {`Let's set up your profile to help you connect with amazing teammates`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                autoComplete="name"
                {...register('name')}
                placeholder="Enter your full name"
                className="text-lg"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            {/* Institute */}
            <div className="space-y-2">
              <Label htmlFor="institute">Institute/University *</Label>
              <Input
                id="institute"
                autoComplete="organization"
                {...register('institute')}
                placeholder="e.g., Massachusetts Institute of Technology"
                className="text-lg"
              />
              {errors.institute && (
                <p className="text-sm text-destructive">{errors.institute.message}</p>
              )}
            </div>
            {/* Graduation Year */}
            <div className="space-y-2">
              <Label htmlFor="grad_year">Graduation Year *</Label>
              <Input
                id="grad_year"
                type="number"
                min="2020"
                max="2030"
                {...register('grad_year', { valueAsNumber: true })}
                placeholder="e.g., 2025"
                className="text-lg"
              />
              {errors.grad_year && (
                <p className="text-sm text-destructive">{errors.grad_year.message}</p>
              )}
            </div>
            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Technologies</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a skill (e.g., React, Python, Machine Learning)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  variant="outline"
                  size="icon"
                  disabled={!skillInput.trim() || skills.includes(skillInput.trim())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Add skills to help teammates find you for relevant projects
              </p>
            </div>
            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                autoComplete="off"
                {...register('bio')}
                placeholder="Tell us about yourself, your interests, and what kind of projects you'd like to work on..."
                className="min-h-[120px] text-base"
              />
              <p className="text-sm text-muted-foreground">
                A good bio helps you connect with like-minded teammates
              </p>
            </div>
            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg"
                disabled={isLoading || initUserMutation.isPending}
              >
                {(isLoading || initUserMutation.isPending) ? "Creating your profile..." : "Join RuneGard"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserInitForm;


