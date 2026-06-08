import { useState, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { TagFilterBar } from '../components/projects/TagFilterBar';
import { SearchInput } from '../components/projects/SearchInput';
import { ProjectGrid } from '../components/projects/ProjectGrid';
import { projects, tags } from '../data/mockData';
import { motion } from 'motion/react';

export function ProjectsPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesTag = !selectedTag || project.tags.some((tag) => tag.name === selectedTag);
      const matchesSearch =
        !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTag && matchesSearch && project.status === 'published';
    });
  }, [selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-semibold mb-4">Mes Projets</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Découvrez mes projets de data science et machine learning
            </p>

            <div className="max-w-xl">
              <SearchInput
                onSearch={setSearchQuery}
                placeholder="Rechercher un projet..."
              />
            </div>
          </motion.div>
        </div>
      </div>

      <TagFilterBar
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">
              {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
            </p>
          </div>

          <ProjectGrid projects={filteredProjects} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
