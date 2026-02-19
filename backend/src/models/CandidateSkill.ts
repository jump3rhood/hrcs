import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidateSkill extends Document {
  candidateId: mongoose.Types.ObjectId;
  skillName: string;
  rating: number;
}

const skillSchema = new Schema<ICandidateSkill>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    skillName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

skillSchema.index({ candidateId: 1, skillName: 1 }, { unique: true });

export default mongoose.model<ICandidateSkill>('CandidateSkill', skillSchema);
