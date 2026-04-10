// components/public/sections/TimelineSection.tsx
'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Briefcase, Award, Cpu, Star } from 'lucide-react';

interface Props { sections: Record<string, unknown>[]; }

const TIMELINE = [
  { date: 'Dec 2024', type: 'project', icon: Cpu, color: '#00D4FF', title: 'Spidey AI Robot', desc: 'Built ESP32 AI voice assistant with Groq Whisper + LLaMA pipeline' },
  { date: 'Nov 2024', type: 'project', icon: Cpu, color: '#00FF88', title: 'TinyML Vibration Detector', desc: 'Deployed TFLite model on ESP32 — 95.4% accuracy at 12ms inference' },
  { date: 'Aug 2024', type: 'internship', icon: Briefcase, color: '#FF6B35', title: 'Emertxe Internship Completed', desc: 'STM32 embedded systems — smart sensor nodes, FreeRTOS, MQTT' },
  { date: 'Jun 2024', type: 'internship', icon: Briefcase, color: '#FF6B35', title: 'Joined Emertxe', desc: 'Embedded Systems Intern — Bangalore (Remote)' },
  { date: 'May 2024', type: 'cert', icon: Award, color: '#FFD60A', title: 'Edge Impulse Certification', desc: 'Embedded Machine Learning certificate' },
  { date: 'Nov 2023', type: 'project', icon: Cpu, color: '#00D4FF', title: 'WiFi/BLE Surveillance System', desc: 'ESP32-based unauthorized device detection with live web dashboard' },
  { date: '2021', type: 'education', icon: GraduationCap, color: '#00FF88', title: 'Started B.Tech ECE', desc: 'KITS Karimnagar — Electronics and Communication Engineering' },
];

export default function TimelineSection({ sections }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }} className="section-heading">
        <h2 className="font-heading text-text-primary flex items-center gap-3"><span>📊</span> Experience Timeline</h2>
      </motion.div>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-0 md:-translate-x-px" aria-hidden="true" />
        <div className="space-y-6">
          {TIMELINE.map((item, i) => {
            const Icon = item.icon;
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={item.title + item.date}
                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : (isLeft ? -20 : 20) }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex items-start gap-4 md:gap-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`flex-1 ml-10 md:ml-0 ${isLeft ? 'md:pr-10 md:text-right' : 'md:pl-10'}`}>
                  <div className="card p-4 inline-block text-left">
                    <span className="text-xs font-mono text-text-muted block mb-1">{item.date}</span>
                    <h3 className="font-heading font-semibold text-text-primary text-sm">{item.title}</h3>
                    <p className="text-text-secondary text-xs mt-1">{item.desc}</p>
                  </div>
                </div>
                {/* Icon dot */}
                <div
                  className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                  style={{ background: `${item.color}20`, borderColor: item.color }}
                >
                  <Icon size={14} style={{ color: item.color }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
