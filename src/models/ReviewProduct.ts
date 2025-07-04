// models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewProduct extends Document {
  productId: Schema.Types.ObjectId; // ID do produto relacionado
  review: string;
  authorName: string;
  authorImg: string;
  authorRole: string;
  rating: number; // de 1 a 5 estrelas
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewProductSchema = new Schema<IReviewProduct>({
  productId: { type: Schema.Types.ObjectId, required: true }, // ID do produto relacionado
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

const ReviewProductModel = mongoose.model<IReviewProduct>('ReviewProduct', ReviewProductSchema);
export default ReviewProductModel;
