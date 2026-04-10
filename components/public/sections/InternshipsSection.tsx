// components/public/sections/InternshipsSection.tsx
'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Briefcase, Calendar, MapPin, ExternalLink } from 'lucide-react';

interface Props { data: Record<string, unknown> | null | undefined; }

const INTERNSHIPS = [
  {
    company: 'Emertxe Information Technologies',
    role: 'Embedded Systems Intern',
    duration: 'Jun 2024 – Aug 2024',
    months: '3 months',
    location: 'Bangalore (Remote)',
    description: 'Worked on STM32-based embedded systems projects including smart sensor nodes, RTOS task scheduling, and MQTT-based IoT data pipelines.',
    skills: ['STM32', 'FreeRTOS', 'C', 'MQTT', 'I2C', 'SPI', 'UART'],
    type: 'remote',
  },
];

export default function InternshipsSection({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }} className="section-heading">
        <h2 className="font-heading text-text-primary flex items-center gap-3"><span>💼</span> Internships</h2>
      </motion.div>
      <div className="space-y-6">
        {INTERNSHIPS.map((intern, i) => (
          <motion.div key={intern.company} initial={{ opacity: 0, y: 20 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }} transition={{ delay: i * 0.1 }} className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-heading font-bold text-text-primary">{intern.role}</h3>
                <p className="text-primary font-semibold">{intern.company}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-text-muted">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {intern.duration} ({intern.months})</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {intern.location}</span>
                </div>
              </div>
              <span className="badge-completed text-xs px-2 py-1 rounded-full font-mono">Completed</span>
            </div>
            <p className="text-text-secondary text-sm mb-3">{intern.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {intern.skills.map(s => <span key={s} className="tech-chip">{s}</span>)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
