import { Project } from '../../data/mockData';
import { TagBadge } from '../common/TagBadge';
import { Github, ExternalLink, Clock } from 'lucide-react';

interface ProjectCardProps { project: Project; }

export function ProjectCard({ project }: ProjectCardProps) {
  const isPlaceholder = project.slug === '#';

  return (
    <a
      href={isPlaceholder ? undefined : `/projets/${project.slug}`}
      className={`group block bg-card rounded-[8px] overflow-hidden border border-border transition-all duration-300 ${
        isPlaceholder ? 'cursor-default opacity-60' : 'hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img src={project.coverUrl} alt={project.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${!isPlaceholder ? 'group-hover:scale-105' : ''}`} />
        {isPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="text-white font-['JetBrains_Mono'] text-sm px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Bientôt disponible
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className={`font-semibold text-lg line-clamp-2 transition-colors ${
            !isPlaceholder ? 'group-hover:text-transparent group-hover:bg-clip-text' : ''
          }`}
            style={!isPlaceholder ? {
              transition: 'color 0.2s',
            } : {}}>
            {project.title}
          </h3>
          {project.status === 'ongoing' && (
            <span className="shrink-0 px-2 py-1 text-xs font-['JetBrains_Mono'] bg-[#D97706]/10 text-[#D97706] rounded">
              En cours
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.summary}</p>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag) => <TagBadge key={tag.id} tag={tag} />)}
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {project.publishedAt && (
            <span className="font-['JetBrains_Mono']">{project.publishedAt}</span>
          )}
          {project.githubUrl && (
            <div className="flex items-center gap-1 ml-auto">
              <Github className="w-4 h-4" />
              <ExternalLink className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
