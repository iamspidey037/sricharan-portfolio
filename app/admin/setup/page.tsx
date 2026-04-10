'use client';
// app/admin/setup/page.tsx
// First-time setup wizard — creates admin account

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), label: 'One special character' },
];

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', email: '', displayName: 'Sri Charan', siteTitle: 'Sri Charan | ECE & Embedded AI' });
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const passwordStrength = PASSWORD_RULES.filter(r => r.test(form.password)).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (passwordStrength < 5) { setError('Password does not meet all requirements'); return; }
    setStatus('loading'); setError('');
    try {
      const res = await fetch('/api/auth/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStatus('success');
      setTimeout(() => router.push('/admin/login'), 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Setup failed');
    }
  };

  const strengthColors = ['bg-error', 'bg-error', 'bg-warning', 'bg-warning', 'bg-secondary'];

  return (
    <div className="min-h-screen bg-circuit flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Terminal size={28} className="text-primary" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">Setup Your Portfolio</h1>
          <p className="text-text-muted text-sm mt-1">Create your admin account to get started</p>
        </div>
        <div className="card p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-secondary mx-auto mb-3" />
              <h2 className="font-heading font-bold text-xl text-text-primary">Setup Complete! 🎉</h2>
              <p className="text-text-secondary mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Username *</label>
                  <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))} placeholder="sricharan" required pattern="[a-z0-9_]{3,30}" className="input-base" />
                  <p className="text-xs text-text-muted mt-0.5">Lowercase, numbers, underscores</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Display Name *</label>
                  <input type="text" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} required className="input-base" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" required className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Password *</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="input-base pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-surface-3'}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-0.5">
                      {PASSWORD_RULES.map(rule => (
                        <p key={rule.label} className={`text-xs flex items-center gap-1 ${rule.test(form.password) ? 'text-secondary' : 'text-text-muted'}`}>
                          <span>{rule.test(form.password) ? '✓' : '○'}</span> {rule.label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required className={`input-base ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-error' : ''}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Site Title</label>
                <input type="text" value={form.siteTitle} onChange={e => setForm(f => ({ ...f, siteTitle: e.target.value }))} className="input-base" />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/10 rounded-lg border border-error/30">
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              <button type="submit" disabled={status === 'loading' || passwordStrength < 5} className="btn-primary w-full justify-center disabled:opacity-50">
                {status === 'loading' ? <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" /> : null}
                {status === 'loading' ? 'Creating...' : '🚀 Create Admin Account'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
