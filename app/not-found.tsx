// app/not-found.tsx
import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-circuit flex items-center justify-center text-center p-8">
      <div>
        <div className="text-8xl font-heading font-black gradient-text mb-4">404</div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-3">Lost in the circuit?</h1>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let me help you navigate back.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary">🏠 Go Home</Link>
          <Link href="/#projects" className="btn-secondary">📂 View Projects</Link>
          <Link href="/#contact" className="btn-secondary">📬 Contact Me</Link>
        </div>
        <p className="text-text-muted text-xs mt-8 font-mono">
          ERROR: 0x404 — PAGE_NOT_FOUND at address /unknown
        </p>
      </div>
    </div>
  );
}
