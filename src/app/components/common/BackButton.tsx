import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
}

export function BackButton({ href = '/', label = 'Retour' }: BackButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2563EB] transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </a>
  );
}
