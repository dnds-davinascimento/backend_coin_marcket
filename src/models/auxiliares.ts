import mongoose, { Schema, Document } from "mongoose";

export interface Auxiliares extends Document {
  id: string;
  name: string;
  description: string;
  codigoclasse: string;
  codigosubclasse: string;
  codigo_categoria: string;
  parent:string;
  subcategories: string[];

 
  auxiliares_user_id: string;
}

const auxiliaresSchema: Schema = new Schema({
  
  name: { type: String, required: true }, // Nome da categoria
  description: { type: String, required: false }, // Descrição da categoria
  codigoclasse: { type: String}, // Campo obrigatório
  codigosubclasse: { type: String}, // Campo obrigatório
  codigo_categoria: { type: String}, // Campo obrigatório
  parent: { type: String }, // ID da categoria Pai
  subcategories: [{ type: String, required: false }], // Subcategorias (array de strings)
  auxiliares_user_id: { type: Schema.Types.ObjectId, ref: "auxiliaresUser", required: true }, // Relacionamento com o usuário
});

export default mongoose.model<Auxiliares>("Auxiliares", auxiliaresSchema);
