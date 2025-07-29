import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from '@/lib/types/user';


interface ContributorListProps {
  contributors: User[];
  createdBy: string;
}

export const ContributorList = ({ contributors, createdBy }: ContributorListProps) => {
  const owner = contributors.find(contributor => contributor.user_id === createdBy);
  const members = contributors.filter(contributor => contributor.user_id !== createdBy);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground bg-rumba">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            Contributors ({contributors.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {owner && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link 
                to={`/profile/${owner.user_id}`}
                className="flex items-center gap-3 p-3 border-2 border-foreground rounded-lg bg-mint hover:bg-lavenda transition-colors"
              >

                <Avatar className="h-8 w-8">
                      <AvatarFallback>{owner.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
       
                <div className="flex-1 text-midBlack">
                  <div className="flex items-center gap-2">
                    <h4 className="font-body font-medium">{owner.name}</h4>
                    <Badge variant="default" className="flex items-center gap-1 text-midBlack">
                      <Crown size={12} />
                      Owner
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{owner.email}</p>
                </div>
              </Link>
            </motion.div>
          )}
          
          {members.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-body font-medium text-sm text-muted-foreground">Team Members</h4>
              {members.map((member, index) => (
                <motion.div
                  key={member.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (index * 0.05) }}
                >
                  <Link 
                    to={`/profile/${member.user_id}`}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-body font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          
          {contributors.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No contributors yet
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};