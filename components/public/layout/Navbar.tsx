'use client';
// components/public/layout/Navbar.tsx
// Sticky navbar: hides on scroll down, shows on scroll up, highlights active section

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Terminal } from 'lucide-react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '#about',          label: 'About' },
  { href: '#skills',         label: 'Skills' },
  { href: '#edge-ai',        label: 'Edge AI' },
  { href: '#projects',       label: 'Projects' },
  { href: '#internships',    label: 'Internships' },
  { href: '#certifications', label: 'Certs' },
  { href: '#blog',           label: 'Blog' },
  { href: '#contact',        label: 'Contact' },
];

// Section IDs for active highlighting
const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

interface NavbarProps {
  settings: Record<string, unknown> | null | undefined;
}

export default function Navbar({ settings }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const [isDark, setIsDark] = useState(true);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('portfolio-theme');
    setIsDark(stored !== 'light');
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.className = next;
    localStorage.setItem('portfolio-theme', next);
    setIsDark(!isDark);
  };

  // Hide/show navbar on scroll
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setIsScrolled(currentY > 60);
    // Hide when scrolling down past 100px, show when scrolling up
    if (currentY > lastScrollY && currentY > 100) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    setLastScrollY(currentY);
  }, [lastScrollY]);

  // Active section detection via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const siteTitle = (settings?.siteTitle as string) || 'Sri Charan';

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: isHidden ? -80 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-md border-b border-border shadow-lg'
            : 'border-b border-transparent'
        }`}
        style={{ background: isScrolled ? 'var(--navbar-bg)' : 'transparent' }}
        role="banner"
      >
        <div className="max-w-content mx-auto px-4">
          <nav
            className="flex items-center justify-between h-16"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-text-primary hover:text-primary
                         transition-colors font-heading font-bold"
              aria-label="Go to homepage"
            >
              <Terminal size={20} className="text-primary" />
              <span className="text-sm">
                {siteTitle.split('|')[0].trim()}
              </span>
              <span className="hidden sm:inline text-text-muted font-normal text-xs">
                / ECE · Edge AI
              </span>
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden lg:flex items-center gap-1" role="list">
              {NAV_LINKS.map(({ href, label }) => {
                const sectionId = href.slice(1);
                const isActive = activeSection === sectionId;
                return (
                  <li key={href}>
                    <a
                      href={href}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                        ${isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                        }`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center
                           text-text-muted hover:text-primary hover:border-primary transition-all"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Admin link (subtle) */}
              <Link
                href="/admin/login"
                className="hidden sm:flex items-center text-xs text-text-disabled hover:text-text-muted
                           transition-colors px-2 py-1 rounded"
                aria-label="Admin panel"
              >
                ⚙️
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center
                           text-text-secondary hover:text-primary hover:border-primary transition-all"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-40 w-72 bg-surface border-l border-border
                       shadow-2xl flex flex-col pt-20 px-6 pb-8"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <ul className="flex flex-col gap-1 flex-1" role="list">
              {NAV_LINKS.map(({ href, label }) => {
                const sectionId = href.slice(1);
                const isActive = activeSection === sectionId;
                return (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-primary/10 text-primary border-l-2 border-primary pl-3'
                          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                        }`}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Theme toggle in mobile menu */}
            <button
              onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text-secondary
                         hover:bg-surface-2 transition-colors mt-4"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
