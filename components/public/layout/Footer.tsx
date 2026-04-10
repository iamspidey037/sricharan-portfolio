'use client';
// components/public/layout/Footer.tsx

import Link from 'next/link';
import { Github, Linkedin, Mail, Terminal, Heart } from 'lucide-react';

interface FooterProps {
  settings: Record<string, unknown> | null | undefined;
}

export default function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface py-12 px-4" role="contentinfo">
      <div className="max-w-content mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Terminal size={18} className="text-primary" />
              <span className="font-heading font-bold text-text-primary">Sri Charan</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              ECE Student · Embedded AI · Edge AI Developer.
              Building intelligence at the edge — one microcontroller at a time.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {['About', 'Skills', 'Projects', 'Certifications', 'Blog', 'Contact'].map(link => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-text-muted text-sm hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">Connect</h3>
            <div className="flex gap-3 mb-4">
              {[
                { href: 'https://github.com/sricharan', icon: Github, label: 'GitHub' },
                { href: 'https://linkedin.com/in/sricharan', icon: Linkedin, label: 'LinkedIn' },
                { href: 'mailto:sricharan@example.com', icon: Mail, label: 'Email' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center
                             text-text-muted hover:text-primary hover:border-primary transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <Link href="/links" className="text-text-muted text-sm hover:text-primary transition-colors">
              🔗 Link in Bio →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>
            © {year} Sri Charan. Designed & Built with{' '}
            <Heart size={10} className="inline text-error fill-error mx-0.5" />
            and too much ☕
          </p>
          <p className="flex items-center gap-1">
            <Terminal size={10} className="text-primary" />
            Next.js · TypeScript · MongoDB · Tailwind
          </p>
          <Link href="/admin/login" className="hover:text-primary transition-colors">
            Admin ⚙️
          </Link>
        </div>
      </div>
    </footer>
  );
}
