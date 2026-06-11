import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ProjectCard } from '../projects/ProjectCard';
import { projects } from '../../data/mockData';

export function FeaturedProjects() {
  const featured = [
    projects.find((p) => p.slug === 'les-chemins-du-bonheur-power-bi')!,
    projects.find((p) => p.slug === 'greensd-gestion-logistique-verte')!,
    {
      id: 'ph1', slug: '', title: 'Projet à venir',
      summary: 'Description disponible prochainement.',
      coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      tags: [], featured: true, status: 'draft' as const, publishedAt: '', body: '',
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-semibold mb-4">Projets en vedette</h2>
          <p className="text-muted-foreground mb-12">Une sélection de mes projets les plus représentatifs</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((project, index) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/projets"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium">
              Voir tous les projets <span>→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
