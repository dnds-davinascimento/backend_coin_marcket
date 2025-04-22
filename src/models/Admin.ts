import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  _id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  password: string;
  paymentAlert:boolean;
  created_at: Date;
}

const AdminSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  paymentAlert:{type:Boolean},

  // Informações da loja Nuvemshop

});

export default mongoose.model<IAdmin>("Admin", AdminSchema);

