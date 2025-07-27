import { Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserResource } from '@clerk/types';

interface DashboardHeaderProps {
  user: UserResource;
}

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback className="text-xl">
                  {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-3xl font-heading font-bold">
                  Welcome back, {user.firstName || 'User'}!
                </h1>
                <p className="text-muted-foreground">
                  Manage your projects and track your collaborations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link to="/projects/new">
                  <Plus size={16} />
                  New Project
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link to={`/profile/${user.id}`}>
                  <User size={16} />
                  View Profile
                </Link>
              </Button>
              
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};