import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackButton } from '../components/common/BackButton';
import { TagBadge } from '../components/common/TagBadge';
import { motion } from 'motion/react';
import { Github, FileText, Code2, Calendar, ExternalLink, Download, Package } from 'lucide-react';
import { projects } from '../data/mockData';
import { Link } from 'react-router';

interface ProjectDetailPageProps { slug: string; }

const FILE_ICONS: Record<string, any> = {
  pdf:    FileText,
  pbix:   Package,
  xlsx:   FileText,
  csv:    FileText,
  github: Github,
  colab:  Code2,
  other:  ExternalLink,
};

const FILE_LABELS: Record<string, string> = {
  pdf:    'PDF',
  pbix:   'Power BI',
  xlsx:   'Excel',
  csv:    'CSV',
  github: 'GitHub',
  colab:  'Colab',
  other:  'Fichier',
};

export function ProjectDetailPage({ slug }: ProjectDetailPageProps) {
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-4">Projet non trouvé</h1>
          <Link to="/projets" className="hover:underline" style={{ color: '#F97316' }}>Retour aux projets</Link>
        </div>
      </div>
    );
  }

  // Fusionner files + liens legacy (githubUrl, pdfUrl, colabUrl)
  const allFiles = [
    ...(project.files || []),
    ...(project.githubUrl && !(project.files || []).find(f => f.type === 'github')
      ? [{ label: 'Code source GitHub', url: project.githubUrl, type: 'github' as const }] : []),
    ...(project.pdfUrl && !(project.files || []).find(f => f.url === project.pdfUrl)
      ? [{ label: 'Rapport PDF', url: project.pdfUrl, type: 'pdf' as const }] : []),
    ...(project.colabUrl
      ? [{ label: 'Google Colab', url: project.colabUrl, type: 'colab' as const }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <BackButton to="/projets" label="Retour aux projets" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="aspect-video w-full rounded-[12px] overflow-hidden mb-8 bg-muted">
              <img src={project.coverUrl} alt={project.title} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Corps principal */}
              <div className="lg:col-span-2">
                <h1 className="text-4xl font-semibold mb-4">{project.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                  {project.publishedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-['JetBrains_Mono']">{project.publishedAt}</span>
                    </div>
                  )}
                  {project.status === 'ongoing' && (
                    <span className="px-3 py-1 bg-[#D97706]/10 text-[#D97706] rounded-full text-xs font-medium">En cours</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
                </div>

                <div className="text-base leading-relaxed whitespace-pre-line text-foreground"
                  style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                  {project.body}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">

                  {/* Dossier du projet */}
                  {allFiles.length > 0 && (
                    <div className="bg-card border border-border rounded-[12px] p-6">
                      <h3 className="font-semibold mb-1">📁 Dossier du projet</h3>
                      <p className="text-xs text-muted-foreground mb-4">Tous les fichiers disponibles</p>
                      <div className="space-y-2">
                        {allFiles.map((file, i) => {
                          const Icon = FILE_ICONS[file.type] || ExternalLink;
                          const isExternal = file.url.startsWith('http');
                          const badge = FILE_LABELS[file.type];
                          return (
                            <a key={i} href={file.url}
                              target={isExternal ? '_blank' : undefined}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              download={!isExternal}
                              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[#F97316]/50 hover:bg-[#FFF7ED] transition-all group">
                              <div className="p-1.5 rounded-md" style={{ background: 'rgba(249,115,22,0.1)' }}>
                                <Icon className="w-4 h-4" style={{ color: '#F97316' }} />
                              </div>
                              <span className="flex-1 text-sm font-medium line-clamp-1">{file.label}</span>
                              <span className="shrink-0 text-xs font-['JetBrains_Mono'] px-2 py-0.5 rounded"
                                style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}>
                                {badge}
                              </span>
                              {isExternal ? <ExternalLink className="w-3 h-3 text-muted-foreground" /> : <Download className="w-3 h-3 text-muted-foreground" />}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CTA contact */}
                  <div className="rounded-[12px] p-6 text-white"
                    style={{ background: 'linear-gradient(135deg, #1a0a05, #2d0f1a)' }}>
                    <h3 className="font-semibold mb-2">Intéressé par ce projet ?</h3>
                    <p className="text-sm text-white/70 mb-4">N'hésitez pas à me contacter pour en discuter.</p>
                    <Link to="/contact"
                      className="block text-center px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}>
                      Me contacter
                    </Link>
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
