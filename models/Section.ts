// models/Section.ts
// The CORE model — a recursive section/folder system supporting infinite nesting.
// Every piece of content (projects, blogs, certifications, etc.) is a Section.

import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────── Subdocument schemas ───────────

const CustomFieldSchema = new Schema({
  fieldName: { type: String, required: true, trim: true },
  fieldType: {
    type: String,
    enum: ['text', 'number', 'date', 'url', 'file', 'tags', 'richtext', 'dropdown', 'checkbox'],
    default: 'text',
  },
  fieldValue: { type: Schema.Types.Mixed },
  isRequired: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { _id: true });

const TeamMemberSchema = new Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, trim: true },
  linkedinUrl: { type: String },
}, { _id: false });

const ExternalLinkSchema = new Schema({
  label: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['github', 'demo', 'youtube', 'paper', 'custom'], default: 'custom' },
  icon: { type: String },
}, { _id: false });

const AIMetricsSchema = new Schema({
  modelName: { type: String },
  accuracy: { type: Number, min: 0, max: 100 },
  precision: { type: Number, min: 0, max: 100 },
  recall: { type: Number, min: 0, max: 100 },
  f1Score: { type: Number, min: 0, max: 100 },
  modelSizeKB: { type: Number },
  inferenceTimeMs: { type: Number },
  targetHardware: { type: String },
  framework: { type: String },
  optimizationNotes: { type: String },
}, { _id: false });

const SkillEntrySchema = new Schema({
  name: { type: String, required: true, trim: true },
  proficiency: { type: Number, min: 0, max: 100, default: 0 },
  icon: { type: String },
  order: { type: Number, default: 0 },
}, { _id: true });

const SkillCategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  icon: { type: String },
  skills: [SkillEntrySchema],
  order: { type: Number, default: 0 },
}, { _id: true });

const EducationEntrySchema = new Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, trim: true },
  branch: { type: String, trim: true },
  startYear: { type: Number },
  endYear: { type: Number },
  cgpa: { type: String },
  percentage: { type: String },
  coursework: [{ type: String }],
  logoUrl: { type: String },
  transcriptUrl: { type: String },   // Should be PRIVATE
  order: { type: Number, default: 0 },
}, { _id: true });

