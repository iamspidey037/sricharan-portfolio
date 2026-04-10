// app/layout.tsx
// Root layout — sets up fonts, theme CSS variables, providers, and global SEO

import type { Metadata, Viewport } from 'next';
import './globals.css';

// ── Google Fonts ─────────────────────────────────────────────
// Local font variables — no network needed
const outfit = { variable: '--font-heading' };
const dmSans = { variable: '--font-body' };
const jetbrainsMono = { variable: '--font-mono' };

// ── Site-wide SEO Metadata ───────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Sri Charan | ECE Student · Embedded AI · Edge AI',
    template: '%s | Sri Charan Portfolio',
  },
  description:
    'Personal portfolio of Sri Charan, Electronics & Communication Engineering student at KITS Karimnagar. Building intelligence at the edge — TinyML, ESP32, STM32, IoT, Edge AI projects.',
  keywords: [
    'Embedded AI', 'Edge AI', 'TinyML', 'ECE', 'ESP32', 'STM32',
    'IoT', 'Electronics', 'KITS Karimnagar', 'Embedded Systems',
    'Machine Learning', 'Arduino', 'FreeRTOS', 'Spidey AI Robot',
  ],
  authors: [{ name: 'Sri Charan' }],
  creator: 'Sri Charan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Sri Charan Portfolio',
    title: 'Sri Charan | ECE · Embedded AI · Edge AI Developer',
    description: 'Building intelligence at the edge. Projects in TinyML, ESP32, STM32, IoT, and more.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Sri Charan Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sri Charan | ECE · Embedded AI Developer',
    description: 'Building intelligence at the edge.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// ── Root Layout ──────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Default to dark theme; JS will toggle based on preference
      className="dark"
      suppressHydrationWarning
    >
      <head>
       
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('portfolio-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
                  document.documentElement.className = theme;
                } catch(e) {
                  document.documentElement.className = 'dark';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`
          ${outfit.variable}
          ${dmSans.variable}
          ${jetbrainsMono.variable}
          font-body antialiased
          bg-surface text-text-primary
          transition-colors duration-300
        `}
      >
        {children}
      </body>
    </html>
  );
}
