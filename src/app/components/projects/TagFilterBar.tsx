import { Tag } from '../../data/mockData';
import { motion } from 'motion/react';

interface TagFilterBarProps {
  tags: Tag[];
  selectedTag: string | null;
  onSelectTag: (tagName: string | null) => void;
}

export function TagFilterBar({ tags, selectedTag, onSelectTag }: TagFilterBarProps) {
  return (
    <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-sm border-b border-border py-4">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectTag(null)}
            className={`shrink-0 px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-sm font-medium transition-all ${
              selectedTag === null
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'bg-accent text-foreground hover:bg-accent/80'
            }`}
          >
            Tous
          </motion.button>

          {tags.map((tag) => (
            <motion.button
              key={tag.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectTag(tag.name)}
              className={`shrink-0 px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-sm font-medium transition-all ${
                selectedTag === tag.name
                  ? 'text-white shadow-md'
                  : 'text-foreground hover:opacity-80'
              }`}
              style={{
                backgroundColor: selectedTag === tag.name ? tag.color : 'var(--accent)',
              }}
            >
              {tag.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
