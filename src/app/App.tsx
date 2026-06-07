import { ThemeProvider } from './providers/ThemeProvider';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { StatCounter } from './components/home/StatCounter';
import { FeaturedProjects } from './components/home/FeaturedProjects';
import { SkillsCloud } from './components/home/SkillsCloud';
import { ContactCTA } from './components/home/ContactCTA';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground font-['Plus_Jakarta_Sans']">
        <Navbar currentPath="/" />
        <main>
          <HeroBanner />
          <StatCounter />
          <FeaturedProjects />
          <SkillsCloud />
          <ContactCTA />
        </main>
        <Footer />
        <Toaster position="bottom-right" richColors />
      </div>
    </ThemeProvider>
  );
}
