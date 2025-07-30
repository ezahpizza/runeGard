import { useState } from 'react';
import { useProjects } from '@/lib/api/projects';
import { ProjectListFilters, ProjectCard } from '@/components/project';
import { PaginatedGrid } from '@/components/shared';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';

interface ProjectsListProps {
  standalone?: boolean;
}

const ProjectsList = ({ standalone = true }: ProjectsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data: projectsData, isLoading, isError } = useProjects();

  const projects = projectsData?.projects || [];
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => (project.tags || []).includes(tag));
    return matchesSearch && matchesTags;
  });

  if (isLoading) {
    return (
      <div className={standalone ? "min-h-screen bg-background flex items-center justify-center" : "flex items-center justify-center py-12"}>
        <Loading message="Discovering projects..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={standalone ? "min-h-screen bg-background flex items-center justify-center" : "flex items-center justify-center py-12"}>
        <div className="text-lg text-destructive">Failed to load projects</div>
      </div>
    );
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      <ProjectListFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        allProjects={projects}
      />
      
      <PaginatedGrid
        items={filteredProjects}
        renderItem={(project) => <ProjectCard key={project.id} project={project} />}
        itemsPerPage={12}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      />
    </motion.div>
  );

  if (!standalone) {
    return content;
  }

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
          <h1 className="text-4xl font-heading font-bold mb-4">Projects</h1>
          <p className="text-muted-foreground">Discover amazing projects and collaboration opportunities</p>
        </motion.div>

        {content}
      </div>
    </motion.div>
  );
};

export default ProjectsList;
