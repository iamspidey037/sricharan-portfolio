// types/admin.ts
// TypeScript interfaces for admin and API structures

export interface IAdmin {
  _id: string;
  username: string;
  passwordHash: string;
  email: string;
  displayName: string;
  profilePhotoUrl?: string;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  refreshTokens: RefreshTokenEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenEntry {
  token: string;        // Hashed refresh token
  createdAt: Date;
  expiresAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
  isRevoked: boolean;
}

export interface ISiteSettings {
  _id: string;
  siteTitle: string;
  tagline: string;
  faviconUrl?: string;
  defaultTheme: 'dark' | 'light';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundStyle: 'circuit' | 'particles' | 'matrix' | 'solid';
  fontHeading: string;
  fontBody: string;
  fontMono: string;
  googleAnalyticsId?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassEncrypted?: string;
  contactEmail: string;
  autoReplyEnabled: boolean;
  githubUsername?: string;
  customCSS?: string;
  customJS?: string;
  updatedAt: Date;
}

export interface IFile {
  _id: string;
  fileName: string;          // Sanitized storage name
  originalName: string;      // User's original filename
  fileType: string;          // Extension: jpg, pdf, c, etc.
  mimeType: string;
  fileSizeBytes: number;
  url: string;               // Public URL (Cloudinary or /api/files/{id})
  thumbnailUrl?: string;
  storageProvider: 'cloudinary' | 'local';
  cloudinaryPublicId?: string;
  parentSectionId?: string;
  visibility: 'public' | 'shared' | 'private';
  caption?: string;
  altText?: string;
  order: number;
  tags: string[];
  isOrphaned: boolean;       // Not linked to any section
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'job_opportunity' | 'collaboration' | 'question' | 'other';
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  repliedAt?: Date;
  replyContent?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IActivityLog {
  _id: string;
  action: 'create' | 'edit' | 'delete' | 'restore' | 'reorder' | 'login' |
          'logout' | 'upload' | 'setting_change' | 'visibility_change';
  targetType: 'section' | 'file' | 'message' | 'setting' | 'admin';
  targetId?: string;
  targetTitle?: string;
  details?: string;
  ipAddress?: string;
  timestamp: Date;
}

export interface IAnalytics {
  _id: string;
  pageViewed: string;        // URL path
  sectionId?: string;
  timestamp: Date;
  visitorIpHash: string;     // Hashed for privacy
  userAgent?: string;
  referrer?: string;
  country?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// JWT token payloads
export interface AccessTokenPayload {
  adminId: string;
  username: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  adminId: string;
  tokenId: string;   // Unique ID to find the stored token
  iat: number;
  exp: number;
}
