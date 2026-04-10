'use client';
// app/share/[token]/page.tsx
// Public page for secret shareable links — handles password protection

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, Calendar, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type Status = 'loading' | 'found' | 'password_required' | 'expired' | 'not_found' | 'error';

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>('loading');
  const [section, setSection] = useState<Record<string, unknown> | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetch(`/api/public/share/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSection(data.data);
          setStatus('found');
        } else if (data.code === 'PASSWORD_REQUIRED') {
          setStatus('password_required');
        } else if (data.code === 'EXPIRED') {
          setStatus('expired');
        } else {
          setStatus('not_found');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const verifyPassword = async () => {
    setVerifying(true);
    setPasswordError('');
    try {
      const res = await fetch(`/api/public/share/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setSection(data.data);
        setStatus('found');
      } else {
        setPasswordError(data.error || 'Incorrect password');
      }
    } catch {
      setPasswordError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-circuit flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not found / expired
  if (status === 'not_found' || status === 'expired' || status === 'error') {
    return (
      <div className="min-h-screen bg-circuit flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 max-w-md w-full text-center">
          <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
          <h1 className="font-heading font-bold text-xl text-text-primary mb-2">
            {status === 'expired' ? 'Link Expired' : 'Link Not Found'}
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            {status === 'expired'
              ? 'This shareable link has expired and is no longer valid.'
              : 'This link doesn\'t exist or has been revoked by the owner.'}
          </p>
          <Link href="/" className="btn-primary justify-center">
            <ArrowLeft size={15} /> Go to Portfolio
          </Link>
        </motion.div>
      </div>
    );
  }

  // Password required
  if (status === 'password_required') {
    return (
      <div className="min-h-screen bg-circuit flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-3">
              <Lock size={24} className="text-warning" />
            </div>
            <h1 className="font-heading font-bold text-xl text-text-primary">Password Protected</h1>
            <p className="text-text-muted text-sm mt-1">This content requires a password to view</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyPassword()}
              placeholder="Enter password..."
              className="input-base"
              autoFocus
            />
            {passwordError && (
              <p className="text-error text-sm flex items-center gap-1">
                <AlertTriangle size={13} /> {passwordError}
              </p>
            )}
            <button
              onClick={verifyPassword}
              disabled={verifying || !password}
              className="btn-primary w-full justify-center"
            >
              {verifying
                ? <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                : <CheckCircle size={15} />
              }
              {verifying ? 'Verifying...' : 'Access Content'}
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-text-muted hover:text-primary transition-colors">
              ← Back to Portfolio
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show content
  if (status === 'found' && section) {
    const sharedLink = section.sharedLink as Record<string, unknown> | undefined;

    return (
      <div className="min-h-screen bg-circuit">
        {/* Shared link header banner */}
        <div className="bg-surface border-b border-border px-4 py-2">
          <div className="max-w-content mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Eye size={12} className="text-primary" />
              Shared view · {sharedLink?.viewCount as number} view{(sharedLink?.viewCount as number) !== 1 ? 's' : ''}
              {sharedLink?.expiresAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  Expires {new Date(sharedLink.expiresAt as string).toLocaleDateString()}
                </span>
              )}
            </div>
            <Link href="/" className="text-xs text-primary hover:underline">
              View Full Portfolio →
            </Link>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-content mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Section header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{section.icon as string || '📄'}</span>
                <h1 className="font-heading font-black text-3xl text-text-primary">
                  {section.title as string}
                </h1>
              </div>
              {section.description && (
                <p className="text-text-secondary text-lg">{section.description as string}</p>
              )}
              {/* Tech stack */}
              {Array.isArray(section.techStack) && (section.techStack as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {(section.techStack as string[]).map(t => (
                    <span key={t} className="tech-chip">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Rich text content */}
            {section.content && (
              <div
                className="prose prose-invert max-w-none card p-8"
                dangerouslySetInnerHTML={{ __html: section.content as string }}
              />
            )}

            {/* External links */}
            {Array.isArray(section.externalLinks) && (section.externalLinks as Array<{label: string; url: string; type: string}>).length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {(section.externalLinks as Array<{label: string; url: string; type: string}>).map(link => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                    {link.label} →
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    );
  }

  return null;
}
