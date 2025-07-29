import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUpvoteProject } from '@/lib/api/projects';
import { useToast } from '@/hooks/use-toast';

interface UpvoteButtonProps {
  projectId: string;
  initialUpvotes?: number;
  isUpvoted?: boolean;
}

export const UpvoteButton = ({ 
  projectId, 
  initialUpvotes = 0, 
  isUpvoted = false 
}: UpvoteButtonProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [voted, setVoted] = useState(isUpvoted);
  const { toast } = useToast();
  
  const upvoteMutation = useUpvoteProject();

  // Update local state when props change (useful for real-time updates)
  useEffect(() => {
    setUpvotes(initialUpvotes);
    setVoted(isUpvoted);
  }, [initialUpvotes, isUpvoted]);

  const handleUpvote = async () => {
    try {
      // Optimistic update - immediately update UI
      const newVoted = !voted;
      const newUpvotes = newVoted ? upvotes + 1 : upvotes - 1;
      
      setVoted(newVoted);
      setUpvotes(newUpvotes);

      // Make API call
      const result = await upvoteMutation.mutateAsync(projectId);
      
      // Update with actual values from server (in case of discrepancies)
      setVoted(result.upvoted);
      setUpvotes(result.upvotes_count);
      
    } catch (error) {
      // Revert optimistic update on error
      setVoted(!voted);
      setUpvotes(voted ? upvotes + 1 : upvotes - 1);
      
      toast({
        title: "Error",
        description: "Failed to update upvote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant={voted ? "default" : "outline"}
        size="sm"
        onClick={handleUpvote}
        disabled={upvoteMutation.isPending}
        className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200 ${
          voted ? 'bg-nightBlue text-primary-foreground' : 'hover:bg-muted'
        } ${upvoteMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <motion.div
          animate={{ 
            y: upvoteMutation.isPending ? [-1, 1, -1] : 0,
            rotate: voted ? [0, 10, 0] : 0
          }}
          transition={{ 
            duration: upvoteMutation.isPending ? 0.6 : 0.3,
            repeat: upvoteMutation.isPending ? Infinity : 0
          }}
        >
          <ChevronUp size={18} />
        </motion.div>
        <span className="text-xs font-bold">{upvotes}</span>
      </Button>
    </motion.div>
  );
};