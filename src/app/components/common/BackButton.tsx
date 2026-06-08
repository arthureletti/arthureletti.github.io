import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

interface BackButtonProps { to?: string; label?: string; }

export function BackButton({ to = '/', label = 'Retour' }: BackButtonProps) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#F97316] transition-colors mb-6">
      <ArrowLeft className="w-4 h-4" />{label}
    </Link>
  );
}