const SharedLinkSchema = new Schema({
  token: { type: String, required: true, unique: true },
  password: { type: String },           // bcrypt-hashed if set
  expiresAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const VersionEntrySchema = new Schema({
  versionNumber: { type: Number, required: true },
  content: { type: String },            // HTML snapshot
  savedAt: { type: Date, default: Date.now },
  note: { type: String },
}, { _id: false });

// ─────────── Main Section Schema ───────────

const SectionSchema = new Schema({
  // Identity
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  type: {
    type: String,
    enum: ['folder', 'item', 'page', 'gallery', 'timeline', 'list',
           'hero', 'about', 'skills', 'projects', 'internships',
           'certifications', 'blog', 'contact', 'custom'],
    required: true,
    default: 'item',
  },

  // Content
  description: { type: String, maxlength: 500 },
  content: { type: String },             // Rich text HTML

  // ── Hierarchy ──
  // Self-referential: null means top-level section
  parentSection: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    default: null,
    index: true,
  },
  order: { type: Number, default: 0, index: true },
  depth: { type: Number, default: 0 },   // 0 = top-level, computed on save

  // ── Display ──
  icon: { type: String },                // Emoji or icon class
  coverImageUrl: { type: String },
  accentColor: { type: String },

  // ── Visibility & State ──
  visibility: {
    type: String,
    enum: ['public', 'shared', 'private'],
    default: 'private',                   // Default to PRIVATE — you choose to publish
    index: true,
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived', 'trash'],
    default: 'draft',
    index: true,
  },
  isPinned: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },    // Show on homepage
  publishedAt: { type: Date },
  deletedAt: { type: Date },             // Soft delete timestamp

  // ── Shared Link ──
  sharedLink: SharedLinkSchema,

  // ── Custom Fields (dynamic) ──
  customFields: [CustomFieldSchema],

  // ── Project-specific fields ──
  projectStatus: {
    type: String,
    enum: ['completed', 'in_progress', 'planned', 'on_hold'],
  },
  techStack: [{ type: String }],
  hardwareComponents: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  teamMembers: [TeamMemberSchema],
  externalLinks: [ExternalLinkSchema],
  aiMetrics: AIMetricsSchema,
  keyLearnings: [{ type: String }],
  challenges: { type: String },
  results: { type: String },
  problemStatement: { type: String },

  // ── Skills-specific ──
  skillCategories: [SkillCategorySchema],

  // ── Education-specific ──
  educationEntries: [EducationEntrySchema],

  // ── Tags & SEO ──
  tags: [{ type: String, trim: true }],
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  metaKeywords: [{ type: String }],
  ogImageUrl: { type: String },

  // ── Version History ──
  versions: {
    type: [VersionEntrySchema],
    validate: {
      // Keep only the last 20 versions
      validator: (v: unknown[]) => v.length <= 20,
      message: 'Maximum 20 versions allowed',
    },
    default: [],
  },
  currentVersion: { type: Number, default: 1 },
  lastAutoSaveAt: { type: Date },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─────────── Indexes ───────────
SectionSchema.index({ slug: 1, parentSection: 1 }, { unique: true });
SectionSchema.index({ status: 1, visibility: 1 });
SectionSchema.index({ 'sharedLink.token': 1 }, { sparse: true });
SectionSchema.index({ tags: 1 });
SectionSchema.index({ isFeatured: 1, status: 1 });

// Full-text search index on title, description, and tags
SectionSchema.index(
  { title: 'text', description: 'text', tags: 'text', content: 'text' },
  { weights: { title: 10, tags: 5, description: 3, content: 1 } }
);

// ─────────── Virtuals ───────────

// Virtual: URL path for public display
SectionSchema.virtual('publicUrl').get(function() {
  if (this.type === 'blog') return `/blog/${this.slug}`;
  if (this.type === 'projects' || this.type === 'item') return `/projects/${this.slug}`;
  return `/${this.slug}`;
});

// ─────────── Pre-save hooks ───────────

// Auto-compute depth based on parent
SectionSchema.pre('save', async function(next) {
  if (this.isModified('parentSection')) {
    if (!this.parentSection) {
      this.depth = 0;
    } else {
      // Find parent depth and add 1
      const parent = await SectionModel.findById(this.parentSection).select('depth');
      this.depth = parent ? (parent.depth || 0) + 1 : 1;
    }
  }

  // Auto-set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Trim versions array to last 20
  if (this.versions && this.versions.length > 20) {
    this.versions = this.versions.slice(-20);
  }

  next();
});

// ─────────── Document interface ───────────

export interface ISectionDocument extends Document {
  title: string;
  slug: string;
  type: string;
  description?: string;
  content?: string;
  parentSection?: mongoose.Types.ObjectId | null;
  order: number;
  depth: number;
  icon?: string;
  coverImageUrl?: string;
  accentColor?: string;
  visibility: 'public' | 'shared' | 'private';
  status: 'published' | 'draft' | 'archived' | 'trash';
  isPinned: boolean;
  isFeatured: boolean;
  publishedAt?: Date;
  deletedAt?: Date;
  sharedLink?: {
    token: string;
    password?: string;
    expiresAt?: Date;
    viewCount: number;
    lastAccessedAt?: Date;
    createdAt: Date;
  };
  customFields: unknown[];
  projectStatus?: string;
  techStack?: string[];
  hardwareComponents?: string[];
  startDate?: Date;
  endDate?: Date;
  teamMembers?: unknown[];
  externalLinks?: unknown[];
  aiMetrics?: unknown;
  keyLearnings?: string[];
  challenges?: string;
  results?: string;
  problemStatement?: string;
  skillCategories?: unknown[];
  educationEntries?: unknown[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImageUrl?: string;
  versions?: unknown[];
  currentVersion?: number;
  lastAutoSaveAt?: Date;
  publicUrl: string;  // Virtual
  createdAt: Date;
  updatedAt: Date;
}

// Prevent re-compile on hot reload
const SectionModel: Model<ISectionDocument> =
  mongoose.models.Section || mongoose.model<ISectionDocument>('Section', SectionSchema);

export default SectionModel;
