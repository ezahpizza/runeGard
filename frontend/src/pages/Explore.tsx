import { useState } from 'react';
import { useProjects } from '@/lib/api/projects';
import { ProjectListFilters } from '@/components/project/ProjectListFilters';
import { ProjectCard } from '@/components/project/ProjectCard';
import { PaginatedGrid } from '@/components/shared/PaginatedGrid';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data: projectsData, isLoading, isError } = useProjects();

  const projects = projectsData?.projects || [];
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => project.tech_stack.includes(tag));
    return matchesSearch && matchesTags;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Discovering projects..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-destructive">Failed to load projects</div>
      </div>
    );
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
          <h1 className="text-4xl font-heading font-bold mb-4">Explore Projects</h1>
          <p className="text-muted-foreground">Discover amazing final-year projects and find collaboration opportunities</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProjectListFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            allProjects={projects}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PaginatedGrid
            items={filteredProjects}
            renderItem={(project) => <ProjectCard key={project.id} project={project} />}
            itemsPerPage={12}
            className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Explore;