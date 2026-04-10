// models/File.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

const FileSchema = new Schema({
  fileName: { type: String, required: true, trim: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },        // Extension
  mimeType: { type: String, required: true },
  fileSizeBytes: { type: Number, required: true },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  storageProvider: { type: String, enum: ['cloudinary', 'local'], default: 'local' },
  cloudinaryPublicId: { type: String },
  parentSectionId: { type: Schema.Types.ObjectId, ref: 'Section', index: true },
  visibility: { type: String, enum: ['public', 'shared', 'private'], default: 'private' },
  caption: { type: String, maxlength: 500 },
  altText: { type: String, maxlength: 200 },
  order: { type: Number, default: 0 },
  tags: [{ type: String }],
  isOrphaned: { type: Boolean, default: false },
}, { timestamps: true });

FileSchema.index({ parentSectionId: 1 });
FileSchema.index({ visibility: 1 });
FileSchema.index({ fileType: 1 });

export interface IFileDocument extends Document {
  fileName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  storageProvider: string;
  cloudinaryPublicId?: string;
  parentSectionId?: mongoose.Types.ObjectId;
  visibility: 'public' | 'shared' | 'private';
  caption?: string;
  altText?: string;
  order: number;
  tags: string[];
  isOrphaned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileModel: Model<IFileDocument> =
  mongoose.models.File || mongoose.model<IFileDocument>('File', FileSchema);

export default FileModel;

// ═══════════════════════════════════════════════════════════
// models/ContactMessage.ts  (appended below for brevity)
// ═══════════════════════════════════════════════════════════
