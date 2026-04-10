'use client';
// app/admin/login/page.tsx
// Admin login page — JWT auth with "Remember Me" and rate limit feedback

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Terminal, Lock, User, AlertCircle, Cpu, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/admin/dashboard';
  const wasExpired = searchParams.get('expired') === '1';

  const [form, setForm] = useState({ username: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [setupNeeded, setSetupNeeded] = useState(false);

  // Check if initial setup is needed
  useEffect(() => {
    fetch('/api/auth/setup')
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.setupNeeded) setSetupNeeded(true);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      setStatus('success');
      // Short delay so user sees success state
      setTimeout(() => router.push(returnTo), 800);

    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  if (setupNeeded) {
    return (
      <div className="min-h-screen bg-circuit flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 w-full max-w-md text-center"
        >
          <Terminal size={40} className="text-primary mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl mb-2">First-Time Setup Required</h2>
          <p className="text-text-secondary text-sm mb-6">
            No admin account found. Please complete setup to secure your portfolio.
          </p>
          <Link href="/admin/setup" className="btn-primary justify-center w-full">
            Begin Setup →
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-circuit flex items-center justify-center px-4">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,212,255,0.05),transparent)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
          >
            <Terminal size={28} className="text-primary" />
          </motion.div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">Admin Panel</h1>
          <p className="text-text-muted text-sm mt-1">Sri Charan Portfolio CMS</p>
        </div>

        {/* Session expired notice */}
        {wasExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-warning text-sm p-3 mb-4 bg-warning/10 rounded-lg border border-warning/30"
          >
            <AlertCircle size={15} />
            Your session expired. Please log in again.
          </motion.div>
        )}

        {/* Card */}
        <div className="card p-8">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle size={48} className="text-secondary mx-auto mb-3" />
              <p className="font-heading font-semibold text-text-primary">Logged in successfully!</p>
              <p className="text-text-muted text-sm mt-1">Redirecting to dashboard...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="admin"
                    required
                    autoComplete="username"
                    autoFocus
                    className="input-base pl-10"
                    aria-describedby={status === 'error' ? 'login-error' : undefined}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="input-base pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted
                               hover:text-text-secondary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 mb-6">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border bg-surface-2 text-primary accent-primary cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-text-secondary cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>

              {/* Error */}
              {status === 'error' && (
                <motion.div
                  id="login-error"
                  role="alert"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-error text-sm p-3 mb-4 bg-error/10 rounded-lg border border-error/30"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading' || !form.username || !form.password}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-disabled mt-6">
          <Cpu size={11} className="inline mr-1" />
          Portfolio CMS · Protected by JWT + bcrypt
        </p>
        <div className="text-center mt-2">
          <Link href="/" className="text-xs text-text-muted hover:text-primary transition-colors">
            ← Back to Portfolio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
