import mongoose, { Document, Schema } from 'mongoose';

export interface IShortlistEntry {
  applicationId: mongoose.Types.ObjectId;
  rank: number;
  notes: string;
}

export interface IShortlist extends Document {
  jobId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  candidates: IShortlistEntry[];
}

const shortlistSchema = new Schema<IShortlist>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    candidates: [
      {
        applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
        rank: { type: Number, required: true },
        notes: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IShortlist>('Shortlist', shortlistSchema);
