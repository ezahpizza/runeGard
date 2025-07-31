import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Calendar, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils/dateUtils';
import { useUserById } from '@/lib/api/users';
import type { TeammateRequest } from '@/lib/types/request';

interface RequestInfoProps {
  request: TeammateRequest;
  onContact?: () => void;
}

export const RequestInfo = ({ 
  request, 
  onContact,
}: RequestInfoProps) => {
  const { user } = useUser();
  const { data: requestCreator, isLoading: isLoadingUser } = useUserById(request.user_id);
  const isOwner = user?.id === request.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground bg-lavenda text-midBlack">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="font-heading text-2xl">
                Looking for: {request.looking_for}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Posted {formatDate(request.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={16} />
                  <span>by {isLoadingUser ? 'Loading...' : (requestCreator?.name || request.user_id)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isOwner && (
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/requests/edit/${request.id}`}>
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
              {request.description}
            </p>
          </div>
          
          {request.tags.length > 0 && (
            <div>
              <h3 className="font-heading font-bold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {request.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {!isOwner && (
            <div className="flex gap-3">
              <Button 
                onClick={onContact}
                className="flex-1 sm:flex-none bg-nightBlue text-boneWhite"
              >
                <MessageSquare size={16} />
                Contact
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
