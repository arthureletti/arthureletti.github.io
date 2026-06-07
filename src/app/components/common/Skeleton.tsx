interface SkeletonProps {
  variant?: 'card' | 'text' | 'image' | 'avatar';
  className?: string;
}

export function Skeleton({ variant = 'text', className = '' }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-muted rounded';

  const variants = {
    card: 'h-64 w-full',
    text: 'h-4 w-full',
    image: 'aspect-video w-full',
    avatar: 'w-16 h-16 rounded-full',
  };

  return <div className={`${baseClass} ${variants[variant]} ${className}`}></div>;
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-card rounded-[8px] overflow-hidden border border-border">
      <Skeleton variant="image" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}
