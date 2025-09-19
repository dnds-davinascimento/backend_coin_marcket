import mongoose, { Schema, Document } from "mongoose";

export interface Wallet extends Document {
  address: string;
  privateKey: string; // ⚠️ Em produção, criptografa isso antes de salvar
}

const walletSchema: Schema = new Schema({
  address: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<Wallet>("wallet", walletSchema);
