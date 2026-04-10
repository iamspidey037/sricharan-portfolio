// models/Admin.ts
// Mongoose schema for the admin user — includes security features like
// failed login tracking, account lockout, and refresh token storage

import mongoose, { Schema, Document, Model } from 'mongoose';

// Refresh token subdocument schema
const RefreshTokenSchema = new Schema({
  token: { type: String, required: true },      // Hashed token stored here
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  deviceInfo: { type: String },
  ipAddress: { type: String },
  isRevoked: { type: Boolean, default: false },
}, { _id: false });

// Main admin schema
const AdminSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
  },

  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false,   // Never returned in queries by default — must explicitly .select('+passwordHash')
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },

  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters'],
    default: 'Sri Charan',
  },

  profilePhotoUrl: { type: String },

  // Login tracking for security monitoring
  lastLoginAt: { type: Date },
  lastLoginIP: { type: String },

  // Rate limiting: track failed login attempts
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },               // Account locked until this time

  // 2FA (optional)
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: {
    type: String,
    select: false,    // Extra sensitive — never exposed
  },

  // Stored refresh tokens (hashed) — allows multiple devices
  refreshTokens: [RefreshTokenSchema],

}, {
  timestamps: true,  // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
});

// Indexes for performance
AdminSchema.index({ username: 1 });
AdminSchema.index({ email: 1 });

// Virtual: is the account currently locked?
AdminSchema.virtual('isLocked').get(function() {
  return !!(this.lockedUntil && this.lockedUntil > new Date());
});

// Method: Increment failed login and potentially lock account
AdminSchema.methods.incrementFailedLogin = async function() {
  this.failedLoginAttempts += 1;

  // Lock for 15 minutes after 5 failed attempts
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    console.warn(`[Auth] Admin account locked for 15 minutes due to failed attempts`);
  }

  await this.save();
};

// Method: Reset failed login counter after successful login
AdminSchema.methods.resetFailedLogin = async function() {
  this.failedLoginAttempts = 0;
  this.lockedUntil = undefined;
  await this.save();
};

// Method: Clean up expired/revoked refresh tokens (housekeeping)
AdminSchema.methods.cleanRefreshTokens = async function() {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(
    (token: { expiresAt: Date; isRevoked: boolean }) =>
      token.expiresAt > now && !token.isRevoked
  );
  await this.save();
};

export interface IAdminDocument extends Document {
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
  refreshTokens: Array<{
    token: string;
    createdAt: Date;
    expiresAt: Date;
    deviceInfo?: string;
    ipAddress?: string;
    isRevoked: boolean;
  }>;
  isLocked: boolean;  // Virtual
  createdAt: Date;
  updatedAt: Date;
  // Methods
  incrementFailedLogin(): Promise<void>;
  resetFailedLogin(): Promise<void>;
  cleanRefreshTokens(): Promise<void>;
}

// Prevent model re-compilation in Next.js hot reload
const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);

export default Admin;
