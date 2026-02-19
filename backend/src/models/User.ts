import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'candidate' | 'employer' | 'admin';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'employer', 'admin'], required: true },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
