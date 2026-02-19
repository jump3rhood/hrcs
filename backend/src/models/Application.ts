import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'rejected'
  | 'invited'
  | 'interview_scheduled';

export interface IApplication extends Document {
  candidate: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  matchScore: number;
  adminNotes?: string;
}

const applicationSchema = new Schema<IApplication>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'invited', 'interview_scheduled'],
      default: 'applied',
    },
    matchScore: { type: Number, default: 0 },
    adminNotes: String,
  },
  { timestamps: true }
);

applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', applicationSchema);
