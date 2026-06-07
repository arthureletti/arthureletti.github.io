import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NavbarProps {
  currentPath?: string;
}

export function Navbar({ currentPath = '/' }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/',         label: 'Accueil'  },
    { href: '/projets',  label: 'Projets'  },
    { href: '/a-propos', label: 'À propos' },
    { href: '/cv',       label: 'CV'       },
    { href: '/contact',  label: 'Contact'  },
  ];

  if (!mounted) return null;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm border-b border-border' : 'bg-transparent'
      }`}>
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="font-['JetBrains_Mono'] font-semibold text-lg"
              style={{
                background: 'linear-gradient(135deg, #F97316, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              AE.
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}
                  className={`text-sm transition-colors ${
                    currentPath === link.href
                      ? 'font-medium'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                  style={currentPath === link.href ? {
                    background: 'linear-gradient(135deg, #F97316, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } : {}}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Toggle menu">
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background md:hidden pt-[72px]">
          <div className="px-6 py-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}
                className={`text-xl transition-colors ${currentPath === link.href ? 'font-medium' : 'text-foreground'}`}
                style={currentPath === link.href ? {
                  background: 'linear-gradient(135deg, #F97316, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                } : {}}
                onClick={() => setIsMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
