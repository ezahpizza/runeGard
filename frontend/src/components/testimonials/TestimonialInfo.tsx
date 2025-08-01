import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Calendar, User, Edit, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils/dateUtils';
import { useUserById } from '@/lib/api/users';
import { useProjectById } from '@/lib/api/projects';
import type { TestimonialPublic } from '@/lib/types/testimonial';

interface TestimonialInfoProps {
  testimonial: TestimonialPublic;
}

export const TestimonialInfo = ({ testimonial }: TestimonialInfoProps) => {
  const { user } = useUser();
  const { data: fromUser, isLoading: isLoadingFromUser } = useUserById(testimonial.from_user);
  const { data: project, isLoading: isLoadingProject } = useProjectById(testimonial.project_id);
  
  const isAuthor = user?.id === testimonial.from_user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground bg-lavenda">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Quote size={24} />
              Testimonial
            </CardTitle>
            
            {isAuthor && (
              <Button asChild size="sm" className="bg-mint text-midBlack">
                <Link to={`/testimonials/edit/${testimonial.id}`}>
                  <Edit size={16} />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-card p-6 rounded-lg border-2 border-foreground">
            <blockquote className="text-lg leading-relaxed italic">
              "{testimonial.content}"
            </blockquote>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-heading font-bold flex items-center gap-2">
              <FolderOpen size={16} />
              Project
            </h3>
            {isLoadingProject ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : project ? (
              <div className="flex items-center justify-between p-3 bg-card rounded border">
                <span>{project.title}</span>
                <Button asChild size="sm" className='hover:bg-lavenda text-midBlack'>
                  <Link to={`/projects/${project.id}`}>
                    View Project
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground">Project not found</div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-heading font-bold flex items-center gap-2">
              <User size={16} />
              Author
            </h3>
            {isLoadingFromUser ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : fromUser ? (
              <div className="flex items-center justify-between p-3 bg-card rounded border">
                <span>{fromUser.name}</span>
                <Button asChild size="sm" className='bg-mint hover:bg-rumba text-midBlack'>
                  <Link to={`/profile/${fromUser.user_id}`}>
                    View Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground">Unknown User</div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
            <Calendar size={16} />
            <span>Written on {formatDate(testimonial.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
