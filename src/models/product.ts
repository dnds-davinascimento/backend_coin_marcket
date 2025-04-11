import mongoose, { Document, Schema } from "mongoose";

export interface Product extends Document {
  _id: string;
  name: string;
  admin_id: string;
  idealProductId: string;
  nuvemshopProductId: string;
  created_at: Date;
  codigoClasse:number;
  codigoSubclasse:number;
  categorias:string[]
  canonicalUrl:string;
  imgUrl:string;
  published:boolean;
  
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  admin_id: { type: Schema.Types.ObjectId, ref: "ProductAdmin", required: true },
  canonicalUrl: { type: String, required: false },
  imgUrl: { type: String, required: false },

  // Informações da loja Nuvemshop
  idealProductId: { type: String, required: true },
  nuvemshopProductId: { type: String, required: true },
  codigoClasse:{type:Number},
  codigoSubclasse:{type:Number},
  published:{type:Boolean},
});

export default mongoose.model<Product>("Product", ProductSchema);
