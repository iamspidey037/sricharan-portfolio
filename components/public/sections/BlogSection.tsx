// components/public/sections/BlogSection.tsx
'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PenLine, Clock, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Props { data: Record<string, unknown> | null | undefined; }

const POSTS = [
  { slug: 'spidey-ai-robot-build', title: 'Building Spidey: An AI Voice Robot on ESP32', date: 'Dec 2024', readTime: '8 min', tags: ['ESP32', 'AI', 'Voice'], excerpt: 'How I built a conversational AI robot using ESP32, Groq Whisper, LLaMA, and PlayAI TTS — from hardware to Flask server pipeline.' },
  { slug: 'tinyml-esp32-edge-impulse', title: 'TinyML on ESP32 with Edge Impulse', date: 'Nov 2024', readTime: '6 min', tags: ['TinyML', 'ESP32', 'Edge Impulse'], excerpt: 'Step-by-step guide to training a TFLite model on Edge Impulse and deploying it on ESP32 for real-time sensor classification.' },
  { slug: 'freertos-vs-baremetal', title: 'FreeRTOS vs Bare-Metal: When to Use Which?', date: 'Oct 2024', readTime: '5 min', tags: ['FreeRTOS', 'STM32', 'RTOS'], excerpt: 'A practical comparison of FreeRTOS multi-tasking vs bare-metal programming for STM32 embedded applications.' },
];

export default function BlogSection({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }} className="section-heading">
        <h2 className="font-heading text-text-primary flex items-center gap-3"><span>✍️</span> Blog</h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {POSTS.map((post, i) => (
          <motion.article key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }} transition={{ delay: i * 0.08 }} className="card p-5 flex flex-col">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
              <Clock size={11} /> {post.readTime} read
              <span className="ml-auto">{post.date}</span>
            </div>
            <h3 className="font-heading font-bold text-text-primary mb-2 line-clamp-2 hover:text-primary transition-colors">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="text-text-secondary text-sm line-clamp-3 flex-1 mb-3">{post.excerpt}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map(t => <span key={t} className="text-xs tech-chip">{t}</span>)}
            </div>
            <Link href={`/blog/${post.slug}`} className="text-primary text-sm hover:underline flex items-center gap-1">
              Read more <ArrowRight size={13} />
            </Link>
          </motion.article>
        ))}
      </div>
      <div className="text-center">
        <Link href="/blog" className="btn-secondary">View All Posts →</Link>
      </div>
    </div>
  );
}
