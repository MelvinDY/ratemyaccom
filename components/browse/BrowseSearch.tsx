'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BrowseSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function BrowseSearch({
  value,
  onChange,
  placeholder = 'Search by name, location, or university...',
}: BrowseSearchProps) {
  return (
    <div className="relative w-full group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-lyra-purple-start transition-colors duration-300" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-12 pr-4 py-6 text-base bg-white/5 backdrop-blur-md border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-lyra-purple-start/50 focus:ring-2 focus:ring-lyra-purple-start/30 hover:bg-white/[0.07] hover:border-white/20 rounded-2xl shadow-lg shadow-black/20 transition-all duration-300"
        aria-label="Search accommodations"
      />
    </div>
  );
}
