import mongoose, { Schema, Document, Types } from "mongoose";
import { enderecoSchema, IEndereco } from "./endereco";

interface ILoja extends Document {
  nome: string;
  email?: string;
  telefone: string;
  whatsApp?: string;
  facebook?: string;
  instagram?: string;
  site?: string;
  razao_social: string;
  prestacao_de_servicos: boolean;
  comercializacao_de_produtos: boolean;
  utilizar_acrescimo_por_forma: boolean;
  cnpj: number;
  regime_tributario?: string;
  utiliza_NFC: boolean;
  utiliza_NFC_e: boolean;
  centro_distribuicao: boolean;
  calcularcasheback: boolean;
  fechamento_unico: boolean;
  emissao_aut_nfc_e: boolean;
  descontar_aut_produtos_sincronizados: boolean;
  certificado?: string;
  identificador_do_csc?: string;
  codigo_de_Segurança_do_contribuinte?: string;
  cnpj_cpf_do_escritorio_de_contabilidade?: number;
  inscricao_municipal?: number;
  inscricao_estadual?: number;
  endereco?: IEndereco[];
  criadoPor?: Types.ObjectId;
  Clientes_das_lojas?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const lojaSchema = new Schema<ILoja>(
  {
    nome: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    telefone: {
      type: String,
      required: true,
    },
    whatsApp: {
      type: String,
      required: false,
    },
    facebook: {
      type: String,
      required: false,
    },
    instagram: {
      type: String,
      required: false,
    },
    site: {
      type: String,
      required: false,
    },
    razao_social: {
      type: String,
      required: true,
    },
    prestacao_de_servicos: {
      type: Boolean,
      default: false,
    },
    comercializacao_de_produtos: {
      type: Boolean,
      default: false,
    },
    utilizar_acrescimo_por_forma: {
      type: Boolean,
      default: false,
    },
    cnpj: {
      type: Number,
      required: true,
    },
    regime_tributario: {
      type: String,
      required: false,
    },
    utiliza_NFC: {
      type: Boolean,
      default: false,
    },
    utiliza_NFC_e: {
      type: Boolean,
      default: false,
    },
    centro_distribuicao: {
      type: Boolean,
      default: false,
    },
    calcularcasheback: {
      type: Boolean,
      default: false,
    },
    fechamento_unico: {
      type: Boolean,
      default: false,
    },
    emissao_aut_nfc_e: {
      type: Boolean,
      default: false,
    },
    descontar_aut_produtos_sincronizados: {
      type: Boolean,
      default: false,
    },
    certificado: {
      type: String,
      required: false,
    },
    identificador_do_csc: {
      type: String,
      required: false,
    },
    codigo_de_Segurança_do_contribuinte: {
      type: String,
      required: false,
    },
    inscricao_municipal: {
      type: Number,
    },
    inscricao_estadual: {
      type: Number,
    },
    endereco: {
      type: [enderecoSchema],
    },
    criadoPor: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },

  },
  { timestamps: true }
);

const Loja = mongoose.model<ILoja>("Loja", lojaSchema);

export { Loja, lojaSchema, ILoja };