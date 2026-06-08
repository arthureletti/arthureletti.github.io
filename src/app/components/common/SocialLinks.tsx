import { Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '../../data/mockData';

interface SocialLinksProps { className?: string; }

export function SocialLinks({ className = '' }: SocialLinksProps) {
  const links = [
    { icon: Github,   href: profile.githubUrl,        label: 'GitHub'   },
    { icon: Linkedin, href: profile.linkedinUrl,      label: 'LinkedIn' },
    { icon: Mail,     href: `mailto:${profile.email}`, label: 'Email'   },
  ];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map(({ icon: Icon, href, label }) => (
        <a key={label} href={href}
          target={label !== 'Email' ? '_blank' : undefined}
          rel={label !== 'Email' ? 'noopener noreferrer' : undefined}
          className="p-3 rounded-lg border border-border hover:bg-[#F97316] hover:text-white hover:border-[#F97316] transition-all"
          aria-label={label}>
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
}
