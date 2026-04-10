// models/SiteSettings.ts
// Singleton document — only one settings document ever exists
import mongoose, { Schema, Document, Model } from 'mongoose';

const SiteSettingsSchema = new Schema({
  siteTitle: { type: String, default: 'Sri Charan | ECE & Embedded AI' },
  tagline: { type: String, default: 'Building Intelligence at the Edge' },
  faviconUrl: { type: String },
  defaultTheme: { type: String, enum: ['dark', 'light'], default: 'dark' },

  // Theme colors
  primaryColor: { type: String, default: '#00D4FF' },    // Electric blue
  secondaryColor: { type: String, default: '#00FF88' },  // Neon green
  accentColor: { type: String, default: '#FF6B35' },     // Orange accent

  // Background
  backgroundStyle: {
    type: String,
    enum: ['circuit', 'particles', 'matrix', 'solid'],
    default: 'circuit',
  },

  // Typography
  fontHeading: { type: String, default: 'Outfit' },
  fontBody: { type: String, default: 'DM Sans' },
  fontMono: { type: String, default: 'JetBrains Mono' },

  // Integrations
  googleAnalyticsId: { type: String },
  githubUsername: { type: String, default: 'sricharan' },

  // Status
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'Portfolio is under maintenance. Coming back soon! 🚀' },

  // SEO
  metaTitle: { type: String, default: 'Sri Charan — ECE Student | Embedded AI & Edge AI Developer' },
  metaDescription: {
    type: String,
    default: 'Personal portfolio of Sri Charan, ECE student at KITS Karimnagar. Projects in Embedded AI, TinyML, Edge AI, ESP32, STM32.',
  },
  metaKeywords: {
    type: String,
    default: 'Embedded AI, Edge AI, TinyML, ECE, ESP32, STM32, IoT, Electronics',
  },
  ogImageUrl: { type: String },

  // Email (SMTP for contact form)
  smtpHost: { type: String },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String },
  smtpPassEncrypted: { type: String, select: false },
  contactEmail: { type: String, default: 'sricharan@example.com' },
  autoReplyEnabled: { type: Boolean, default: true },

  // Custom code injection (use with care!)
  customCSS: { type: String },
  customJS: { type: String },

}, { timestamps: true });

export interface ISiteSettingsDocument extends Document {
  siteTitle: string; tagline: string; faviconUrl?: string;
  defaultTheme: 'dark' | 'light'; primaryColor: string;
  secondaryColor: string; accentColor: string;
  backgroundStyle: string; fontHeading: string; fontBody: string; fontMono: string;
  googleAnalyticsId?: string; githubUsername?: string;
  maintenanceMode: boolean; maintenanceMessage?: string;
  metaTitle?: string; metaDescription?: string; metaKeywords?: string; ogImageUrl?: string;
  smtpHost?: string; smtpPort?: number; smtpUser?: string;
  smtpPassEncrypted?: string; contactEmail: string; autoReplyEnabled: boolean;
  customCSS?: string; customJS?: string;
  createdAt: Date; updatedAt: Date;
}

const SiteSettings: Model<ISiteSettingsDocument> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
