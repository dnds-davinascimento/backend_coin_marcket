import mongoose, { Schema, Document } from "mongoose";

interface IEntregaAnexo {
  data: Date;
  usuario: string;
  nome: 'comprovante_entrega' | 'outro';
  observacao?: string;
  url: string;
  key?: string;
}

interface IEntregaHistorico {
  usuario: string;
  data: Date;
  acao: string;
}

interface IEntregaProduto {
  _id: string;
  nome: string;
  quantidade: number;
  status: 'entregue' | 'pendente' | 'devolvido';
  observacao?: string;
}
interface IObservacao {
  data: Date;
  usuario: string;
  texto: string;
}
interface IEntrega extends Document {
  numero: string;
  filial: string;
  sequencia: number;
  link_da_localizacao?: string;
  codigo_Cliente?: number;
  consumidor_nome?: string;
  consumidor_email?: string;
  consumidor_contato?: string;
  numero_nf: string;
  tipo_Operacao: string;
  tipo_Selecionado: string; // 'normal' | 'retirada'
  vendedor: {
    id: string;
    nome: string;
  };
  responsavelPorReceber: {
    nome: string;
    telefone: string;
  };
  endereco_entrega: {
    logradouro: string;
    numero: string;
    bairro: string;
    descricaoCidade: string;
    estado: string;
    cep: string;
  };
  status_entrega: 'pendente' | 'em_transporte' | 'entregue' | 'devolvido' | 'cancelada';
  data_entrega?: Date;
  data_confirmacao_cliente?: Date;
  anexos?: IEntregaAnexo[];
  historico: IEntregaHistorico[];
  observacoes?: IObservacao[];
  levarMaquina: boolean;  // <-- novo
  parcelas: number;       // <-- novo
  createdAt: Date;
  updatedAt: Date;
}

const entregaSchema = new Schema<IEntrega>(
  {

    sequencia: { type: Number, required: true },
    link_da_localizacao: { type: String },
    codigo_Cliente: { type: Number, required: false },
    consumidor_nome: { type: String, required: true },
    consumidor_email: { type: String },
    consumidor_contato: { type: String },
    numero_nf: { type: String, required: true },
    tipo_Operacao: { type: String, required: true }, // 'normal' | 'retirada'
    tipo_Selecionado: { type: String, required: true },
    filial: { type: String,required: true },
    vendedor: {
      id: { type: String, required: true },
      nome: { type: String, required: true },
    },
    responsavelPorReceber: {
      nome: { type: String, required: true },
      telefone: { type: String, required: true },
     
    },
    endereco_entrega: {
      logradouro: { type: String, required: true },
      numero: { type: String, required: true },
      bairro: { type: String, required: true },
      descricaoCidade: { type: String, required: true },
      estado: { type: String, required: true },
      cep: { type: String, required: true },
    },
    status_entrega: {
      type: String,
      enum: ['pendente', 'em_transporte', 'entregue', 'devolvido', 'cancelada'],
      default: 'pendente',
    },
    data_entrega: { type: Date, default: null },
    data_confirmacao_cliente: { type: Date, default: null },
    anexos: [
      {
        data: { type: Date, default: Date.now },
        usuario: { type: String, required: true },
        nome: { type: String, enum: ['comprovante_entrega', 'outro'], required: true },
        observacao: { type: String },
        url: { type: String, required: true },
        key: { type: String },
      },
    ],
    historico: [
      {
        usuario: { type: String, required: true },
        data: { type: Date, default: Date.now },
        acao: { type: String, required: true },
      },
    ],
    observacoes: [
      {
        data: { type: Date, default: Date.now },
        usuario: { type: String, required: true },
        texto: { type: String, required: true },
      },
    ],
    levarMaquina: { type: Boolean, required: true, default: false }, // novo
    parcelas: { type: Number, required: true, default: 1 },          // novo
  },
  { timestamps: true }
);

const Entrega = mongoose.model<IEntrega>("Entrega", entregaSchema);

export { Entrega, IEntrega, IEntregaProduto, IEntregaAnexo, IEntregaHistorico };
