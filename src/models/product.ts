import mongoose, { Schema, Document, Types } from "mongoose";

interface ICategoria {
  id: Types.ObjectId;
  nome?: string;
  subcategorias?: [
    {
      id: Types.ObjectId;
      nome: string;
    }
  ];
}

interface IProdutoSincronizado {
  produto_sincronizado: boolean;
  produto: {
    nome?: string;
    id?: string;
  };
}

interface IHistorico {
  usuario?: string;
  data: Date;
  acao: string;
  id_acao?: string;
  desc?: string;
  estoqueAntesAlteracao: number;
  quantidade: number;
  estoqueAposAlteracao: number;
}



interface IProduto extends Document {
  nome: string;
  categoria?: ICategoria;
  seotitle?: string;
  seodescription?: string;
  codigo_interno?: string;
  codigo_da_nota?: string;
  codigo_ideal?: number;
  enderecamento?: string;
  codigo_de_barras?: string;
  codigo_do_fornecedor?: string;
  marca?: string;
  estoque_minimo?: number;
  estoque_maximo?: number;
  estoque?: number;
  estoque_vendido?: number;
  custo_do_estoque?: number;
  valor_do_estoque?: number;
  estoque_faltando?: number;
  urlCanonical?: string;
  slug?: string;
  markup_sobre_o_Preco_de_custo?: number;
  ncm?: string;
  cest?: string;
  cst?: string;
  cfop?: string;
  origem_da_mercadoria?: string;
  un: string;
  peso_bruto_em_kg?: number;
  peso_liquido_em_kg?: number;
  preco_de_custo: number;
  icms?: number;
  ipi?: number;
  frete?: number;
  custo_inicial?: number;
  preco_de_venda: number;
  produto_sincronizado_com?: IProdutoSincronizado[];
  preco_por_categoria?: {
    Preco_venda_categoria?: number;
  };
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  produto_verify?: boolean;
  produto_marcket?: boolean;
  produto_de_rota?: boolean;
  produto_shared?: boolean;
  produto_servico?: boolean;
  mostrar_no_super_market?: boolean;
  produto_da_loja?: Types.ObjectId;
  produto_do_fornecedor?: Types.ObjectId;
  historico?: IHistorico[];
  imgs?: [{
    url: string;
    key?: string;
  }];
  videos?: [{
    url: string;
    key?: string;
  }];
  tabelas_precos?: [{
    nome: string;
    valor?: string;
    mostrar?: boolean;
    precopj?: boolean;
    precopf?: boolean;
    id?: string;
    promocional?: boolean;
  }];
  createdAt: Date;
  updatedAt: Date;
}

const produtoSchema = new Schema<IProduto>(
  {
    nome: {
      type: String,
      required: true,
    },
    seotitle: {
      type: String,
      required: false,
    },
    seodescription: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    codigo_ideal: {
      type: Number,
      required: true,
      default: 0,
    },
    urlCanonical: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    categoria: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Categoria",
        required: false,
      },
      nome: {
        type: String,
        required: false,
      },
      subcategorias: [
        {
          id: {
            type: Schema.Types.ObjectId,
            ref: "Categoria",
            required: false,
          },
          nome: {
            type: String,
            required: false,
          },
        },
      ],
    },
    codigo_interno: {
      type: String,
      required: false,
    },
    codigo_da_nota: {
      type: String,
      required: false,
    },
    enderecamento: {
      type: String,
      required: false,
    },
    codigo_de_barras: {
      type: String,
      required: false,
    },
    codigo_do_fornecedor: {
      type: String,
      required: false,
    },
    produto_do_fornecedor: {
      type: String,
      required: false,
    },
    marca: {
      type: String,
      required: false,
    },
    estoque_minimo: {
      type: Number,
      required: false,
      default: 0,
    },
    estoque_maximo: {
      type: Number,
      required: false,
      default: 0,
    },
    estoque: {
      type: Number,
      required: false,
      default: 0,
    },
    estoque_vendido: {
      type: Number,
      required: false,
      default: 0,
    },
    custo_do_estoque: {
      type: Number,
      required: false,
      default: 0,
    },
    valor_do_estoque: {
      type: Number,
      required: false,
      default: 0,
    },
    estoque_faltando: {
      type: Number,
      required: false,
      default: 0,
    },
    markup_sobre_o_Preco_de_custo: {
      type: Number,
      required: false,
      default: 0,
    },
    ncm: {
      type: String,
      required: false,
    },
    cest: {
      type: String,
      required: false,
    },
    cst: {
      type: String,
      required: false,
    },
    cfop: {
      type: String,
      required: false,
    },
    origem_da_mercadoria: {
      type: String,
      required: false,
    },
    un: {
      type: String,
      required: true,
    },
    peso_bruto_em_kg: {
      type: Number,
      required: false,
    },
    peso_liquido_em_kg: {
      type: Number,
      required: false,
    },
    preco_de_custo: {
      type: Number,
      required: true,
    },
    icms: {
      type: Number,
      required: false,
      default: 0,
    },
    ipi: {
      type: Number,
      required: false,
      default: 0,
    },
    frete: {
      type: Number,
      required: false,
      default: 0,
    },
    custo_inicial: {
      type: Number,
      required: false,
      default: 0,
    },
    preco_de_venda: {
      type: Number,
      required: true,
    },
    tabelas_precos: [
      {
        nome: { type: String, required: true },
        valor: { type: String, required: false },
        mostrar: { type: Boolean, default: true },
        precopj: { type: Boolean, default: false },
        precopf: { type: Boolean, default: false },
        promocional: { type: Boolean, default: false },
        
      },
    ],
    produto_sincronizado_com: [
      {
        produto_sincronizado: { type: Boolean, default: false },
        produto: {
          nome: { type: String, required: false },
          id: { type: String, required: false },
        },
      },
    ],
    preco_por_categoria: {
      Preco_venda_categoria: Number,
    },
    produto_verify: {
      type: Boolean,
      default: false,
    },
    produto_marcket: {
      type: Boolean,
      default: false,
    },
    produto_de_rota: {
      type: Boolean,
      default: false,
    },
    produto_shared: {
      type: Boolean,
      default: false,
    },
    produto_servico: {
      type: Boolean,
      default: false,
    },
    mostrar_no_super_market: {
      type: Boolean,
      default: false,
    },
    produto_da_loja: {
      type: Schema.Types.ObjectId,
      ref: "Loja",
    },

    historico: [
      {
        usuario: { type: String, required: false },
        data: { type: Date, default: Date.now },
        acao: { type: String, required: true },
        id_acao: { type: String, required: false },
        desc: { type: String },
        estoqueAntesAlteracao: { type: Number, default: 0 },
        quantidade: { type: Number, default: 0 },
        estoqueAposAlteracao: { type: Number, default: 0 },
      },
    ],
    imgs: [
      {
        url: { type: String, required: false },
        key: { type: String, required: false },
      },
    ],
    videos: [
      {
        url: { type: String, required: false },
        key: { type: String, required: false },
      },
    ],
  },
  { timestamps: true }
);

const Produto = mongoose.model<IProduto>("Produto", produtoSchema);

export { Produto, produtoSchema, IProduto };