'use client';
// app/admin/content/page.tsx
// Content manager — full tree view of all sections with CRUD operations

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronRight, ChevronDown, Edit, Trash2, Eye,
  EyeOff, Copy, GripVertical, FolderOpen, Folder,
  FileText, Globe, Lock, Link2, Search, RefreshCw,
  Star, Pin
} from 'lucide-react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────
interface TreeNode {
  _id: string;
  title: string;
  slug: string;
  type: string;
  visibility: 'public' | 'shared' | 'private';
  status: 'published' | 'draft' | 'archived' | 'trash';
  isPinned: boolean;
  isFeatured: boolean;
  icon?: string;
  order: number;
  children: TreeNode[];
}

// ── Visibility icon helper ───────────────────────────────────
function VisibilityIcon({ vis }: { vis: string }) {
  if (vis === 'public')  return <Globe  size={12} className="text-secondary" title="Public" />;
  if (vis === 'shared')  return <Link2  size={12} className="text-warning"   title="Shared" />;
  return                        <Lock   size={12} className="text-error"     title="Private" />;
}

// ── Status dot ───────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    published: 'bg-secondary', draft: 'bg-warning',
    archived: 'bg-text-muted', trash: 'bg-error',
  };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status] || 'bg-text-muted'}`}
      title={status}
    />
  );
}

// ── Tree node component (recursive) ─────────────────────────
function TreeNodeItem({
  node,
  depth = 0,
  onEdit,
  onDelete,
  onDuplicate,
  onVisibilityChange,
  refreshTree,
}: {
  node: TreeNode;
  depth?: number;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
  onVisibilityChange: (id: string, vis: string) => void;
  refreshTree: () => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const typeIcon = () => {
    if (node.type === 'folder') return hasChildren
      ? <FolderOpen size={14} className="text-warning" />
      : <Folder size={14} className="text-text-muted" />;
    return <FileText size={14} className="text-primary" />;
  };

  return (
    <div className="select-none">
      {/* Node row */}
      <div
        className={`group flex items-center gap-1 py-1.5 px-2 rounded-lg
                    hover:bg-surface-2 transition-colors cursor-pointer
                    ${depth > 0 ? 'ml-' + (depth * 4) : ''}`}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-4 h-4 flex items-center justify-center flex-shrink-0
                      text-text-muted hover:text-text-primary transition-colors
                      ${!hasChildren && 'invisible'}`}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          aria-expanded={expanded}
        >
          {expanded
            ? <ChevronDown size={12} />
            : <ChevronRight size={12} />
          }
        </button>

        {/* Icon */}
        <span className="flex-shrink-0">{typeIcon()}</span>
        {node.icon && <span className="text-xs flex-shrink-0">{node.icon}</span>}

        {/* Title */}
        <span className="flex-1 text-sm text-text-primary truncate min-w-0">
          {node.title}
        </span>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <StatusDot status={node.status} />
          <VisibilityIcon vis={node.visibility} />
          {node.isPinned && <Pin size={11} className="text-accent" />}
          {node.isFeatured && <Star size={11} className="text-warning" />}
        </div>

        {/* Actions (shown on hover) */}
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100
                        transition-opacity ml-1">
          <button
            onClick={() => onEdit(node._id)}
            className="w-6 h-6 rounded flex items-center justify-center text-text-muted
                       hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={() => onDuplicate(node._id)}
            className="w-6 h-6 rounded flex items-center justify-center text-text-muted
                       hover:text-secondary hover:bg-secondary/10 transition-colors"
            title="Duplicate"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={() => onDelete(node._id, node.title)}
            className="w-6 h-6 rounded flex items-center justify-center text-text-muted
                       hover:text-error hover:bg-error/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Children (recursive) */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <TreeNodeItem
                key={child._id}
                node={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onVisibilityChange={onVisibilityChange}
                refreshTree={refreshTree}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── New Section Modal ────────────────────────────────────────
function NewSectionModal({
  onClose,
  onCreated,
  parentId,
}: {
  onClose: () => void;
  onCreated: () => void;
  parentId?: string;
}) {
  const [form, setForm] = useState({
    title: '', type: 'item', visibility: 'private',
    status: 'draft', icon: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const TYPES = [
    { value: 'folder', label: '📁 Folder / Group' },
    { value: 'item', label: '📄 Item / Entry' },
    { value: 'page', label: '📃 Full Page' },
    { value: 'blog', label: '✍️ Blog Post' },
    { value: 'gallery', label: '🖼️ Gallery' },
    { value: 'timeline', label: '📅 Timeline' },
    { value: 'custom', label: '⚙️ Custom' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, parentSection: parentId || null }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-6 w-full max-w-md"
      >
        <h2 className="font-heading font-bold text-text-primary mb-4">
          {parentId ? 'Add Sub-Section' : 'New Section'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Emertxe Internship Projects"
              className="input-base"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className="input-base"
              >
                {TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Visibility</label>
              <select
                value={form.visibility}
                onChange={(e) => setForm(f => ({ ...f, visibility: e.target.value }))}
                className="input-base"
              >
                <option value="private">🔴 Private</option>
                <option value="shared">🟡 Shared</option>
                <option value="public">🟢 Public</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="input-base"
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
                <option value="archived">📦 Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="📁"
                className="input-base"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description (optional)"
              rows={2}
              className="input-base resize-none"
              maxLength={500}
            />
          </div>

          {error && (
            <p className="text-error text-sm bg-error/10 p-2 rounded-lg border border-error/20">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
              ) : (
                <><Plus size={15} /> Create</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteModal({
  title,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  onConfirm: (permanent: boolean) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-6 w-full max-w-sm text-center"
      >
        <Trash2 size={36} className="text-error mx-auto mb-3" />
        <h3 className="font-heading font-bold text-text-primary mb-1">Delete Section?</h3>
        <p className="text-text-secondary text-sm mb-6">
          &quot;<span className="font-medium">{title}</span>&quot; will be moved to trash.
          You can restore it within 30 days.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onConfirm(false)}
            disabled={loading}
            className="btn-secondary w-full justify-center border-error/50 text-error hover:bg-error/10"
          >
            {loading ? <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" /> : '🗑️ Move to Trash'}
          </button>
          <button
            onClick={() => onConfirm(true)}
            disabled={loading}
            className="text-xs text-text-muted hover:text-error transition-colors py-1"
          >
            Permanently delete (cannot be undone)
          </button>
          <button onClick={onCancel} className="btn-secondary w-full justify-center">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Content Manager Page ─────────────────────────────────
export default function ContentManagerPage() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sections');
      const data = await res.json();
      if (data.success) setTree(data.data);
    } catch {
      setError('Failed to load content tree');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  const handleEdit = (id: string) => {
    window.location.href = `/admin/content/${id}`;
  };

  const handleDelete = async (permanent: boolean) => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/admin/sections/${deleteTarget.id}?permanent=${permanent}`, {
        method: 'DELETE',
      });
      setDeleteTarget(null);
      fetchTree();
    } catch {
      setError('Failed to delete section');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await fetch(`/api/admin/sections/${id}/duplicate`, { method: 'POST' });
      fetchTree();
    } catch {
      setError('Failed to duplicate section');
    }
  };

  const handleVisibilityChange = async (id: string, visibility: string) => {
    try {
      await fetch(`/api/admin/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility }),
      });
      fetchTree();
    } catch {
      setError('Failed to update visibility');
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">Content Manager</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage all portfolio sections, folders, and pages</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTree}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center
                       text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary"
          >
            <Plus size={15} /> New Section
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-lg flex justify-between">
          {error}
          <button onClick={() => setError('')} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          placeholder="Search sections by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted px-1">
        <span className="flex items-center gap-1"><Globe size={11} className="text-secondary" /> Public</span>
        <span className="flex items-center gap-1"><Link2 size={11} className="text-warning" /> Shared</span>
        <span className="flex items-center gap-1"><Lock size={11} className="text-error" /> Private</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" /> Published</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" /> Draft</span>
        <span className="flex items-center gap-1"><Pin size={11} className="text-accent" /> Pinned</span>
      </div>

      {/* Tree view */}
      <div className="card p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-8 rounded" style={{ marginLeft: `${(i % 3) * 20}px` }} />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen size={40} className="text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-text-secondary font-medium">No sections yet</p>
            <p className="text-text-muted text-sm mt-1">Click &quot;New Section&quot; to create your first section.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary mt-4"
            >
              <Plus size={15} /> Create First Section
            </button>
          </div>
        ) : (
          <div>
            {tree
              .filter(node => !search || node.title.toLowerCase().includes(search.toLowerCase()))
              .map((node) => (
                <TreeNodeItem
                  key={node._id}
                  node={node}
                  onEdit={handleEdit}
                  onDelete={(id, title) => setDeleteTarget({ id, title })}
                  onDuplicate={handleDuplicate}
                  onVisibilityChange={handleVisibilityChange}
                  refreshTree={fetchTree}
                />
              ))
            }
          </div>
        )}
      </div>

      {/* Section count */}
      {!loading && tree.length > 0 && (
        <p className="text-xs text-text-muted text-right">
          {tree.length} top-level sections
        </p>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showNewModal && (
          <NewSectionModal
            onClose={() => setShowNewModal(false)}
            onCreated={fetchTree}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            title={deleteTarget.title}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
