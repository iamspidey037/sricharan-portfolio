'use client';
// app/admin/files/page.tsx
// File manager with upload, preview, filter, and bulk operations

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Search, Grid3X3, List, Trash2, Download,
  Eye, FileText, Image as ImageIcon, Video, Code2,
  Archive, Music, RefreshCw, Filter, X, Check
} from 'lucide-react';
import Image from 'next/image';

interface FileRecord {
  _id: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  visibility: string;
  caption?: string;
  createdAt: string;
  storageProvider: string;
}

// ── File type icon helper ────────────────────────────────────
function FileIcon({ mimeType, size = 20 }: { mimeType: string; size?: number }) {
  if (mimeType.startsWith('image/'))  return <ImageIcon size={size} className="text-primary" />;
  if (mimeType.startsWith('video/'))  return <Video size={size} className="text-accent" />;
  if (mimeType.startsWith('audio/'))  return <Music size={size} className="text-warning" />;
  if (mimeType === 'application/pdf') return <FileText size={size} className="text-error" />;
  if (mimeType.startsWith('text/') || mimeType.includes('script') || mimeType.includes('json'))
    return <Code2 size={size} className="text-secondary" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar'))
    return <Archive size={size} className="text-text-muted" />;
  return <FileText size={size} className="text-text-muted" />;
}

// ── Format file size ─────────────────────────────────────────
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Upload zone component ────────────────────────────────────
function UploadZone({ onUpload }: { onUpload: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onUpload(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
        ${dragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-surface-2'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) onUpload(files);
          e.target.value = '';
        }}
      />
      <Upload size={32} className={`mx-auto mb-3 ${dragging ? 'text-primary' : 'text-text-muted'}`} />
      <p className="text-text-secondary font-medium">
        {dragging ? 'Drop files here' : 'Drag & drop files, or click to browse'}
      </p>
      <p className="text-text-muted text-xs mt-1">
        Images, PDFs, code files, videos, archives — max 50MB each
      </p>
    </div>
  );
}

// ── File card ────────────────────────────────────────────────
function FileCard({
  file,
  selected,
  viewMode,
  onSelect,
  onDelete,
  onPreview,
}: {
  file: FileRecord;
  selected: boolean;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const isImage = file.mimeType.startsWith('image/');

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-surface-2
        ${selected ? 'border-primary bg-primary/5' : 'border-border'}`}
      >
        <button onClick={onSelect} className="flex-shrink-0">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
            ${selected ? 'bg-primary border-primary' : 'border-border hover:border-primary'}`}>
            {selected && <Check size={11} className="text-surface" />}
          </div>
        </button>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          {isImage && file.thumbnailUrl ? (
            <Image src={file.thumbnailUrl} alt={file.originalName} width={32} height={32} className="rounded object-cover w-8 h-8" />
          ) : (
            <FileIcon mimeType={file.mimeType} size={18} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary truncate">{file.originalName}</p>
          <p className="text-xs text-text-muted">{formatSize(file.fileSizeBytes)} · {file.fileType.toUpperCase()}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          file.visibility === 'public' ? 'badge-public' :
          file.visibility === 'shared' ? 'badge-shared' : 'badge-private'
        }`}>
          {file.visibility}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onPreview} className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-primary transition-colors" title="Preview">
            <Eye size={14} />
          </button>
          <a href={file.url} download={file.originalName} className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-secondary transition-colors" title="Download">
            <Download size={14} />
          </a>
          <button onClick={onDelete} className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-error transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden group cursor-pointer transition-all
      ${selected ? 'ring-2 ring-primary' : ''}`}
    >
      {/* Thumbnail */}
      <div
        onClick={onPreview}
        className="relative h-36 bg-surface-2 flex items-center justify-center overflow-hidden"
      >
        {isImage ? (
          <Image
            src={file.url}
            alt={file.originalName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <FileIcon mimeType={file.mimeType} size={40} />
        )}
        {/* Select overlay */}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-all
            ${selected ? 'bg-primary border-primary opacity-100' : 'bg-surface/80 border-border opacity-0 group-hover:opacity-100'}`}
        >
          {selected && <Check size={12} className="text-surface" />}
        </button>
        {/* Visibility */}
        <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded font-mono
          ${file.visibility === 'public' ? 'bg-secondary/20 text-secondary' :
            file.visibility === 'shared' ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'}`}>
          {file.visibility[0].toUpperCase()}
        </span>
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-text-primary font-medium truncate">{file.originalName}</p>
        <p className="text-xs text-text-muted mt-0.5">{formatSize(file.fileSizeBytes)}</p>
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onPreview} className="flex-1 text-xs py-1 rounded border border-border text-text-muted hover:text-primary hover:border-primary transition-colors">Preview</button>
          <button onClick={onDelete} className="w-6 h-6 rounded border border-error/30 text-error flex items-center justify-center hover:bg-error/10 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview modal ────────────────────────────────────────────
