'use client';
// components/public/sections/HeroSection.tsx
// Hero section with typing animation, CTA buttons, social links, stats bar

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github, Linkedin, Mail, Youtube, Download,
  ArrowRight, Terminal, Cpu, Zap, CircuitBoard,
  Wifi, ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ── Typing animation hook ────────────────────────────────────
function useTypewriter(phrases: string[], speed = 60, pause = 2000) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex] || '';
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex <= currentPhrase.length) {
      setDisplayed(currentPhrase.slice(0, charIndex));
      if (charIndex === currentPhrase.length) {
        timeout = setTimeout(() => setIsDeleting(true), pause);
      } else {
        timeout = setTimeout(() => setCharIndex((c) => c + 1), speed);
      }
    } else if (isDeleting && charIndex >= 0) {
      setDisplayed(currentPhrase.slice(0, charIndex));
      if (charIndex === 0) {
        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      } else {
        timeout = setTimeout(() => setCharIndex((c) => c - 1), speed / 2);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, phrases, speed, pause]);

  // Reset char index when phrase changes
  useEffect(() => { setCharIndex(0); }, [phraseIndex]);

  return displayed;
}

// ── Counter animation hook ────────────────────────────────────
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
}

// ── Sample data (from DB or defaults) ───────────────────────
const DEFAULT_TAGLINES = [
  'Building Intelligence at the Edge',
  'Bridging Hardware and AI',
  'Embedded Systems × Machine Learning',
  'TinyML on STM32 & ESP32',
  'From Silicon to Smart Systems',
];

const DEFAULT_SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/sricharan', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/sricharan', icon: Linkedin },
  { label: 'Email', href: 'mailto:sricharan@example.com', icon: Mail },
];

// ── Component ────────────────────────────────────────────────
interface HeroProps {
  data: Record<string, unknown> | null | undefined;
  settings: Record<string, unknown> | null | undefined;
}

export default function HeroSection({ data, settings }: HeroProps) {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const taglines = (data?.content ? JSON.parse(data.content as string) : null)?.taglines
    || DEFAULT_TAGLINES;

  const typedText = useTypewriter(taglines);

  const projectCount = useCounter(15, 2000, statsVisible);
  const certCount = useCounter(12, 2000, statsVisible);
  const skillCount = useCounter(40, 2000, statsVisible);

  // Trigger counter animation when stats come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll to next section
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-20"
      aria-label="Hero section"
    >
      {/* ── Background: animated circuit nodes ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Radial gradient spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,0.08),transparent)]" />

        {/* Floating circuit elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            {i % 3 === 0 ? (
              <Cpu size={24} className="text-primary" />
            ) : i % 3 === 1 ? (
              <CircuitBoard size={20} className="text-secondary" />
            ) : (
              <Wifi size={18} className="text-primary" />
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-content mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: Text content ── */}
          <div className="order-2 lg:order-1">

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              <span className="text-sm font-mono text-text-secondary border border-border rounded-full px-3 py-1">
                🔬 Currently: ESP32 AI Voice Assistant
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-black mb-2"
            >
              <span className="text-text-primary">Sri</span>{' '}
              <span className="gradient-text">Charan</span>
            </motion.h1>

            {/* Role */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-secondary font-body text-lg mb-4 flex items-center gap-2"
            >
              <Terminal size={18} className="text-primary flex-shrink-0" />
              ECE Student · Embedded AI · Edge AI Developer
            </motion.p>

            {/* Typing animation tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl font-heading text-primary mb-8 h-9 flex items-center"
              aria-live="polite"
              aria-label={`Current focus: ${typedText}`}
            >
              <span>{typedText}</span>
              <span className="typing-cursor" aria-hidden="true" />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              <a
                href="/resume.pdf"
                download
                className="btn-primary"
                aria-label="Download Resume PDF"
              >
                <Download size={16} />
                Download Resume
              </a>
              <Link href="#projects" className="btn-secondary">
                View Projects
                <ArrowRight size={16} />
              </Link>
              <Link href="#contact" className="btn-secondary">
                Contact Me
              </Link>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-4"
            >
              {DEFAULT_SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center
                             text-text-muted hover:text-primary hover:border-primary
                             transition-all duration-200 hover:-translate-y-1"
                >
                  <Icon size={18} />
                </a>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Profile photo + floating badges ── */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
              className="relative"
            >
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl scale-110" />

              {/* Profile photo container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden
                              border-2 border-primary/30 glow-on-hover float-animation">
                <Image
                  src="/images/profile-photo.jpg"
                  alt="Sri Charan — ECE Student, Embedded AI Developer"
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    // Fallback to initials if no photo
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Fallback avatar */}
                <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-3
                                flex items-center justify-center text-6xl font-heading font-black
                                text-primary">
                  SC
                </div>
              </div>

              {/* Floating tech badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                className="absolute -top-4 -right-4 bg-surface-2 border border-border
                           rounded-xl px-3 py-2 text-xs font-mono text-secondary flex items-center gap-2"
              >
                <Zap size={12} /> TinyML
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-surface-2 border border-border
                           rounded-xl px-3 py-2 text-xs font-mono text-primary flex items-center gap-2"
              >
                <Cpu size={12} /> ESP32 · STM32
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute top-1/2 -left-12 bg-surface-2 border border-border
                           rounded-xl px-3 py-2 text-xs font-mono text-accent flex items-center gap-2"
              >
                <CircuitBoard size={12} /> Edge AI
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0"
        >
          {[
            { value: projectCount, label: 'Projects', suffix: '+' },
            { value: certCount, label: 'Certifications', suffix: '+' },
            { value: skillCount, label: 'Skills', suffix: '+' },
          ].map(({ value, label, suffix }) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-3xl font-heading font-black gradient-text">
                {value}{suffix}
              </div>
              <div className="text-xs text-text-muted mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted
                   hover:text-primary transition-colors cursor-pointer"
        aria-label="Scroll to About section"
      >
        <ChevronDown size={28} />
      </motion.button>
    </section>
  );
}
