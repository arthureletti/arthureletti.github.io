import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { TimelineItem } from '../components/about/TimelineItem';
import { SocialLinks } from '../components/common/SocialLinks';
import { profile, timeline } from '../data/mockData';
import { motion } from 'motion/react';
import { Download, Mail } from 'lucide-react';

export function AboutPage() {
  const experiences = timeline.filter((item) => item.type === 'experience');
  const education = timeline.filter((item) => item.type === 'education');

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPath="/a-propos" />

      <div className="pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-full max-w-md rounded-[12px] shadow-xl"
                />
              </div>
              <div>
                <h1 className="text-4xl font-semibold mb-4">À propos de moi</h1>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {profile.bio}
                </p>
                <SocialLinks className="mb-6" />
                <div className="flex gap-4">
                  <a
                    href={profile.cvUrl}
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger CV
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Me contacter
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <div id="parcours" className="mb-16">
            <h2 className="text-3xl font-semibold mb-8">Parcours professionnel</h2>
            <div className="space-y-0">
              {experiences.map((item, index) => (
                <TimelineItem key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>

          <div id="formation" className="mb-16">
            <h2 className="text-3xl font-semibold mb-8">Formation</h2>
            <div className="space-y-0">
              {education.map((item, index) => (
                <TimelineItem key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