function PreviewModal({ file, onClose }: { file: FileRecord; onClose: () => void }) {
  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');
  const isPDF = file.mimeType === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-surface border border-border rounded-xl overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <p className="font-medium text-text-primary text-sm truncate max-w-xs">{file.originalName}</p>
            <p className="text-xs text-text-muted">{formatSize(file.fileSizeBytes)} · {file.mimeType}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={file.url} download={file.originalName} className="btn-secondary text-xs px-3 py-1.5">
              <Download size={13} /> Download
            </a>
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-surface-2">
          {isImage ? (
            <Image src={file.url} alt={file.originalName} width={800} height={600} className="max-w-full max-h-full object-contain rounded-lg" />
          ) : isVideo ? (
            <video controls className="max-w-full max-h-full rounded-lg">
              <source src={file.url} type={file.mimeType} />
            </video>
          ) : isPDF ? (
            <iframe src={file.url} className="w-full h-96 rounded-lg" title={file.originalName} />
          ) : (
            <div className="text-center p-8">
              <FileIcon mimeType={file.mimeType} size={48} />
              <p className="text-text-secondary mt-3">{file.originalName}</p>
              <p className="text-text-muted text-sm mt-1">Preview not available for this file type</p>
              <a href={file.url} download={file.originalName} className="btn-primary mt-4 inline-flex">
                <Download size={15} /> Download File
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ totalMB: string }>({ totalMB: '0' });
  const [page, setPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '48' });
      if (filterType !== 'all') params.set('fileType', filterType);
      const res = await fetch(`/api/admin/files?${params}`);
      const data = await res.json();
      if (data.success) {
        setFiles(data.data || []);
        setTotalFiles(data.pagination?.total || 0);
        setStorageInfo({ totalMB: data.storageStats?.totalMB || '0' });
      }
    } catch {
      console.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (filesToUpload: File[]) => {
    setUploading(true);
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visibility', 'private');
      try {
        setUploadProgress(p => ({ ...p, [file.name]: 0 }));
        const res = await fetch('/api/admin/files', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setUploadProgress(p => ({ ...p, [file.name]: 100 }));
          setFiles(prev => [data.data, ...prev]);
          setTotalFiles(t => t + 1);
        }
      } catch {
        console.error(`Failed to upload ${file.name}`);
      }
    }
    setTimeout(() => {
      setUploadProgress({});
      setUploading(false);
    }, 1500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return;
    try {
      await fetch(`/api/admin/files/${id}`, { method: 'DELETE' });
      setFiles(prev => prev.filter(f => f._id !== id));
      setTotalFiles(t => t - 1);
      setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch {
      alert('Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected files permanently?`)) return;
    for (const id of selectedIds) await handleDelete(id);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const filtered = files.filter(f => {
    if (!search) return true;
    return f.originalName.toLowerCase().includes(search.toLowerCase());
  });

  const FILE_TYPES = [
    { value: 'all',    label: 'All Files' },
    { value: 'jpg',    label: '🖼️ Images' },
    { value: 'pdf',    label: '📄 PDFs' },
    { value: 'c',      label: '💻 Code' },
    { value: 'mp4',    label: '🎬 Videos' },
    { value: 'zip',    label: '📦 Archives' },
  ];

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">File Manager</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {totalFiles} files · {storageInfo.totalMB} MB used
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} className="btn-secondary text-sm border-error/50 text-error hover:bg-error/10">
              <Trash2 size={14} /> Delete {selectedIds.size} selected
            </button>
          )}
          <button onClick={fetchFiles} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-surface' : 'text-text-muted hover:text-text-primary'}`} aria-label="Grid view"><Grid3X3 size={16} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-surface' : 'text-text-muted hover:text-text-primary'}`} aria-label="List view"><List size={16} /></button>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <UploadZone onUpload={handleUpload} />

      {/* Upload progress */}
      <AnimatePresence>
        {Object.entries(uploadProgress).map(([name, progress]) => (
          <motion.div key={name} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg border border-border">
            <div className="flex-1">
              <p className="text-sm text-text-primary truncate max-w-xs">{name}</p>
              <div className="h-1 bg-surface-3 rounded-full mt-1 overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-xs font-mono text-primary">{progress === 100 ? '✓ Done' : `${progress}%`}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="input-base pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {FILE_TYPES.map(t => (
            <button key={t.value} onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filterType === t.value ? 'bg-primary text-surface' : 'border border-border text-text-secondary hover:border-primary'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Files grid/list */}
      {loading ? (
        <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1'}`}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`skeleton rounded-lg ${viewMode === 'grid' ? 'h-40' : 'h-14'}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <Upload size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-text-secondary font-medium">No files yet</p>
          <p className="text-text-muted text-sm mt-1">Upload files using the zone above</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3'
          : 'space-y-2'
        }>
          {filtered.map(file => (
            <FileCard
              key={file._id}
              file={file}
              selected={selectedIds.has(file._id)}
              viewMode={viewMode}
              onSelect={() => toggleSelect(file._id)}
              onDelete={() => handleDelete(file._id)}
              onPreview={() => setPreviewFile(file)}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {previewFile && (
          <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
