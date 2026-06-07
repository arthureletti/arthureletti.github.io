import { Tag } from '../../data/mockData';

interface TagBadgeProps {
  tag: Tag;
  clickable?: boolean;
  onClick?: () => void;
}

export function TagBadge({ tag, clickable = false, onClick }: TagBadgeProps) {
  const Component = clickable ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-['JetBrains_Mono'] font-medium transition-all ${
        clickable ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''
      }`}
      style={{
        backgroundColor: `${tag.color}15`,
        color: tag.color,
      }}
    >
      {tag.label}
    </Component>
  );
}
