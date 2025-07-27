import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Plus, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProjectSummary } from '@/lib/types/project';

interface MyProjectsListProps {
  projects: ProjectSummary[];
  isLoading: boolean;
}

export const MyProjectsList = ({ projects, isLoading }: MyProjectsListProps) => {
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
      <Card className="border-2 border-r-4 border-b-4 border-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-xl">My Projects</CardTitle>
            <Button asChild size="sm">
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
                  className="p-4 border-2 border-foreground rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-heading font-bold text-lg">
                        {project.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.abstract}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>Solo project</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/projects/${project.id}`}>
                          <Eye size={14} />
                          View
                        </Link>
                      </Button>
                      
                      <Button asChild size="sm">
                        <Link to={`/projects/edit/${project.id}`}>
                          <Edit size={14} />
                          Edit
                        </Link>
                      </Button>
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