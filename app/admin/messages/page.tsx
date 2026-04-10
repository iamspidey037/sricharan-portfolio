'use client';
// app/admin/messages/page.tsx
// Contact messages inbox with read/unread, star, archive, and reply

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MailOpen, Star, Archive, Trash2, Reply,
  Search, RefreshCw, Filter, CheckSquare, Square
} from 'lucide-react';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  job_opportunity: '💼 Job/Internship',
  collaboration: '🤝 Collaboration',
  question: '❓ Question',
  other: '💬 Other',
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data.success) setMessages(data.data || []);
    } catch {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const updateMessage = async (id: string, updates: Partial<Message>) => {
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      setMessages(prev => prev.map(m => m._id === id ? { ...m, ...updates } : m));
      if (selected?._id === id) setSelected(prev => prev ? { ...prev, ...updates } : null);
    } catch {
      console.error('Failed to update message');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch {
      console.error('Failed to delete message');
    }
  };

  const openMessage = (msg: Message) => {
    setSelected(msg);
    setReplyText('');
    if (!msg.isRead) updateMessage(msg._id, { isRead: true });
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      await fetch(`/api/admin/messages/${selected._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyContent: replyText }),
      });
      updateMessage(selected._id, { repliedAt: new Date().toISOString() } as Partial<Message>);
      setReplyText('');
      alert('Reply sent successfully!');
    } catch {
      alert('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const filtered = messages.filter(m => {
    if (m.isArchived && filter !== 'all') return false;
    if (filter === 'unread' && m.isRead) return false;
    if (filter === 'starred' && !m.isStarred) return false;
    if (search && !m.subject.toLowerCase().includes(search.toLowerCase()) &&
        !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead && !m.isArchived).length;

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary flex items-center gap-2">
            Messages
            {unreadCount > 0 && (
              <span className="bg-error text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Contact form submissions from your portfolio</p>
        </div>
        <button onClick={fetchMessages} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors" title="Refresh">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 h-[calc(100vh-200px)]">
        {/* ── Message list (left) ── */}
        <div className="lg:col-span-2 flex flex-col gap-3 overflow-hidden">
          {/* Search + filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="input-base pl-9"
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'unread', 'starred'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors
                    ${filter === f ? 'bg-primary text-surface' : 'border border-border text-text-secondary hover:border-primary'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Mail size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : (
              filtered.map(msg => (
                <button
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left p-3 rounded-lg border transition-all
                    ${selected?._id === msg._id ? 'border-primary bg-primary/5' : 'border-border hover:border-border-hover hover:bg-surface-2'}
                    ${!msg.isRead ? 'border-l-2 border-l-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-sm font-medium truncate ${!msg.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {msg.name}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {msg.isStarred && <Star size={11} className="text-warning fill-warning" />}
                      {!msg.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{msg.subject}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-text-muted">{CATEGORY_LABELS[msg.category] || msg.category}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Message detail (right) ── */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="card h-full flex flex-col overflow-hidden">
              {/* Message header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-bold text-text-primary">{selected.subject}</h3>
                    <p className="text-sm text-text-secondary mt-0.5">
                      From: <span className="font-medium">{selected.name}</span>
                      {' '}(<a href={`mailto:${selected.email}`} className="text-primary">{selected.email}</a>)
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(selected.createdAt).toLocaleString()} · {CATEGORY_LABELS[selected.category]}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => updateMessage(selected._id, { isStarred: !selected.isStarred })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                        ${selected.isStarred ? 'text-warning' : 'text-text-muted hover:text-warning'}`}
                      title={selected.isStarred ? 'Unstar' : 'Star'}
                    >
                      <Star size={15} className={selected.isStarred ? 'fill-warning' : ''} />
                    </button>
                    <button
                      onClick={() => updateMessage(selected._id, { isArchived: !selected.isArchived })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                      title="Archive"
                    >
                      <Archive size={15} />
                    </button>
                    <button
                      onClick={() => deleteMessage(selected._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-error transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-surface-2 rounded-lg p-4">
                  <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>
              </div>

              {/* Reply area */}
              <div className="p-4 border-t border-border">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Reply to {selected.name}
                </label>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Hi ${selected.name.split(' ')[0]},\n\nThank you for reaching out...`}
                  rows={4}
                  className="input-base resize-none w-full mb-2"
                />
                <button
                  onClick={sendReply}
                  disabled={replying || !replyText.trim()}
                  className="btn-primary"
                >
                  {replying ? (
                    <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                  ) : (
                    <Reply size={15} />
                  )}
                  {replying ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center">
                <MailOpen size={48} className="text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-secondary font-medium">Select a message to read</p>
                <p className="text-text-muted text-sm mt-1">
                  {messages.length > 0
                    ? `${messages.length} total · ${unreadCount} unread`
                    : 'No messages yet'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
