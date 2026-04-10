'use client';
// components/public/sections/SkillsSection.tsx
// Animated skill bars with category tabs and scroll-triggered animation

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, Brain, Radio, Wrench, CircuitBoard, Server, Users } from 'lucide-react';

// ── Sample data — replaced by DB data in production ─────────
const DEFAULT_SKILLS = [
  {
    name: 'Programming Languages',
    icon: Code2,
    color: '#00D4FF',
    skills: [
      { name: 'C / Embedded C', proficiency: 92 },
      { name: 'Python', proficiency: 85 },
      { name: 'C++', proficiency: 78 },
      { name: 'MATLAB', proficiency: 65 },
      { name: 'TypeScript/JS', proficiency: 72 },
    ],
  },
  {
    name: 'Embedded Platforms',
    icon: Cpu,
    color: '#00FF88',
    skills: [
      { name: 'ESP32 / ESP8266', proficiency: 90 },
      { name: 'STM32', proficiency: 82 },
      { name: 'Arduino', proficiency: 95 },
      { name: 'Raspberry Pi', proficiency: 75 },
      { name: 'NVIDIA Jetson', proficiency: 60 },
    ],
  },
  {
    name: 'AI/ML Frameworks',
    icon: Brain,
    color: '#FF6B35',
    skills: [
      { name: 'TensorFlow Lite', proficiency: 80 },
      { name: 'Edge Impulse', proficiency: 88 },
      { name: 'OpenCV', proficiency: 75 },
      { name: 'PyTorch Mobile', proficiency: 60 },
      { name: 'ONNX Runtime', proficiency: 55 },
    ],
  },
  {
    name: 'Protocols & Comms',
    icon: Radio,
    color: '#FFD60A',
    skills: [
      { name: 'I2C / SPI / UART', proficiency: 90 },
      { name: 'MQTT / WiFi', proficiency: 85 },
      { name: 'BLE / Bluetooth', proficiency: 78 },
      { name: 'LoRa', proficiency: 65 },
      { name: 'CAN Bus', proficiency: 55 },
    ],
  },
  {
    name: 'Tools & IDEs',
    icon: Wrench,
    color: '#00D4FF',
    skills: [
      { name: 'VS Code / PlatformIO', proficiency: 92 },
      { name: 'STM32CubeIDE', proficiency: 80 },
      { name: 'Keil MDK', proficiency: 72 },
      { name: 'Git / GitHub', proficiency: 85 },
      { name: 'Docker', proficiency: 60 },
    ],
  },
  {
    name: 'Hardware Skills',
    icon: CircuitBoard,
    color: '#00FF88',
    skills: [
      { name: 'PCB Design (KiCad)', proficiency: 70 },
      { name: 'Oscilloscope / Logic Analyzer', proficiency: 85 },
      { name: 'Soldering & Prototyping', proficiency: 90 },
      { name: '3D Printing', proficiency: 65 },
      { name: 'Multimeter / DMM', proficiency: 95 },
    ],
  },
  {
    name: 'RTOS & OS',
    icon: Server,
    color: '#FF6B35',
    skills: [
      { name: 'FreeRTOS', proficiency: 78 },
      { name: 'Embedded Linux', proficiency: 65 },
      { name: 'Zephyr RTOS', proficiency: 50 },
      { name: 'Linux (Ubuntu)', proficiency: 80 },
    ],
  },
  {
    name: 'Soft Skills',
    icon: Users,
    color: '#FFD60A',
    skills: [
      { name: 'Technical Writing', proficiency: 82 },
      { name: 'Problem Solving', proficiency: 90 },
      { name: 'Teamwork', proficiency: 88 },
      { name: 'Communication', proficiency: 80 },
    ],
  },
];

// ── Animated progress bar component ─────────────────────────
function SkillBar({
  name,
  proficiency,
  color,
  visible,
  delay,
}: {
  name: string;
  proficiency: number;
  color: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-text-primary">{name}</span>
        <span className="text-xs font-mono" style={{ color }}>
          {proficiency}%
        </span>
      </div>
      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}bb, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: visible ? `${proficiency}%` : 0 }}
          transition={{ duration: 1.2, delay, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
interface SkillsProps {
  data: Record<string, unknown> | null | undefined;
}

export default function SkillsSection({ data }: SkillsProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const categories =
    (data?.skillCategories as typeof DEFAULT_SKILLS) || DEFAULT_SKILLS;

  // Trigger animations when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const current = categories[activeCategory];
  const IconComponent = DEFAULT_SKILLS[activeCategory]?.icon || Code2;

  return (
    <div ref={sectionRef}>
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
        className="section-heading mb-10"
      >
        <h2 className="font-heading text-text-primary flex items-center gap-3">
          <span className="text-primary">🛠️</span> Skills & Expertise
        </h2>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Category tabs (left) ── */}
        <div className="lg:col-span-1">
          <div className="space-y-1">
            {categories.map((cat, i) => {
              const CatIcon = DEFAULT_SKILLS[i]?.icon || Code2;
              const catColor = DEFAULT_SKILLS[i]?.color || '#00D4FF';
              return (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -20 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setActiveCategory(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                              transition-all duration-200 ${
                                activeCategory === i
                                  ? 'bg-surface-2 border border-border-hover'
                                  : 'hover:bg-surface-2 border border-transparent'
                              }`}
                  aria-current={activeCategory === i ? 'true' : 'false'}
                >
                  <CatIcon
                    size={18}
                    style={{ color: activeCategory === i ? catColor : 'var(--color-text-muted)' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: activeCategory === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                  >
                    {cat.name}
                  </span>
                  <span
                    className="ml-auto text-xs font-mono"
                    style={{ color: activeCategory === i ? catColor : 'var(--color-text-muted)' }}
                  >
                    {cat.skills.length}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Skill bars (right) ── */}
        <div className="lg:col-span-2">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-6"
          >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${DEFAULT_SKILLS[activeCategory]?.color || '#00D4FF'}20` }}
              >
                <IconComponent
                  size={20}
                  style={{ color: DEFAULT_SKILLS[activeCategory]?.color || '#00D4FF' }}
                />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-text-primary">
                  {current?.name}
                </h3>
                <p className="text-xs text-text-muted">
                  {current?.skills?.length} skills
                </p>
              </div>
            </div>

            {/* Skill bars */}
            <div>
              {current?.skills?.map((skill, i) => (
                <SkillBar
                  key={skill.name}
                  name={skill.name}
                  proficiency={skill.proficiency}
                  color={DEFAULT_SKILLS[activeCategory]?.color || '#00D4FF'}
                  visible={visible}
                  delay={i * 0.08}
                />
              ))}
            </div>

            {/* Proficiency legend */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-text-muted">
              {[
                { range: '90–100%', label: 'Expert' },
                { range: '70–89%', label: 'Proficient' },
                { range: '50–69%', label: 'Familiar' },
              ].map(({ range, label }) => (
                <span key={label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary opacity-70" />
                  {range}: {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
