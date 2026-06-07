import { Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '../../data/mockData';

interface SocialLinksProps {
  className?: string;
}

export function SocialLinks({ className = '' }: SocialLinksProps) {
  const links = [
    { icon: Github, href: profile.githubUrl, label: 'GitHub' },
    { icon: Linkedin, href: profile.linkedinUrl, label: 'LinkedIn' },
    { icon: Mail, href: `mailto:${profile.email}`, label: 'Email' },
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            target={link.label !== 'Email' ? '_blank' : undefined}
            rel={link.label !== 'Email' ? 'noopener noreferrer' : undefined}
            className="p-3 rounded-lg border border-border hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all"
            aria-label={link.label}
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
}
