import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CircuitBoard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils/dateUtils';
import type { UserPublic } from '@/lib/types/user';

interface PublicProfileProps {
  user: UserPublic;
}

export const PublicProfile = ({ user }: PublicProfileProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-foreground bg-lavenda">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6">
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-heading font-bold mb-2 text-midBlack">
                  {user.name}
                </h1>
                <p className="text-xl text-midBlack mb-4">
                  {user.institute} • Class of {user.grad_year}
                </p>
                {user.bio && (
                  <p className="text-midBlack mb-4">
                    {user.bio}
                  </p>
                )}
                {user.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 text-sm text-midBlack"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="text-midBlack"
                >
                  <CircuitBoard size={16} />
                  Dashboard
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};