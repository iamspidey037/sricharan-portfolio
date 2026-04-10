// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  // Enable dark mode via class (we use .dark / .light on <html>)
  darkMode: 'class',

  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // ── Font Families (from CSS variables set by Next.js font loader) ──
      fontFamily: {
        heading: ['var(--font-heading)', 'Outfit', 'sans-serif'],
        body:    ['var(--font-body)', 'DM Sans', 'sans-serif'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },

      // ── Colors mapped to CSS variables ──
      colors: {
        primary:   'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent:    'var(--color-accent)',
        warning:   'var(--color-warning)',
        error:     'var(--color-error)',
        success:   'var(--color-success)',
        bg:        'var(--color-bg)',
        surface:   'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-3': 'var(--color-surface-3)',
        border:    'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':     'var(--color-text-muted)',
        'text-disabled':  'var(--color-text-disabled)',
      },

      // ── Border radius ──
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      // ── Box shadows with glow ──
      boxShadow: {
        'glow-primary':   'var(--glow-primary)',
        'glow-secondary': 'var(--glow-secondary)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.4), var(--glow-primary)',
      },

      // ── Background gradients ──
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--color-primary), #0099cc)',
        'gradient-hero':    'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0f1e35 100%)',
        'gradient-card':    'linear-gradient(135deg, var(--color-surface), var(--color-surface-2))',
      },

      // ── Animations ──
      animation: {
        'float':        'float 4s ease-in-out infinite',
        'pulse-border': 'pulse-border 2s infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'glow-pulse':   'glow-pulse 1.5s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'fade-in':      'fadeIn 0.5s ease-out',
        'slide-up':     'slideUp 0.5s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(0, 212, 255, 0.3)' },
          '50%': { borderColor: 'rgba(0, 212, 255, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.7), 0 0 40px rgba(0, 212, 255, 0.3)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // ── Screen breakpoints (same as Tailwind defaults, documented here) ──
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // ── Max width for content ──
      maxWidth: {
        'content': '1200px',
        'prose':   '65ch',
      },
    },
  },

  plugins: [],
};

export default config;
