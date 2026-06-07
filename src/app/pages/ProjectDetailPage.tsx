import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackButton } from '../components/common/BackButton';
import { TagBadge } from '../components/common/TagBadge';
import { motion } from 'motion/react';
import { Github, FileText, Code2, Calendar, ExternalLink } from 'lucide-react';
import { projects } from '../data/mockData';

interface ProjectDetailPageProps {
  slug: string;
}

export function ProjectDetailPage({ slug }: ProjectDetailPageProps) {
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-4">Projet non trouvé</h1>
          <a href="/projets" className="text-[#2563EB] hover:underline">
            Retour aux projets
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <BackButton href="/projets" label="Retour aux projets" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-video w-full rounded-[12px] overflow-hidden mb-8 bg-muted">
              <img
                src={project.coverUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h1 className="text-4xl font-semibold mb-4">{project.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-['JetBrains_Mono']">{project.publishedAt}</span>
                  </div>
                  {project.status === 'ongoing' && (
                    <span className="px-3 py-1 bg-[#D97706]/10 text-[#D97706] rounded-full text-xs font-medium">
                      En cours
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>

                <div className="prose prose-slate max-w-none">
                  <div className="text-lg leading-relaxed whitespace-pre-line">
                    {project.body}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="bg-card border border-border rounded-[12px] p-6">
                    <h3 className="font-semibold mb-4">Liens du projet</h3>
                    <div className="space-y-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                        >
                          <Github className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                          <span className="flex-1 font-medium">Code source</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}

                      {project.pdfUrl && (
                        <a
                          href={project.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                        >
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                          <span className="flex-1 font-medium">Rapport PDF</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}

                      {project.colabUrl && (
                        <a
                          href={project.colabUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                        >
                          <Code2 className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                          <span className="flex-1 font-medium">Google Colab</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-[12px] p-6">
                    <h3 className="font-semibold mb-2">Intéressé par ce projet ?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      N'hésitez pas à me contacter pour en discuter davantage.
                    </p>
                    <a
                      href="/contact"
                      className="block text-center px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
                    >
                      Me contacter
                    </a>
                  </div>
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
