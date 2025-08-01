import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Plus, Calendar, Trash2 } from 'lucide-react';
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
import { useDeleteRequest } from '@/lib/api/requests';
import { useToast } from '@/hooks/use-toast';
import type { TeammateRequestPublic } from '@/lib/types/request';

interface MyRequestsListProps {
  requests: TeammateRequestPublic[];
  isLoading: boolean;
}

export const MyRequestsList = ({ requests, isLoading }: MyRequestsListProps) => {
  const deleteRequestMutation = useDeleteRequest();
  const { toast } = useToast();

  const handleDelete = async (request: TeammateRequestPublic) => {
    try {
      await deleteRequestMutation.mutateAsync(request.id);
      toast({
        title: "Request Deleted",
        description: `Request "${request.looking_for}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground bg-mint">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-2xl text-midBlack">
              My Teammate Requests
            </CardTitle>
            <Button asChild size="sm" className="bg-nightBlue text-boneWhite">
              <Link to="/requests/new">
                <Plus size={16} />
                New Request
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading your requests...</div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-midBlack">
              <p className="text-lg mb-4">You haven't created any teammate requests yet.</p>
              <Button asChild className='text-midBlack'>
                <Link to="/requests/new">Create your first request</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-lavenda rounded-lg p-4 border-2 border-midBlack"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-lg text-midBlack mb-2">
                        Looking for: {request.looking_for}
                      </h3>
                      
                      <p className="text-midBlack text-sm mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-midBlack/70 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(request.created_at)}</span>
                        </div>
                      </div>
                      
                      {request.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {request.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-apricot">
                              {tag}
                            </Badge>
                          ))}
                          {request.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-apricot">
                              +{request.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="hover:bg-apricot">
                        <Link to={`/requests/${request.id}`}>
                          <Eye size={14} />
                          View
                        </Link>
                      </Button>
                      
                      <Button asChild size="sm" className='bg-mint text-midBlack'>
                        <Link to={`/requests/edit/${request.id}`}>
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
                            disabled={deleteRequestMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{request.looking_for}"? This action cannot be undone and will permanently remove the request.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(request)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              {deleteRequestMutation.isPending ? "Deleting..." : "Delete Request"}
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
