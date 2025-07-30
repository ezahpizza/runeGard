import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/project';
import { motion } from 'framer-motion';
import { debug } from '@/lib/utils/debug';
import type { Project } from '@/lib/types/project';

interface UserProjectsGridProps {
  projects: Project[];
}

export const UserProjectsGrid = ({ projects }: UserProjectsGridProps) => {
  debug.log('UserProjectsGrid Debug:', {
    projects,
    projectsLength: projects.length,
    firstProject: projects[0]
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-foreground bg-apricot text-midBlack">
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Projects ({projects.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-muted-foreground">
                No projects to display
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};