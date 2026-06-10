import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './providers/ThemeProvider';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { StatCounter } from './components/home/StatCounter';
import { FeaturedProjects } from './components/home/FeaturedProjects';
import { SkillsCloud } from './components/home/SkillsCloud';
import { ContactCTA } from './components/home/ContactCTA';
import { ProjectsPage } from './pages/ProjectsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router';

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-['Inter']">
      <Navbar currentPath="/" />
      <main>
        <HeroBanner />
        <StatCounter />
        <FeaturedProjects />
        <SkillsCloud />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}

function ProjectDetailWrapper() {
  const location = useLocation();
  const slug = location.pathname.replace('/projets/', '');
  return (
    <div className="min-h-screen bg-background text-foreground font-['Inter']">
      <ProjectDetailPage slug={slug} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/projets"    element={<ProjectsPage />} />
          <Route path="/projets/:slug" element={<ProjectDetailWrapper />} />
          <Route path="/a-propos"   element={<AboutPage />} />
          <Route path="/contact"    element={<ContactPage />} />
        </Routes>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </ThemeProvider>
  );
}
