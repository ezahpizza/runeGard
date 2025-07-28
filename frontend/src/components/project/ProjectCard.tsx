import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils/dateUtils';
import type { Project } from '@/lib/types/project';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {

  return (
    <div className="w-full mx-auto my-4">
      <Card className="h-full border-2 border-r-4 border-b-4 border-foreground bg-mint">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg line-clamp-2 text-midBlack">
            {project.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-midBlack text-sm line-clamp-3">
            {project.abstract}
          </p>
          
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-midBlack">
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>Solo project</span>
            </div>
            
            <div className="text-xs">
              {formatDate(project.created_at)}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1 text-midBlack">
              <Link to={`/projects/${project.id}`}>
                <Eye size={16} />
                View Details
              </Link>
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};