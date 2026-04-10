// models/ContactMessage.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

const ContactMessageSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 5000 },
  category: {
    type: String,
    enum: ['job_opportunity', 'collaboration', 'question', 'other'],
    default: 'other',
  },
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  repliedAt: { type: Date },
  replyContent: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

ContactMessageSchema.index({ isRead: 1, createdAt: -1 });

export interface IContactMessageDocument extends Document {
  name: string; email: string; subject: string; message: string;
  category: string; isRead: boolean; isStarred: boolean; isArchived: boolean;
  repliedAt?: Date; replyContent?: string; ipAddress?: string; userAgent?: string;
  createdAt: Date; updatedAt: Date;
}

const ContactMessage: Model<IContactMessageDocument> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessageDocument>('ContactMessage', ContactMessageSchema);

export default ContactMessage;
