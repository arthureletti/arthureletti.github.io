import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface StatCounterProps { value: number; label: string; suffix?: string; prefix?: string; }

function StatItem({ value, label, suffix = '', prefix = '' }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setIsVisible(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = value / (2000 / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-['JetBrains_Mono'] font-semibold mb-2"
        style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function StatCounter() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-[12px] border border-border bg-card">
          <StatItem value={8}   label="Projets réalisés"   suffix="+" />
          <StatItem value={373} label="Répondants enquêtés" suffix="+" />
          <StatItem value={2}   label="Ans d'études data"  />
        </motion.div>
      </div>
    </section>
  );
}
