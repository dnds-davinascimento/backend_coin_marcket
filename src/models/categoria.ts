import mongoose, { Schema, Document, Types } from "mongoose";

interface ICategoria extends Document {
  nome: string;
  categoria_da_loja?: Types.ObjectId;
  parient?: Types.ObjectId;
  subcategorias?:
  [{
    id: Types.ObjectId;
    nome: string;
  }];
  createdAt: Date;
  updatedAt: Date;
}

const categoria_produto_Schema = new Schema<ICategoria>(
  {
    nome: {
      type: String,
      required: true,
    },
    parient: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
    },
    subcategorias: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Categoria",
        },
        nome: {
          type: String,
          required: true,
        },
      },
    ],
    categoria_da_loja: {
      type: Schema.Types.ObjectId,
      ref: "Loja",
    },

  },
  { timestamps: true }
);

const Categoria = mongoose.model<ICategoria>("Categoria", categoria_produto_Schema);

export { Categoria, categoria_produto_Schema, ICategoria };