// types/section.ts
// TypeScript interfaces for the recursive Section system

export type VisibilityLevel = 'public' | 'shared' | 'private';
export type SectionStatus = 'published' | 'draft' | 'archived' | 'trash';
export type SectionType =
  | 'folder'
  | 'item'
  | 'page'
  | 'gallery'
  | 'timeline'
  | 'list'
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'internships'
  | 'certifications'
  | 'blog'
  | 'contact'
  | 'custom';

export type ProjectStatus = 'completed' | 'in_progress' | 'planned' | 'on_hold';

// Custom field definition for dynamic fields
export interface CustomField {
  _id?: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'url' | 'file' | 'tags' | 'richtext' | 'dropdown' | 'checkbox';
  fieldValue: unknown;
  isRequired: boolean;
  isPublic: boolean;
  order: number;
}

// Team member for collaborative projects
export interface TeamMember {
  name: string;
  role: string;
  linkedinUrl?: string;
}

// External link (GitHub, Demo, etc.)
export interface ExternalLink {
  label: string;
  url: string;
  type: 'github' | 'demo' | 'youtube' | 'paper' | 'custom';
  icon?: string;
}

// AI/ML metrics for TinyML/Edge AI projects
export interface AIMetrics {
  modelName: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  modelSizeKB?: number;
  inferenceTimeMs?: number;
  targetHardware?: string;
  framework?: string;
  optimizationNotes?: string;
}

// Skill entry within a category
export interface SkillEntry {
  _id?: string;
  name: string;
  proficiency: number; // 0–100
  icon?: string;       // SVG or URL
  order: number;
}

// Skill category (Programming, Embedded, AI/ML, etc.)
export interface SkillCategory {
  _id?: string;
  name: string;
  icon?: string;
  skills: SkillEntry[];
  order: number;
}

// Shareable secret link config
export interface SharedLink {
  token: string;
  password?: string;        // Hashed if set
  expiresAt?: Date;
  viewCount: number;
  lastAccessedAt?: Date;
  createdAt: Date;
}

// Version history entry for auto-save
export interface VersionEntry {
  versionNumber: number;
  content: string;          // Snapshot of rich text content
  savedAt: Date;
  note?: string;
}

// Education entry
export interface EducationEntry {
  institution: string;
  degree: string;
  branch: string;
  startYear: number;
  endYear?: number;
  cgpa?: string;
  percentage?: string;
  coursework?: string[];
  logoUrl?: string;
  transcriptUrl?: string;   // Private
  order: number;
}

// The main Section document (recursive via parentSection)
export interface ISection {
  _id: string;
  title: string;
  slug: string;
  type: SectionType;
  description?: string;
  content?: string;          // Rich text HTML/JSON

  // Hierarchy
  parentSection?: string | null;  // null = top-level
  order: number;
  depth: number;             // Computed: 0 for top-level

  // Display
  icon?: string;             // Emoji or icon name
  coverImageUrl?: string;
  accentColor?: string;

  // Visibility & Status
  visibility: VisibilityLevel;
  status: SectionStatus;
  isPinned: boolean;
  isFeatured: boolean;        // Show on homepage

  // Shareable link
  sharedLink?: SharedLink;

  // Dynamic custom fields
  customFields: CustomField[];

  // Project-specific fields
  projectStatus?: ProjectStatus;
  techStack?: string[];
  hardwareComponents?: string[];
  startDate?: Date;
  endDate?: Date;
  teamMembers?: TeamMember[];
  externalLinks?: ExternalLink[];
  aiMetrics?: AIMetrics;
  keyLearnings?: string[];
  challenges?: string;
  results?: string;
  problemStatement?: string;

  // Skill-specific
  skillCategories?: SkillCategory[];

  // Education-specific
  educationEntries?: EducationEntry[];

  // Tags & SEO
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImageUrl?: string;

  // Version history
  versions?: VersionEntry[];
  currentVersion?: number;
  lastAutoSaveAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;          // Soft delete timestamp
  publishedAt?: Date;
}

// Simplified section for tree view
export interface SectionTreeNode {
  _id: string;
  title: string;
  slug: string;
  type: SectionType;
  visibility: VisibilityLevel;
  status: SectionStatus;
  isPinned: boolean;
  isFeatured: boolean;
  order: number;
  icon?: string;
  children: SectionTreeNode[];
}
