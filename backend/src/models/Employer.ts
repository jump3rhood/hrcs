import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployer extends Document {
  user: mongoose.Types.ObjectId;
  companyName: string;
  industry: string;
  website?: string;
  description?: string;
}

const employerSchema = new Schema<IEmployer>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, default: '' },
    industry: { type: String, default: '' },
    website: String,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model<IEmployer>('Employer', employerSchema);
