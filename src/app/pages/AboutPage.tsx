import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { TimelineItem } from '../components/about/TimelineItem';
import { SocialLinks } from '../components/common/SocialLinks';
import { profile, timeline } from '../data/mockData';
import { motion } from 'motion/react';
import { Download, Mail } from 'lucide-react';
import { Link } from 'react-router';

export function AboutPage() {
  const experiences = timeline.filter((item) => item.type === 'experience');
  const education   = timeline.filter((item) => item.type === 'education');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <img src={profile.avatarUrl} alt="Arthur Eletti"
                  className="w-full max-w-sm rounded-[12px] shadow-xl mx-auto"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'; }} />
              </div>
              <div>
                <h1 className="text-4xl font-semibold mb-2">Arthur Eletti</h1>
                <p className="text-lg font-medium mb-4" style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Étudiant BUT Science des Données
                </p>
                <p className="text-base text-muted-foreground mb-2">📍 Niort, France &nbsp;·&nbsp; 19 ans</p>
                <p className="text-base text-muted-foreground mb-2">🇬🇧 Anglais B2 &nbsp;·&nbsp; 🇮🇹 Italien B1</p>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">{profile.bio}</p>
                <SocialLinks className="mb-6" />
                <div className="flex flex-wrap gap-4">
                  <a href={profile.cvUrl} download
                    className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}>
                    <Download className="w-4 h-4" /> Télécharger CV
                  </a>
                  <Link to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium">
                    <Mail className="w-4 h-4" /> Me contacter
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <div id="formation" className="mb-16">
            <h2 className="text-3xl font-semibold mb-8">Formation</h2>
            <div className="space-y-0">
              {education.map((item, index) => <TimelineItem key={item.id} item={item} index={index} />)}
            </div>
          </div>

          <div id="parcours" className="mb-16">
            <h2 className="text-3xl font-semibold mb-8">Expériences professionnelles</h2>
            <div className="space-y-0">
              {experiences.map((item, index) => <TimelineItem key={item.id} item={item} index={index} />)}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
