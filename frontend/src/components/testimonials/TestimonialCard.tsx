import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Calendar, Eye, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils/dateUtils';
import type { TestimonialWithUser, TestimonialWithProject } from '@/lib/types/testimonial';

interface TestimonialCardProps {
  testimonial: TestimonialWithUser | TestimonialWithProject;
  className?: string;
  showProject?: boolean;
}

export const TestimonialCard = ({ testimonial, className = '', showProject = false }: TestimonialCardProps) => {
  const hasProjectTitle = 'project_title' in testimonial;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      transition={{ duration: 0.2 }}
      className={`h-full ${className}`}
    >
      <Card className="h-full border-foreground bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Quote size={20} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                From {testimonial.from_user_name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar size={12} />
              <span>{formatDate(testimonial.created_at)}</span>
            </div>
          </div>
          
          {showProject && hasProjectTitle && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-accent/50 rounded-md">
              <FolderOpen size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium">
                For: {(testimonial as TestimonialWithProject).project_title}
              </span>
              <Button asChild size="sm" variant="ghost" className="ml-auto h-6 px-2 text-xs">
                <Link to={`/projects/${testimonial.project_id}`}>
                  View Project
                </Link>
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed line-clamp-4">
            {testimonial.content}
          </p>
          
          <div className="flex justify-end">
            <Button asChild size="sm" variant="outline" className="hover:bg-apricot">
              <Link to={`/testimonials/${testimonial.id}`}>
                <Eye size={14} />
                View Full
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
