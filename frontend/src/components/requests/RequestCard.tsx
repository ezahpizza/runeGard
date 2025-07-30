import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils/dateUtils';
import type { TeammateRequestPublic } from '@/lib/types/request';

interface RequestCardProps {
  request: TeammateRequestPublic;
  className?: string;
}

export const RequestCard = ({ request, className = '' }: RequestCardProps) => {
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
      <Card className="h-full border-foreground bg-mint hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg text-midBlack line-clamp-2">
            Looking for: {request.looking_for}
          </CardTitle>
          <div className="flex items-center gap-3 text-sm text-midBlack/70">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(request.created_at)}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4 flex flex-col h-full">
          <p className="text-midBlack text-sm line-clamp-3 leading-relaxed flex-grow">
            {request.description}
          </p>
          
          {request.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {request.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {request.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{request.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex justify-center">
            <Link to={`/requests/${request.id}`}>
              <Button size="sm" className="bg-apricot text-midBlack">
                <Eye size={14} />
                View
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
