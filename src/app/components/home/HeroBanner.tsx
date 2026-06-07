import { ArrowRight, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { profile } from '../../data/mockData';

export function HeroBanner() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center px-6 pt-24">
      <div className="max-w-[1200px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {profile.openToWork && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-['JetBrains_Mono'] mb-6"
                style={{ background: 'linear-gradient(135deg,#FFF7ED,#FDF2F8)', color: '#F97316', border: '1px solid #FDBA74' }}>
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
                Open to work — Stage / Alternance
              </div>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 leading-tight">
              Arthur{' '}
              <span
                className="font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #E85D73, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Eletti
              </span>
            </h1>

            <p
              className="text-xl font-medium mb-3"
              style={{
                background: 'linear-gradient(135deg, #F97316, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Étudiant BUT Science des Données
            </p>

            <p className="text-base text-muted-foreground mb-8 max-w-xl leading-relaxed">
              {profile.bio}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/projets"
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-opacity hover:opacity-90 font-medium"
                style={{ background: 'linear-gradient(135deg, #F97316, #E85D73, #EC4899)' }}
              >
                Voir mes projets
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/cv"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Télécharger CV
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-full blur-2xl opacity-30"
                style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
              ></div>
              <div
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-full p-1"
                style={{ background: 'linear-gradient(135deg, #F97316, #E85D73, #EC4899)' }}
              >
                <img
                  src={profile.avatarUrl}
                  alt="Arthur Eletti"
                  className="w-full h-full rounded-full object-cover border-4 border-background"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
