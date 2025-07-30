import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Plus, Calendar, Users, Trash2 } from 'lucide-react';
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
import { useDeleteProject } from '@/lib/api/projects';
import { useToast } from '@/hooks/use-toast';

import type { ProjectSummary } from '@/lib/types/project';

interface MyProjectsListProps {
  projects: ProjectSummary[];
  isLoading: boolean;
}

export const MyProjectsList = ({ projects, isLoading }: MyProjectsListProps) => {
  const deleteProjectMutation = useDeleteProject();
  const { toast } = useToast();

  const handleDelete = async (project: ProjectSummary) => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      toast({
        title: "Project Deleted",
        description: "Your project has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };


  if (isLoading) {
    return (
      <Card className="border-2 border-foreground">
        <CardContent className="p-6">
          <div className="text-center">Loading your projects...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground bg-rumba">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-xl">My Projects</CardTitle>
            <Button asChild size="sm" className='text-midBlack'>
              <Link to="/projects/new">
                <Plus size={16} />
                Create New
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="text-muted-foreground">
                You haven't created any projects yet
              </div>
              <Button asChild>
                <Link to="/projects/new">
                  <Plus size={16} />
                  Create Your First Project
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border-2 border-foreground bg-lavenda text-midBlack rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-heading font-bold text-lg">
                        {project.title}
                      </h3>
                      
                      <p className="text-sm line-clamp-2">
                        {project.abstract}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>Solo project</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="hover:bg-apricot">
                        <Link to={`/projects/${project.id}`}>
                          <Eye size={14} />
                          View
                        </Link>
                      </Button>
                      
                      <Button asChild size="sm" className='bg-rumba text-midBlack'>
                        <Link to={`/projects/edit/${project.id}`}>
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
                            disabled={deleteProjectMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{project.title}"? This action cannot be undone and will permanently remove the project and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(project)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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