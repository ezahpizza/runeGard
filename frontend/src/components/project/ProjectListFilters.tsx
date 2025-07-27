import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProjectSummary } from '@/lib/types/project';

interface ProjectListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  allProjects: ProjectSummary[];
}

export const ProjectListFilters = ({ 
  searchTerm, 
  onSearchChange, 
  selectedTags, 
  onTagsChange, 
  allProjects 
}: ProjectListFiltersProps) => {
  // Get all unique tech stack items from projects since ProjectSummary doesn't have tags
  const allTags = Array.from(
    new Set(allProjects.flatMap(project => project.tech_stack))
  ).sort();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onTagsChange([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-8"
    >
      <Card className="border-2 border-foreground">
        <CardContent className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Tags */}
          {allTags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-body font-medium">Filter by Technology</h3>
                {(searchTerm || selectedTags.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {isSelected && <X size={14} className="ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Active filters */}
          {(searchTerm || selectedTags.length > 0) && (
            <div className="text-sm text-muted-foreground">
              Showing results for: {searchTerm && `"${searchTerm}"`}
              {searchTerm && selectedTags.length > 0 && ' and '}
              {selectedTags.length > 0 && `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''}`}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};