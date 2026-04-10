// components/public/sections/AboutSection.tsx
'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, MapPin, Cpu } from 'lucide-react';

interface AboutProps { data: Record<string, unknown> | null | undefined; }

export default function AboutSection({ data }: AboutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }} className="section-heading">
        <h2 className="font-heading text-text-primary flex items-center gap-3"><span>👤</span> About Me</h2>
      </motion.div>
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -20 }} transition={{ delay: 0.1 }}>
          <p className="text-text-secondary leading-relaxed mb-4">
            I&apos;m <span className="text-primary font-semibold">Sri Charan</span>, a final-year
            Electronics and Communication Engineering student at{' '}
            <span className="text-secondary font-semibold">KITS Karimnagar</span>, Telangana.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            My passion lies at the intersection of <span className="text-primary font-semibold">Embedded Systems</span> and{' '}
            <span className="text-secondary font-semibold">Artificial Intelligence</span> — specifically deploying
            machine learning models on microcontrollers (TinyML) and building intelligent IoT systems.
          </p>
          <p className="text-text-secondary leading-relaxed mb-6">
            From building AI voice assistant robots on ESP32 to deploying TFLite models on STM32,
            I love working at the hardware-software boundary where milliseconds and kilobytes matter.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin size={14} className="text-primary" /> Karimnagar, Telangana, India
            </span>
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              <GraduationCap size={14} className="text-secondary" /> KITS Karimnagar, ECE, 2025
            </span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : 20 }} transition={{ delay: 0.2 }}>
          <div className="card p-6">
            <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Cpu size={16} className="text-primary" /> Areas of Interest
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Embedded AI', 'TinyML', 'Edge AI', 'IoT', 'ESP32', 'STM32', 'FreeRTOS',
                'TensorFlow Lite', 'Edge Impulse', 'Embedded Linux', 'FPGA (Learning)', 'PCB Design'].map(interest => (
                <span key={interest} className="tech-chip">{interest}</span>
              ))}
            </div>
          </div>
          <div className="card p-6 mt-4">
            <h3 className="font-heading font-semibold text-text-primary mb-4">Education</h3>
            <div className="space-y-3">
              {[
                { degree: 'B.Tech — ECE', institution: 'KITS Karimnagar', year: '2021–2025', grade: 'CGPA: 7.8/10' },
                { degree: '12th Grade', institution: 'State Board, Telangana', year: '2019–2021', grade: '87%' },
              ].map(edu => (
                <div key={edu.degree} className="border-l-2 border-primary pl-3">
                  <p className="text-sm font-semibold text-text-primary">{edu.degree}</p>
                  <p className="text-xs text-text-secondary">{edu.institution}</p>
                  <p className="text-xs text-text-muted">{edu.year} · {edu.grade}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
