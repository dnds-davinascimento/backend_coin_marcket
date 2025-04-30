import mongoose, { Schema, Document } from "mongoose";

interface IEndereco extends Document {
  bairro: string;
  cep: string;
  codigoCidade: string;
  estado: string;
  logradouro?: string;
  numero: string;
  tipoLogradouro: string;
  codigoPais: string;
  complemento: string;
  descricaoCidade: string;
  descricaoPais: string;
  tipoBairro: string;
  createdAt: Date;
  updatedAt: Date;
}

const enderecoSchema = new Schema<IEndereco>(
  {
    bairro: {
      type: String,
    },
    cep: {
      type: String,
    },
    codigoCidade: {
      type: String,
    },
    estado: {
      type: String,
    },
    logradouro: {
      type: String,
    },
    numero: {
      type: String,
    },
    tipoLogradouro: {
      type: String,
      
    },
    codigoPais: {
      type: String,
      default: "1058"
    },
    complemento: {
      type: String,
    },
    descricaoCidade: {
      type: String,
    },
    descricaoPais: {
      type: String,
      default: "Brasil"
    },
    tipoBairro: {
      type: String,
      default: "Zona"
    },
  },
  { timestamps: true }
);

const Endereco = mongoose.model<IEndereco>("Endereco", enderecoSchema);

export { Endereco, enderecoSchema, IEndereco };