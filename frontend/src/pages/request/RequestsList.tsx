import { useState } from 'react';
import { useTeammateRequests } from '@/lib/api/requests';
import { RequestListFilters } from '@/components/requests/RequestListFilters';
import { RequestCard } from '@/components/requests';
import { PaginatedGrid } from '@/components/shared';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';

interface RequestsListProps {
  standalone?: boolean;
}

const RequestsList = ({ standalone = true }: RequestsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data: requestsData, isLoading, isError } = useTeammateRequests();

  const requests = requestsData?.requests || [];
  
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.looking_for.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => (request.tags || []).includes(tag));
    return matchesSearch && matchesTags;
  });

  if (isLoading) {
    return (
      <div className={standalone ? "min-h-screen bg-background flex items-center justify-center" : "flex items-center justify-center py-12"}>
        <Loading message="Discovering teammate requests..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={standalone ? "min-h-screen bg-background flex items-center justify-center" : "flex items-center justify-center py-12"}>
        <div className="text-lg text-destructive">Failed to load teammate requests</div>
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
      <RequestListFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        allRequests={requests}
      />
      
      <PaginatedGrid
        items={filteredRequests}
        renderItem={(request) => <RequestCard key={request.id} request={request} />}
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
          <h1 className="text-4xl font-heading font-bold mb-4">Teammate Requests</h1>
          <p className="text-muted-foreground">Find collaborators and discover opportunities</p>
        </motion.div>

        {content}
      </div>
    </motion.div>
  );
};

export default RequestsList;
