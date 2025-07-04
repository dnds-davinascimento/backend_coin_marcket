// models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewStore extends Document {
  review: string;
  authorName: string;
  authorImg: string;
  authorRole: string;
  rating: number; // de 1 a 5 estrelas
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewStoreSchema = new Schema<IReviewStore>({
  review: { type: String, required: true },
  authorName: { type: String, required: true },
  authorImg: { type: String, required: false },
  authorRole: { type: String, required: true },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  visible: { type: Boolean, default: true },
}, {
  timestamps: true
});

const ReviewStoreModel = mongoose.model<IReviewStore>('ReviewStore', ReviewStoreSchema);
export default ReviewStoreModel;
