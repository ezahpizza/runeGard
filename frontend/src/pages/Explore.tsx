import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectsList, RequestsList } from './index';

const Explore = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold mb-4">Explore</h1>
          <p className="text-muted-foreground">Discover amazing projects and collaboration opportunities</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-card border-mid-black p-1">
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-apricot data-[state=active]:text-mid-black data-[state=active]:shadow-[4px_4px_0_0_#0B1215] font-medium transition-all duration-200"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="data-[state=active]:bg-mint data-[state=active]:text-mid-black data-[state=active]:shadow-[4px_4px_0_0_#0B1215] font-medium transition-all duration-200"
              >
                Teammate Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <ProjectsList standalone={false} />
            </TabsContent>

            <TabsContent value="requests">
              <RequestsList standalone={false} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Explore;