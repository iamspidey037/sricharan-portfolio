// models/ActivityLog.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

const ActivityLogSchema = new Schema({
  action: {
    type: String,
    enum: ['create', 'edit', 'delete', 'restore', 'reorder', 'login',
           'logout', 'upload', 'setting_change', 'visibility_change'],
    required: true,
  },
  targetType: {
    type: String,
    enum: ['section', 'file', 'message', 'setting', 'admin'],
    required: true,
  },
  targetId: { type: String },
  targetTitle: { type: String },
  details: { type: String },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

// Auto-expire logs after 90 days to save storage
ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export interface IActivityLogDocument extends Document {
  action: string; targetType: string; targetId?: string;
  targetTitle?: string; details?: string; ipAddress?: string; timestamp: Date;
}

const ActivityLog: Model<IActivityLogDocument> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLogDocument>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
