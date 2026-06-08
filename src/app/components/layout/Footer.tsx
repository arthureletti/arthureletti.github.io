import { Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { profile } from '../../data/mockData';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[#0A0A0B] text-[#F7F6F2] mt-32">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-['JetBrains_Mono'] font-semibold text-lg mb-4"
              style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Arthur Eletti
            </h3>
            <p className="text-sm text-[#6B6B70]">
              Étudiant BUT Science des Données — IUT de Niort.<br />
              Passionné par la donnée, l'analyse et la visualisation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Accueil'], ['/projets', 'Projets'], ['/a-propos', 'À propos'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link to={href} className="text-[#6B6B70] hover:text-[#F97316] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Me retrouver</h4>
            <div className="flex gap-4">
              {[
                { icon: Github,   href: profile.githubUrl,        label: 'GitHub'   },
                { icon: Linkedin, href: profile.linkedinUrl,      label: 'LinkedIn' },
                { icon: Mail,     href: `mailto:${profile.email}`, label: 'Email'   },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target={label !== 'Email' ? '_blank' : undefined}
                  rel={label !== 'Email' ? 'noopener noreferrer' : undefined}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" aria-label={label}>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-[#6B6B70]">
          <p>&copy; {currentYear} Arthur Eletti — Portfolio Data Analyst</p>
        </div>
      </div>
    </footer>
  );
}
