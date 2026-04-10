// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

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
  ],
  authors: [{ name: 'Sri Charan' }],
  creator: 'Sri Charan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Sri Charan Portfolio',
    title: 'Sri Charan | ECE · Embedded AI · Edge AI Developer',
    description: 'Building intelligence at the edge.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Sri Charan Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sri Charan | ECE · Embedded AI Developer',
    description: 'Building intelligence at the edge.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* System fonts — no Google Fonts download needed */}
        <style>{`
          :root {
            --font-heading: 'Segoe UI', system-ui, -apple-system, sans-serif;
            --font-body: 'Segoe UI', system-ui, -apple-system, sans-serif;
            --font-mono: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
          }
        `}</style>
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
      <body className="font-body antialiased bg-surface text-text-primary transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
