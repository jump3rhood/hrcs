import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  yearsOfExperience: number;
  githubUrl?: string;
}

const candidateSchema = new Schema<ICandidate>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    githubUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model<ICandidate>('Candidate', candidateSchema);
