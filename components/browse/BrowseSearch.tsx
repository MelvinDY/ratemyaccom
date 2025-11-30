'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full group"
    >
      {/* Glow effect background */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

      {/* Main container */}
      <div className="relative flex items-center">
        {/* Search icon */}
        <div className="absolute left-6 z-10 flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/20 flex items-center justify-center group-focus-within:from-purple-500/30 group-focus-within:to-violet-500/20 transition-all duration-300"
          >
            <Search className="h-4 w-4 text-purple-400 group-focus-within:text-purple-300 transition-colors duration-300" />
          </motion.div>
        </div>

        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-20 pr-6 py-5 text-base bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] text-white placeholder:text-neutral-500 rounded-3xl outline-none focus:bg-gradient-to-br focus:from-white/[0.08] focus:to-white/[0.04] focus:border-purple-500/40 hover:bg-gradient-to-br hover:from-white/[0.07] hover:to-white/[0.03] hover:border-white/[0.12] transition-all duration-300 font-light tracking-wide backdrop-blur-sm"
          aria-label="Search accommodations"
        />

        {/* Right side decoration */}
        {value && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-6 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-neutral-500 uppercase tracking-widest">Searching</span>
          </motion.div>
        )}
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
        initial={{ width: '0%' }}
        animate={{ width: value ? '60%' : '0%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
