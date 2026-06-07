import { motion } from 'motion/react';
import { TimelineItem as TimelineItemType } from '../../data/mockData';
import { Briefcase, GraduationCap } from 'lucide-react';

interface TimelineItemProps {
  item: TimelineItemType;
  index: number;
}

export function TimelineItem({ item, index }: TimelineItemProps) {
  const Icon = item.type === 'experience' ? Briefcase : GraduationCap;
  const iconBgColor = item.type === 'experience' ? 'bg-[#2563EB]/10' : 'bg-[#059669]/10';
  const iconColor = item.type === 'experience' ? 'text-[#2563EB]' : 'text-[#059669]';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      <div className="absolute left-0 top-0 w-px h-full bg-border"></div>

      <div className={`absolute left-0 top-1 -translate-x-1/2 p-2 rounded-full ${iconBgColor} ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="bg-card border border-border rounded-[8px] p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
            <p className="text-[#2563EB] font-medium">{item.organization}</p>
          </div>
          <span className="shrink-0 px-3 py-1 bg-accent text-xs font-['JetBrains_Mono'] rounded-full">
            {item.date}
          </span>
        </div>
        <p className="text-muted-foreground">{item.description}</p>
      </div>
    </motion.div>
  );
}
