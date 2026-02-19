import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  jobId?: mongoose.Types.ObjectId;
  candidateId?: mongoose.Types.ObjectId;
  matchScore?: number;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate' },
    matchScore: Number,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
