import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'free' | 'premium' | 'admin';
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  dailyPhrasesCount: number;
  lastPhrasesReset: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}