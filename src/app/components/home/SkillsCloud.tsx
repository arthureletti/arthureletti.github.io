import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { skills } from '../../data/mockData';

const GRADIENT = 'linear-gradient(135deg, #F97316, #E85D73, #EC4899)';

export function SkillsCloud() {
  const categories = ['Langages', 'Outils', 'Méthodes'];

  const getIcon = (iconName: string) => {
    const key = iconName.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    return (LucideIcons as any)[key] || LucideIcons.Code;
  };

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-semibold mb-4 text-center">Compétences</h2>
          <p className="text-muted-foreground mb-12 text-center">Technologies et méthodes que je maîtrise</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => {
              const catSkills = skills.filter((s) => s.category === category);
              return (
                <div key={category} className="bg-card rounded-[12px] p-6 border border-border">
                  <h3 className="font-['JetBrains_Mono'] text-sm uppercase text-muted-foreground mb-6 tracking-wider">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {catSkills.map((skill, index) => {
                      const Icon = getIcon(skill.iconName);
                      return (
                        <motion.div key={skill.id}
                          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="group flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <div className="p-2 rounded-md" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{skill.name}</span>
                              <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{skill.level}/5</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${(skill.level / 5) * 100}%`, background: GRADIENT }} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
