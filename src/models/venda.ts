import mongoose, { Schema, Document, Types } from "mongoose";

interface IEndereco {
  logradouro: string;
  numero: string;
  bairro: string;
  descricaoCidade: string;
  estado: string;
  cep: string;
}

interface IFormaPagamento {
  metodo: string;
  pagar_no_local: boolean;
  status?: string;
  valor: number;
}

interface IHistorico {
  usuario?: string;
  data: Date;
  acao: string;
}

interface IProdutoVenda {
  codigo_interno?: string;
  _id: string;
  nome: string;
  quantidade: number;
  un: string;
  preco_de_venda: number;
  ncm?: string;
  preco_de_custo?: number;
  desconto: number;
  precoTotal: number;
  estoque: number;
  end?: string;
  categoria?: string;
  status: string;
  qt_devolucao: number;
  produto_de_rota: boolean;
  produto_servico: boolean;
}

interface IVenda extends Document {
  emitente: {
    _id: string;
    cnpj: string;
    razao_social: string;
    regime_tributario?: string;
    endereco: IEndereco[];
  };
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
  formas_de_pagamento_array: IFormaPagamento[];
  Numero_da_nota?: number;
  id_da_Entrega?: string;
  quantidade_de_parcelas?: number;
  status_venda?: string;
  descricao?: string;
  historico: IHistorico[];
  ItensTotal: number;
  produtos: IProdutoVenda[];
  valorTotal: number;
  valorTroco?: number;
  valor_de_Desconto: number;
  prazo_de_entrega?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const vendaSchema = new Schema<IVenda>(
  {
    emitente: {
      _id: { type: String, required: true },
      cnpj: { type: String, required: true },
      razao_social: { type: String, required: true },
      regime_tributario: { type: String, required: false },
      endereco: [
        {
          logradouro: { type: String, required: true },
          numero: { type: String, required: true },
          bairro: { type: String, required: true },
          descricaoCidade: { type: String, required: true },
          estado: { type: String, required: true },
          cep: { type: String, required: true },
        },
      ]
    },
    consumidor: {
      id: { type: String },
      cpf: { type: String },
      nome: { type: String },
      email: { type: String },
      contato: { type: String },
      endereco: [
        {
          logradouro: { type: String },
          numero: { type: String },
          bairro: { type: String },
          descricaoCidade: { type: String },
          estado: { type: String },
          cep: { type: String },
        },
      ]
    },
    vendedor: {
      nome: { type: String },
      id: { type: String },
    },
    formas_de_pagamento_array: [{
      metodo: { type: String },
      pagar_no_local: { type: Boolean, required: true },
      status: { type: String },
      valor: { type: Number }
    }],
    Numero_da_nota: { type: Number },
    id_da_Entrega: { type: String },
    quantidade_de_parcelas: { type: Number, required: false },
    status_venda: { type: String },
    descricao: { type: String },
    historico: [{
      usuario: { type: String, required: false },
      data: { type: Date, default: Date.now },
      acao: { type: String, required: true },
    }],
    ItensTotal: { type: Number, required: true },
    produtos: [{
      codigo_interno: { type: String },
      _id: { type: String, required: true },
      nome: { type: String, required: true },
      quantidade: { type: Number, required: true },
      un: { type: String, required: true },
      preco_de_venda: { type: Number, required: true },
      ncm: { type: String },
      preco_de_custo: { type: Number, required: false },
      desconto: { type: Number, required: true },
      precoTotal: { type: Number, required: true },
      estoque: { type: Number, required: true },
      end: { type: String, required: false },
      categoria: { type: String, required: false },
      status: { type: String, default: "vendido" },
      qt_devolucao: { type: Number, default: 0 },
      produto_de_rota: { type: Boolean, default: false },
      produto_servico: { type: Boolean, default: false },
    }],
    valorTotal: { type: Number, required: true },
    valorTroco: { type: Number, required: false },
    valor_de_Desconto: { type: Number, required: true },
    prazo_de_entrega: {
      type: Date,
      required: false
    },
  },
  { timestamps: true }
);

const Venda = mongoose.model<IVenda>("Venda", vendaSchema);

export { Venda, vendaSchema, IVenda, IProdutoVenda, IFormaPagamento, IHistorico, IEndereco };   