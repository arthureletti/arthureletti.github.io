import { motion } from 'motion/react';
import { Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export function ContactCTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="relative overflow-hidden text-white rounded-[12px] p-12 md:p-16"
          style={{ background: 'linear-gradient(135deg, #1a0a05 0%, #2d0f1a 50%, #1a0510 100%)' }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: '#F97316' }} />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 p-2 rounded-lg mb-6" style={{ background: 'rgba(249,115,22,0.15)' }}>
              <Mail className="w-5 h-5" style={{ color: '#F97316' }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Vous avez un projet en tête ?</h2>
            <p className="text-white/70 text-lg mb-8">Je suis disponible pour un stage, une alternance ou une collaboration. N'hésitez pas à me contacter !</p>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', color: '#fff' }}>
              Me contacter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
