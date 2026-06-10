import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ContactForm } from '../components/contact/ContactForm';
import { SocialLinks } from '../components/common/SocialLinks';
import { profile } from '../data/mockData';
import { motion } from 'motion/react';
import { Mail, MapPin, Clock } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h1 className="text-4xl font-semibold mb-4">Contactez-moi</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Une question ? Un projet ? N'hésitez pas à me contacter, je vous répondrai dans les plus brefs délais.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-[12px] p-8">
                  <h2 className="text-2xl font-semibold mb-6">Envoyez-moi un message</h2>
                  <ContactForm />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card border border-border rounded-[12px] p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-sm text-muted-foreground hover:text-[#2563EB] transition-colors"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-[#059669]/10 text-[#059669]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Localisation</h3>
                      <p className="text-sm text-muted-foreground">
                        Niort, France (79)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Disponibilité</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.openToWork ? 'Disponible pour de nouveaux projets' : 'Actuellement indisponible'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-[12px] p-6">
                  <h3 className="font-semibold mb-4">Réseaux sociaux</h3>
                  <SocialLinks />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
