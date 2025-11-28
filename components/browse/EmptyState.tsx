import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClearFilters?: () => void;
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-lyra-purple-start to-lyra-purple-end rounded-full blur-2xl opacity-30"></div>
        <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-6 shadow-2xl">
          <Search className="h-12 w-12 text-lyra-purple-start" />
        </div>
      </div>

      <h3 className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-2">
        No Accommodations Found
      </h3>

      <p className="text-white/60 text-center mb-6 max-w-md">
        We couldn&apos;t find any accommodations matching your search criteria. Try adjusting your
        filters or search terms.
      </p>

      {onClearFilters && (
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 hover:border-lyra-purple-start/50 transition-all duration-300"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
