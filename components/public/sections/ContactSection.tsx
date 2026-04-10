'use client';
// components/public/sections/ContactSection.tsx
// Contact form with validation, honeypot spam protection, and toast feedback

import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Send, Mail, MapPin, Github, Linkedin, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'job_opportunity', label: '💼 Job / Internship Opportunity' },
  { value: 'collaboration', label: '🤝 Collaboration' },
  { value: 'question', label: '❓ Question' },
  { value: 'other', label: '💬 Other' },
];

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  honeypot: string; // Hidden field — spam trap
}

interface ContactProps {
  data: Record<string, unknown> | null | undefined;
  settings: Record<string, unknown> | null | undefined;
}

export default function ContactSection({ data, settings }: ContactProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', subject: '', message: '',
    category: 'other', honeypot: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', category: 'other', honeypot: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div ref={ref}>
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
        className="section-heading mb-10"
      >
        <h2 className="font-heading text-text-primary flex items-center gap-3">
          <span>📬</span> Get In Touch
        </h2>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* ── Left: info ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -30 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-text-secondary mb-8 leading-relaxed">
            I&apos;m always open to discussing embedded AI projects, internship opportunities,
            or just geeking out about hardware. Drop me a message! 🚀
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center">
                <Mail size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Email</p>
                <a href="mailto:sricharan@example.com" className="text-sm hover:text-primary transition-colors">
                  sricharan@example.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center">
                <MapPin size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Location</p>
                <p className="text-sm">Karimnagar, Telangana, India</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { href: 'https://github.com/sricharan', icon: Github, label: 'GitHub' },
              { href: 'https://linkedin.com/in/sricharan', icon: Linkedin, label: 'LinkedIn' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center
                           text-text-muted hover:text-primary hover:border-primary
                           transition-all hover:-translate-y-0.5"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          {/* Availability status */}
          <div className="mt-8 p-4 card">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              <span className="text-sm font-semibold text-secondary">Currently Available</span>
            </div>
            <p className="text-xs text-text-muted">
              Open to internship and research opportunities in Embedded AI / Edge AI
            </p>
          </div>
        </motion.div>

        {/* ── Right: form ── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : 30 }}
          transition={{ delay: 0.3 }}
        >
          {status === 'success' ? (
            <div className="card p-8 text-center">
              <CheckCircle size={48} className="text-secondary mx-auto mb-4" />
              <h3 className="font-heading font-bold text-text-primary mb-2">Message Sent! 🎉</h3>
              <p className="text-text-secondary text-sm mb-6">
                Thank you for reaching out. I&apos;ll get back to you as soon as possible!
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="btn-secondary text-sm"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
              {/* Honeypot — hidden from humans, caught by spam bots */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleChange}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Name + Email row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Name <span className="text-error">*</span>
                  </label>
                  <input
                    id="name" name="name" type="text"
                    value={formData.name} onChange={handleChange}
                    placeholder="Your name"
                    required maxLength={100}
                    className="input-base"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Email <span className="text-error">*</span>
                  </label>
                  <input
                    id="email" name="email" type="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="input-base"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Category
                </label>
                <select
                  id="category" name="category"
                  value={formData.category} onChange={handleChange}
                  className="input-base"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Subject <span className="text-error">*</span>
                </label>
                <input
                  id="subject" name="subject" type="text"
                  value={formData.subject} onChange={handleChange}
                  placeholder="What's it about?"
                  required maxLength={200}
                  className="input-base"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Message <span className="text-error">*</span>
                </label>
                <textarea
                  id="message" name="message"
                  value={formData.message} onChange={handleChange}
                  placeholder="Tell me what's on your mind..."
                  required maxLength={5000} rows={5}
                  className="input-base resize-none"
                />
                <p className="text-xs text-text-muted mt-1 text-right">
                  {formData.message.length}/5000
                </p>
              </div>

              {/* Error */}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/10 rounded-lg border border-error/30">
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
