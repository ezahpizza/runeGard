import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, MessageSquare, Users, TrendingUp, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsData {
  projectsCount: number;
  requestsCount: number;
  testimonialsCount: number;
  collaborationsCount: number;
}

interface MyStatsCardProps {
  stats: StatsData;
}

export const MyStatsCard = ({ stats }: MyStatsCardProps) => {
  const statItems = [
    {
      title: 'My Projects',
      value: stats.projectsCount,
      icon: FolderOpen,
      color: 'text-apricot',
      bgColor: 'bg-apricot',
    },
    {
      title: 'Requests Sent',
      value: stats.requestsCount,
      icon: MessageSquare,
      color: 'text-nightBlue',
      bgColor: 'bg-nightBlue',
    },
    {
      title: 'Testimonials',
      value: stats.testimonialsCount,
      icon: Quote,
      color: 'text-rumba',
      bgColor: 'bg-rumba',
    },
    {
      title: 'Collaborations',
      value: stats.collaborationsCount,
      icon: Users,
      color: 'text-mint',
      bgColor: 'bg-mint',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`${item.bgColor} border-2 border-r-4 border-b-4 border-foreground hover:translate-x-1 hover:translate-y-1 hover:border-r-2 hover:border-b-2 transition-all`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <div className={`p-2 rounded-lg bg-foreground`}>
                  <item.icon size={20} className={item.color} />
                </div>
                {item.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold font-heading">
                  {item.value}
                </span>
                
                {item.value > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-lavenda text-midBlack">
                    <TrendingUp size={12} />
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};