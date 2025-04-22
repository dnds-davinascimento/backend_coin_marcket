import mongoose, { Schema, Document, Types } from "mongoose";

interface ICategoria extends Document {
  nome: string;
  categoria_da_loja?: Types.ObjectId;
  categoria_compartilhada?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categoria_produto_Schema = new Schema<ICategoria>(
  {
    nome: {
      type: String,
      required: true,
    },
    categoria_da_loja: {
      type: Schema.Types.ObjectId,
      ref: "Loja",
    },
    categoria_compartilhada: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Categoria = mongoose.model<ICategoria>("Categoria", categoria_produto_Schema);

export { Categoria, categoria_produto_Schema, ICategoria };