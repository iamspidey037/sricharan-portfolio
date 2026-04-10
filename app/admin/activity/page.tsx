'use client';
// app/admin/activity/page.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Download } from 'lucide-react';

interface LogEntry {
  _id: string;
  action: string;
  targetType: string;
  targetTitle?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

const ACTION_ICONS: Record<string, string> = {
  create: '✅', edit: '✏️', delete: '🗑️', restore: '♻️',
  login: '🔐', logout: '🚪', upload: '📤', setting_change: '⚙️',
  visibility_change: '👁️', reorder: '↕️',
};
const ACTION_COLORS: Record<string, string> = {
  create: 'text-secondary', edit: 'text-primary', delete: 'text-error',
  restore: 'text-warning', login: 'text-secondary', logout: 'text-text-muted',
  upload: 'text-accent', setting_change: 'text-warning',
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 25;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/activity?page=${page}&limit=${LIMIT}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch {
      console.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page]); // eslint-disable-line

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Target Type', 'Target Title', 'Details', 'IP'];
    const rows = logs.map(l => [
      new Date(l.timestamp).toISOString(), l.action, l.targetType,
      l.targetTitle || '', l.details || '', l.ipAddress || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary flex items-center gap-2">
            <Activity size={22} className="text-primary" /> Activity Log
          </h1>
          <p className="text-text-muted text-sm mt-0.5">{total} total events · Auto-expires after 90 days</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary text-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={fetchLogs} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="card divide-y divide-border">
        {loading ? (
          [...Array(10)].map((_, i) => <div key={i} className="skeleton h-14 m-2 rounded" />)
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <Activity size={32} className="mx-auto mb-2 opacity-30" />
            <p>No activity logged yet</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-start gap-3 p-4"
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{ACTION_ICONS[log.action] || '📋'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold capitalize ${ACTION_COLORS[log.action] || 'text-text-primary'}`}>
                    {log.action.replace('_', ' ')}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted">
                    {log.targetType}
                  </span>
                  {log.targetTitle && (
                    <span className="text-sm text-text-secondary truncate">
                      &quot;{log.targetTitle}&quot;
                    </span>
                  )}
                </div>
                {log.details && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{log.details}</p>
                )}
                {log.ipAddress && (
                  <p className="text-xs text-text-disabled mt-0.5 font-mono">IP: {log.ipAddress}</p>
                )}
              </div>
              <time className="text-xs text-text-muted flex-shrink-0" dateTime={log.timestamp}>
                <span className="block">{new Date(log.timestamp).toLocaleDateString()}</span>
                <span className="block text-right font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </time>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Page {page} of {Math.ceil(total / LIMIT)}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)} className="btn-secondary text-sm px-3 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
