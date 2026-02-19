import mongoose, { Document, Schema } from 'mongoose';

export type JobStatus = 'draft' | 'published' | 'paused' | 'closed';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type WorkMode = 'onsite' | 'remote' | 'hybrid';

export interface IJobSkill {
  skillName: string;
  required: boolean;
}

export interface IJob extends Document {
  employer: mongoose.Types.ObjectId;
  title: string;
  description: string;
  responsibilities: string;
  jobType: JobType;
  workMode: WorkMode;
  location: string;
  experienceMin: number;
  experienceMax: number;
  skills: IJobSkill[];
  status: JobStatus;
}

const jobSchema = new Schema<IJob>(
  {
    employer: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    responsibilities: { type: String, default: '' },
    jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], required: true },
    workMode: { type: String, enum: ['onsite', 'remote', 'hybrid'], required: true },
    location: { type: String, default: '' },
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 10 },
    skills: [
      {
        skillName: { type: String, required: true },
        required: { type: Boolean, default: true },
      },
    ],
    status: { type: String, enum: ['draft', 'published', 'paused', 'closed'], default: 'draft' },
  },
  { timestamps: true }
);

export default mongoose.model<IJob>('Job', jobSchema);
