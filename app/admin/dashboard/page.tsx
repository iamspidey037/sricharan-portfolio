'use client';
// app/admin/dashboard/page.tsx
// Admin dashboard — stats, quick actions, recent activity

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderTree, FileText, MessageSquare, Eye,
  Plus, Edit, Upload, Inbox, AlertTriangle,
  CheckCircle, TrendingUp, Activity
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalSections: number;
  publishedSections: number;
  draftSections: number;
  totalFiles: number;
  storageMB: number;
  unreadMessages: number;
  totalPageViews: number;
  lastUpdated: string;
}

interface ActivityEntry {
  action: string;
  targetTitle: string;
  targetType: string;
  timestamp: string;
  details?: string;
}

const ACTION_ICONS: Record<string, string> = {
  create: '✅', edit: '✏️', delete: '🗑️', upload: '📤',
  login: '🔐', logout: '🚪', setting_change: '⚙️', visibility_change: '👁️',
};

const QUICK_ACTIONS = [
  { label: 'Add New Section', href: '/admin/content?action=new', icon: Plus, color: '#00D4FF' },
  { label: 'Edit About Me', href: '/admin/content?type=about', icon: Edit, color: '#00FF88' },
  { label: 'Upload Files', href: '/admin/files?action=upload', icon: Upload, color: '#FF6B35' },
  { label: 'View Messages', href: '/admin/messages', icon: Inbox, color: '#FFD60A' },
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="card p-5 flex items-start gap-4 h-full">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-heading font-black text-text-primary">{value}</div>
        <div className="text-sm text-text-secondary">{label}</div>
        {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block hover:no-underline">{inner}</Link>;
  }
  return inner;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/admin/analytics?type=stats'),
          fetch('/api/admin/activity?limit=8'),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data);
        }
        if (activityRes.ok) {
          const data = await activityRes.json();
          setActivity(data.data || []);
        }
      } catch {
        // Use placeholder data on error
        setStats({
          totalSections: 0, publishedSections: 0, draftSections: 0,
          totalFiles: 0, storageMB: 0, unreadMessages: 0,
          totalPageViews: 0, lastUpdated: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading font-bold text-2xl text-text-primary">
          Dashboard 👋
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={FolderTree} label="Total Sections"
          value={stats?.totalSections ?? 0}
          sub={`${stats?.publishedSections ?? 0} published · ${stats?.draftSections ?? 0} drafts`}
          color="#00D4FF" href="/admin/content"
        />
        <StatCard
          icon={FileText} label="Files Uploaded"
          value={stats?.totalFiles ?? 0}
          sub={`${stats?.storageMB ?? 0} MB used`}
          color="#00FF88" href="/admin/files"
        />
        <StatCard
          icon={MessageSquare} label="Messages"
          value={stats?.unreadMessages ?? 0}
          sub="unread"
          color={stats?.unreadMessages ? '#FF6B35' : '#00FF88'}
          href="/admin/messages"
        />
        <StatCard
          icon={Eye} label="Page Views"
          value={stats?.totalPageViews?.toLocaleString() ?? 0}
          sub="all time"
          color="#FFD60A" href="/admin/analytics"
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="card p-4 flex flex-col items-center gap-2 text-center hover:no-underline group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${color}18` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-text-primary flex items-center gap-2">
            <Activity size={18} className="text-secondary" /> Recent Activity
          </h2>
          <Link href="/admin/activity" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </div>

        {activity.length === 0 ? (
          <div className="card p-8 text-center">
            <CheckCircle size={32} className="text-secondary mx-auto mb-2" />
            <p className="text-text-muted text-sm">No recent activity yet.</p>
            <p className="text-text-disabled text-xs mt-1">Start adding content to see activity here.</p>
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {activity.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {ACTION_ICONS[entry.action] || '📋'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium capitalize">{entry.action}</span>
                    {' '}
                    <span className="text-text-secondary truncate">{entry.targetTitle}</span>
                  </p>
                  {entry.details && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">{entry.details}</p>
                  )}
                </div>
                <time
                  className="text-xs text-text-muted flex-shrink-0"
                  dateTime={entry.timestamp}
                >
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Portfolio health check */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-5"
      >
        <h2 className="font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-warning" /> Portfolio Health
        </h2>
        <div className="space-y-2">
          {[
            { label: 'All critical sections present', ok: true },
            { label: 'Profile photo uploaded', ok: false },
            { label: 'Resume PDF linked', ok: false },
            { label: 'Contact email configured', ok: true },
            { label: 'SEO metadata set', ok: false },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              {ok
                ? <CheckCircle size={14} className="text-secondary flex-shrink-0" />
                : <AlertTriangle size={14} className="text-warning flex-shrink-0" />
              }
              <span className={ok ? 'text-text-secondary' : 'text-warning'}>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
