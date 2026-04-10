// components/public/sections/CertificationsSection.tsx
'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, ExternalLink, Calendar } from 'lucide-react';

interface Props { data: Record<string, unknown> | null | undefined; }

const CERTS = [
  { title: 'Embedded Machine Learning', org: 'Edge Impulse', date: 'Aug 2024', category: 'AI/ML', url: 'https://edgeimpulse.com' },
  { title: 'TensorFlow Lite for Microcontrollers', org: 'Coursera / Google', date: 'Jul 2024', category: 'AI/ML', url: '#' },
  { title: 'FreeRTOS Fundamentals', org: 'Udemy', date: 'Jun 2024', category: 'Embedded', url: '#' },
  { title: 'IoT with ESP32', org: 'Espressif', date: 'May 2024', category: 'IoT', url: '#' },
  { title: 'STM32 Bare Metal Programming', org: 'Udemy', date: 'Apr 2024', category: 'Embedded', url: '#' },
  { title: 'Git & GitHub Essentials', org: 'GitHub', date: 'Mar 2024', category: 'Tools', url: '#' },
];

const CAT_COLORS: Record<string, string> = {
  'AI/ML': 'text-accent border-accent/30 bg-accent/10',
  'Embedded': 'text-primary border-primary/30 bg-primary/10',
  'IoT': 'text-secondary border-secondary/30 bg-secondary/10',
  'Tools': 'text-warning border-warning/30 bg-warning/10',
};

export default function CertificationsSection({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }} className="section-heading">
        <h2 className="font-heading text-text-primary flex items-center gap-3"><span>📜</span> Certifications</h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CERTS.map((cert, i) => (
          <motion.div key={cert.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.95 }} transition={{ delay: i * 0.06 }} className="card p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <Award size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${CAT_COLORS[cert.category] || 'text-text-muted border-border'}`}>{cert.category}</span>
            </div>
            <h3 className="font-heading font-semibold text-text-primary text-sm leading-tight">{cert.title}</h3>
            <p className="text-xs text-text-secondary">{cert.org}</p>
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="flex items-center gap-1 text-xs text-text-muted"><Calendar size={10} /> {cert.date}</span>
              <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                Verify <ExternalLink size={10} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
