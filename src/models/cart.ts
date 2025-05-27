/* models de cart */
import mongoose, { Schema, Document, Types } from "mongoose";

interface IEndereco {
  logradouro: string;
  numero: string;
  bairro: string;
  descricaoCidade: string;
  estado: string;
  cep: string;
}



interface IHistorico {
  usuario?: string;
  data: Date;
  acao: string;
}

interface IProdutoCart {
  codigo_interno?: string;
  _id: string;
  nome: string;
  quantidade: number;
  un: string;
  preco_de_Venda: number;
  ncm?: string;
  preco_de_custo?: number;
  desconto: number;
  precoTotal: number;
  estoque: number;
  end?: string;
  categoria?: string;
  status: string;
  imgs?: [{
    url: string;
    key?: string;
  }];
}

interface ICart extends Document {

  consumidor?: {
    id?: string;
    cpf?: string;
    nome?: string;
    email?: string;
    contato?: string;
    endereco?: IEndereco[];
  };
  vendedor?: {
    nome?: string;
    id?: string;
  };
  status_Cart?: string;
  descricao?: string;
  historico: IHistorico[];
  ItensTotal: number;
  produtos: IProdutoCart[];
  valorTotal: number;
   valor_de_Desconto: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {

    consumidor: {
      id: { type: String, required:true },
      cpf: { type: String, required:true },
      nome: { type: String, required:true },
      email: { type: String, required:true },
      contato: { type: String, required:true },
      endereco: [
        {
          logradouro: { type: String, required:true },
          numero: { type: String, required:true },
          bairro: { type: String, required:true },
          descricaoCidade: { type: String, required:true },
          estado: { type: String, required:true },
          cep: { type: String, required:true },
        },
      ]
    },
    vendedor: {
      nome: { type: String },
      id: { type: String },
    },
    status_Cart: { type: String },
    descricao: { type: String },
    historico: [{
      usuario: { type: String, required: false },
      data: { type: Date, default: Date.now },
      acao: { type: String, required: true },
    }],
    ItensTotal: { type: Number, required: true },
    produtos: [{
      codigo_interno: { type: String },
      _id: { type: String, required: false },
      nome: { type: String, required: false },
      quantidade: { type: Number, required: false },
      un: { type: String, required: false },
      preco_de_Venda: { type: Number, required: false },
      preco_de_custo: { type: Number, required: false },
      desconto: { type: Number, required: false },
      precoTotal: { type: Number, required: false },
      estoque: { type: Number, required: false },
 
      categoria: { type: String, required: false },
         imgs: [
      {
        url: { type: String, required: false },
        key: { type: String, required: false },
      },
    ],
    }],
    valorTotal: { type: Number, required: true },
    valor_de_Desconto: { type: Number, required: true },
 
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export { Cart, cartSchema, ICart, IProdutoCart, IHistorico, IEndereco };   