import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const handleUpvote = () => {
    // TODO: Implement actual upvote API call
    if (voted) {
      setUpvotes(prev => prev - 1);
      setVoted(false);
    } else {
      setUpvotes(prev => prev + 1);
      setVoted(true);
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
        className="flex flex-col items-center gap-1 h-auto py-2 px-3"
      >
        <ChevronUp size={18} />
        <span className="text-xs font-bold">{upvotes}</span>
      </Button>
    </motion.div>
  );
};