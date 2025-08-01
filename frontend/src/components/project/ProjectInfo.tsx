import { useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UpvoteButton } from './index';
import { Edit, Users, Calendar, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils/dateUtils';
import type { Project } from '@/lib/types/project';

interface ProjectDetailProps {
  project: Project;
}

export const ProjectInfo = ({ project }: ProjectDetailProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isOwner = user?.id === project.created_by;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground bg-apricot text-midBlack">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="font-heading text-3xl">
                {project.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Created {formatDate(project.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{project.contributors.length} contributor{project.contributors.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <UpvoteButton 
                projectId={project.id}
                initialUpvotes={project.upvotes}
                isUpvoted={user?.id ? project.upvoted_by.includes(user.id) : false}
              />
              
              {isOwner && (
                <Button asChild size="sm" variant="outline">
                  <Link to={`/projects/edit/${project.id}`}>
                    <Edit size={16} />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-heading font-bold mb-3">Description</h3>
            <p className="whitespace-pre-wrap leading-relaxed">
              {project.abstract}
            </p>
          </div>
          
          {project.tags.length > 0 && (
            <div>
              <h3 className="font-heading font-bold mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div>
            {isOwner && (
            <Button 
              onClick={() => navigate('/requests/new', { state: { projectId: project.id } })}
              className="bg-nightBlue text-boneWhite"
            >
              <MessageSquare size={16} />
              Find Teammates
            </Button>)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};