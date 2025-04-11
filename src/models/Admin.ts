import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  _id: string;
  nuvemshop_user_id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  password: string;
  paymentAlert:boolean;
  created_at: Date;
  nuvemshop_scope: string[];
  nuvemshopStoreId?: number; // ID da loja Nuvemshop
  nuvemshopAccessToken?: string; // Token de acesso Nuvemshop
  nuvemshopConfigured: boolean; // Loja configurada ou não
}

const AdminSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  paymentAlert:{type:Boolean},

  // Informações da loja Nuvemshop
  nuvemshop_user_id: { type: String },
  nuvemshop_scope: { type: Array },
  nuvemshopStoreId: { type: Number },
  nuvemshopAccessToken: { type: String },
  nuvemshopConfigured: { type: Boolean, default: false },
});

export default mongoose.model<IAdmin>("Admin", AdminSchema);

