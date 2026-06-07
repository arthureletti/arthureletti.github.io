import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchInput({ onSearch, placeholder = 'Rechercher...' }: SearchInputProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
      />
    </div>
  );
}
