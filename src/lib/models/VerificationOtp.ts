import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationToken extends Document {
  email: string;
  otp: string;
  expires: Date;
  createdAt: Date;
}

const verificationTokenSchema = new Schema<IVerificationToken>({
  email: {
    type: String,
    required: true,
    ref: 'Tenant',
  },
  otp: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // expires: 60, // 10 minutes in seconds
  },
});

// Compound index for faster queries
// verificationTokenSchema.index({ expires: 1, token: 1 });

// TTL index on the expires field to delete once this time is reached
verificationTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.VerificationToken || 
  mongoose.model<IVerificationToken>('VerificationToken', verificationTokenSchema);