'use client';
// app/admin/content/[id]/page.tsx
// Full section editor — rich text, visibility, custom fields, media, share links

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Save, ArrowLeft, Eye, Globe, Lock, Link2, Clock,
  Star, Pin, Tag, ExternalLink as ExtLink, Plus, Trash2,
  History, Share2, CheckCircle, AlertCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy-load the heavy rich text editor
const RichTextEditor = dynamic(
  () => import('@/components/admin/editors/RichTextEditor'),
  { ssr: false, loading: () => <div className="skeleton h-64 rounded-lg" /> }
);

const VISIBILITY_OPTIONS = [
  { value: 'private', label: '🔴 Private', desc: 'Only you (admin)', color: 'text-error' },
  { value: 'shared',  label: '🟡 Shared',  desc: 'Via secret link',  color: 'text-warning' },
  { value: 'public',  label: '🟢 Public',  desc: 'All visitors',    color: 'text-secondary' },
];

const STATUS_OPTIONS = [
  { value: 'draft',     label: '📝 Draft' },
  { value: 'published', label: '✅ Published' },
  { value: 'archived',  label: '📦 Archived' },
];

export default function SectionEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [section, setSection] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'meta' | 'links' | 'share'>('content');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local editable state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [status, setStatus] = useState('draft');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [projectStatus, setProjectStatus] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [externalLinks, setExternalLinks] = useState<Array<{ label: string; url: string; type: string }>>([]);
  const [shareLink, setShareLink] = useState<Record<string, unknown> | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  // Fetch section
  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/admin/sections/${id}`);
        const data = await res.json();
        if (data.success) {
          const s = data.data;
          setSection(s);
          setTitle(s.title || '');
          setDescription(s.description || '');
          setContent(s.content || '');
          setVisibility(s.visibility || 'private');
          setStatus(s.status || 'draft');
          setTags(s.tags || []);
          setTechStack(s.techStack || []);
          setIsPinned(s.isPinned || false);
          setIsFeatured(s.isFeatured || false);
          setProjectStatus(s.projectStatus || '');
          setMetaTitle(s.metaTitle || '');
          setMetaDesc(s.metaDescription || '');
          setExternalLinks(s.externalLinks || []);
          setShareLink(s.sharedLink || null);
        }
      } catch {
        setError('Failed to load section');
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [id]);

  // Auto-save on content change (debounced 30s)
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave(true);
    }, 30000);
  }, [content, title, description]); // eslint-disable-line

  useEffect(() => {
    if (section) scheduleAutoSave();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [content, title, description, scheduleAutoSave, section]);

  // Save section
  const handleSave = async (isAutoSave = false) => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        title, description, content, visibility, status, tags,
        techStack, isPinned, isFeatured, projectStatus,
        metaTitle, metaDescription: metaDesc, externalLinks,
      };
      const res = await fetch(`/api/admin/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (!isAutoSave) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Tag helpers
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const addTech = () => {
    const t = techInput.trim();
    if (t && !techStack.includes(t)) setTechStack([...techStack, t]);
    setTechInput('');
  };
  const removeTech = (t: string) => setTechStack(techStack.filter(x => x !== t));

  // Generate share link
  const generateShareLink = async () => {
    setShareLoading(true);
    try {
      const res = await fetch(`/api/admin/sections/${id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays: 30 }),
      });
      const data = await res.json();
      if (data.success) setShareLink(data.data);
    } catch {
      setError('Failed to generate share link');
    } finally {
      setShareLoading(false);
    }
  };

  const revokeShareLink = async () => {
    try {
      await fetch(`/api/admin/sections/${id}/share`, { method: 'DELETE' });
      setShareLink(null);
    } catch {
      setError('Failed to revoke share link');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="skeleton h-10 w-64 rounded" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  const TABS = [
    { id: 'content', label: 'Content' },
    { id: 'meta',    label: 'SEO & Meta' },
    { id: 'links',   label: 'Links' },
    { id: 'share',   label: 'Share Link' },
  ] as const;

  return (
    <div className="max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/content')}
          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center
                     text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          aria-label="Back to content manager"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-xl text-text-primary truncate">
            {title || 'Untitled Section'}
          </h1>
          <p className="text-text-muted text-xs mt-0.5 font-mono">
            {(section as Record<string, unknown>)?.type as string} · /{(section as Record<string, unknown>)?.slug as string}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-secondary text-sm"
            >
              <CheckCircle size={14} /> Saved
            </motion.span>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={15} />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ── Main editor (left 2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Section title"
              className="input-base text-lg font-heading"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description <span className="text-text-muted">(short, for cards)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief one-liner description..."
              rows={2}
              className="input-base resize-none"
              maxLength={500}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-border flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'content' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Content <span className="text-text-muted">(rich text)</span>
              </label>
              <div className="card overflow-hidden">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your content here..."
                />
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="space-y-4 card p-4">
              <h3 className="font-heading font-semibold text-text-primary">SEO Metadata</h3>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Meta Title <span className="text-text-muted text-xs">(60 chars max)</span>
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Leave blank to use section title"
                  className="input-base"
                  maxLength={60}
                />
                <p className="text-xs text-text-muted mt-1">{metaTitle.length}/60 chars</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Meta Description <span className="text-text-muted text-xs">(160 chars max)</span>
                </label>
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  rows={3}
                  className="input-base resize-none"
                  maxLength={160}
                />
                <p className="text-xs text-text-muted mt-1">{metaDesc.length}/160 chars</p>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4 card p-4">
              <h3 className="font-heading font-semibold text-text-primary">External Links</h3>
              {externalLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...externalLinks];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setExternalLinks(updated);
                    }}
                    placeholder="Label"
                    className="input-base col-span-2"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...externalLinks];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setExternalLinks(updated);
                    }}
                    placeholder="https://..."
                    className="input-base col-span-2"
                  />
                  <button
                    onClick={() => setExternalLinks(externalLinks.filter((_, j) => j !== i))}
                    className="w-9 h-9 rounded-lg border border-error/30 text-error hover:bg-error/10
                               flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setExternalLinks([...externalLinks, { label: '', url: '', type: 'custom' }])}
                className="btn-secondary text-sm"
              >
                <Plus size={14} /> Add Link
              </button>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="card p-4 space-y-4">
              <h3 className="font-heading font-semibold text-text-primary flex items-center gap-2">
                <Share2 size={16} className="text-primary" /> Shareable Secret Link
              </h3>
              <p className="text-text-secondary text-sm">
                Generate a secret link to share this section with specific people (e.g., recruiters)
                without making it fully public.
              </p>

              {shareLink ? (
                <div className="space-y-3">
                  <div className="bg-surface-2 border border-border rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1">Share URL</p>
                    <code className="text-sm text-primary break-all font-mono">
                      {`${process.env.NEXT_PUBLIC_BASE_URL || ''}/share/${(shareLink as Record<string, unknown>).token as string}`}
                    </code>
                  </div>
                  <div className="flex gap-2 text-xs text-text-muted">
                    <span>👁️ {(shareLink as Record<string, unknown>).viewCount as number} views</span>
                    {(shareLink as Record<string, unknown>).expiresAt && (
                      <span>⏰ Expires {new Date((shareLink as Record<string, unknown>).expiresAt as string).toLocaleDateString()}</span>
                    )}
                  </div>
                  <button onClick={revokeShareLink} className="btn-secondary text-sm border-error/50 text-error">
                    Revoke Link
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateShareLink}
                  disabled={shareLoading}
                  className="btn-primary"
                >
                  {shareLoading ? (
                    <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                  ) : (
                    <Share2 size={15} />
                  )}
                  Generate Share Link
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar (right 1/3) ── */}
        <div className="space-y-4">
          {/* Visibility */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Eye size={14} /> Visibility
            </h3>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="visibility"
                    value={opt.value}
                    checked={visibility === opt.value}
                    onChange={() => setVisibility(opt.value)}
                    className="accent-primary"
                  />
                  <div>
                    <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
                    <p className="text-xs text-text-muted">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-base"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Project Status (if applicable) */}
          {((section as Record<string, unknown>)?.type === 'item' || (section as Record<string, unknown>)?.type === 'folder') && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Project Status</h3>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                className="input-base"
              >
                <option value="">— None —</option>
                <option value="completed">✅ Completed</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="planned">📋 Planned</option>
                <option value="on_hold">⏸️ On Hold</option>
              </select>
            </div>
          )}

          {/* Flags */}
          <div className="card p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-sm text-text-secondary flex items-center gap-1">
                <Pin size={13} className="text-accent" /> Pin to top
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-sm text-text-secondary flex items-center gap-1">
                <Star size={13} className="text-warning" /> Featured on homepage
              </span>
            </label>
          </div>

          {/* Tech Stack */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Tag size={13} /> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {techStack.map(t => (
                <span key={t} className="tech-chip cursor-pointer" onClick={() => removeTech(t)}>
                  {t} ×
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                placeholder="ESP32, Python..."
                className="input-base text-xs flex-1"
              />
              <button onClick={addTech} className="btn-secondary px-2 py-1 text-xs">+</button>
            </div>
          </div>

          {/* Tags */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Tag size={13} /> Tags
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border
                             text-text-muted cursor-pointer hover:border-error hover:text-error transition-colors"
                  onClick={() => removeTag(t)}
                >
                  #{t} ×
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="tinyml, esp32..."
                className="input-base text-xs flex-1"
              />
              <button onClick={addTag} className="btn-secondary px-2 py-1 text-xs">+</button>
            </div>
          </div>

          {/* Timestamps */}
          {section && (
            <div className="card p-4 text-xs text-text-muted space-y-1">
              <div className="flex items-center gap-2">
                <Clock size={11} />
                Created: {new Date((section as Record<string, unknown>).createdAt as string).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={11} />
                Updated: {new Date((section as Record<string, unknown>).updatedAt as string).toLocaleDateString()}
              </div>
              {(section as Record<string, unknown>).lastAutoSaveAt && (
                <div className="flex items-center gap-2">
                  <History size={11} />
                  Auto-saved: {new Date((section as Record<string, unknown>).lastAutoSaveAt as string).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
