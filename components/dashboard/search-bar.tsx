'use client';

import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Search hackathons by name, tag, or organizer...'}
          className="w-full rounded-lg border border-brand bg-card py-2.5 pl-9 pr-4 text-sm text-primary placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
        />
      </div>
      <button className="flex items-center gap-2 rounded-lg border border-brand bg-card px-3 py-2.5 text-sm text-secondary hover:bg-[var(--bg-secondary)]">
        <SlidersHorizontal size={16} />
        Filters
      </button>
    </div>
  );
}
