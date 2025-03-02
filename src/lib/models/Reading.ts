import mongoose, { Document } from 'mongoose';

export interface IReading extends Document {
  title: string;
  category: string;
  english_text: string;
  spanish_translation: string;
  imageUrl: string;
}

const readingSchema = new mongoose.Schema<IReading>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  english_text: {
    type: String,
    required: true
  },
  spanish_translation: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Reading = mongoose.models.Reading || mongoose.model<IReading>('Reading', readingSchema);