import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IResetToken extends Document {
  user_id: Types.ObjectId;
  token: string;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resetTokenSchema = new Schema<IResetToken>({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  used: { type: Boolean, default: false },
}, {
  timestamps: true
});

// O índice TTL (Time To Live) é configurado para expirar documentos após 1 minuto (60 segundos)
resetTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120  }); // TTL index


const ResetTokenModel = mongoose.model<IResetToken>('ResetToken', resetTokenSchema);
export default ResetTokenModel;
