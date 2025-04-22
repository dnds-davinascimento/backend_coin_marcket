import { Request, response, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import Admin from "../models/Admin"; // Importa o model Admin
import { generateSignature } from "../services/generateSignature";

import authService from "../services/authService";
import { obterCredenciais } from "../services/credenciaisService";
import nodemailer from "nodemailer";
import Orderdb from "../models/order";
import Order from "../models/order";
import User from "../models/user";

interface response_recibo {
  sucesso: boolean;
  mensagem: string | null;
  tipo: string | null;
  complementoTipo: string | null;
  statusCode: 200;
  dados: {
    recibo: string;
    pedidoProcessado: boolean;
    erros: string | null;
    sequenciaGerada: number;
    ordemMovimentoGerado: number;
    notaFiscal: string | null;
  };
}

interface OrderData {
  CpfCnpj: string;
  CodigoOperacao: string;
  Data: string;
  CodigoIndicadorPresencial: number;
  Observacao: string;
  Produtos: {
    Codigo: string;
    CodigoCor?: string | null;
    CodigoTamanho?: string | null;
    Quantidade: number;
    PrecoUnitario: number;
    DescontoUnitario: number;
  }[];
  Recebimentos: {
    valor: number;
    ValorParcelas: number;
    CodigoAdministradora: number | null; // Permite null
    Vencimento?: string | null;
    Nsu: string;
    QuantidadeParcelas: number;
    codigoContaBancaria: number;
    Tipo: string;
  }[];

  DadosEntrega: {
    Valor: number;
    OpcoesFretePagoPor: string;
    PesoBruto: number;
    PesoLiquido: number;
    Volume: number;
    DataEntrega?: string | null;
    CnpjTransportadora: string;
    NaoSomarFreteTotalNota: boolean;
    OutroEndereco: {
      Cep: string;
      Endereco: string;
      Numero: string;
      Complemento?: string | null;
      Bairro: string;
      Cidade: string;
      Uf: string;
    };
  };
}

// Interface para os dados que serão recebidos da NuvemShop
interface NuvemShopOrder {
  customer: {
    name: any; identification: string
    email: string;
    telefone: string;
  };
  note: string;
  billing_customer_type: string;
  billing_business_name: string;
  billing_trade_name: string;
  billing_state_registration: string;
  billing_name: string;
  billing_phone: string;
  billing_address: string;
  billing_number: string;
  billing_floor: string;
  billing_locality: string;
  billing_zipcode: string;
  billing_city: string;
  billing_province: string;
  billing_country: string;
  products: {
    id: number;
    quantity: number;
    name: string;
    price: string;
    discount?: string;
    product_id: string;
  }[];

  total: string;
  payment_details: { installments: number; method: string };
  gateway_id?: string;
  shipping_cost_customer?: string;
  weight?: string;
  shipping_address: {
    phone: string;
    zipcode: string;
    address: string;
    number?: string;
    complement?: string;
    locality: string;
    city: string;
    province: string;
  };
}

interface NuvemShopResponseOrder {
  sucesso: boolean;
  mensagem: string;
  tipo: null;
  complementoTipo: null;
  statusCode: number;
  dados: {
    recibo: string;
    dataGeracao: string;
  };
}

interface Order {
  _id: string;
  order_id_Nuvem: string;
  recibo_ideal: string;
  sequencia_ideal: number | null;
  store_id: string;
  cpfCnpj: string;
  name: string;
  total: number;
  products: Product[];
  paymentDetails: PaymentDetails;
  shippingAddress: ShippingAddress;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Product {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  _id: string;
}

interface PaymentDetails {
  installments: number;
  method: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  province: string;
  zipcode: string;
}


dotenv.config(); // Carregar as variáveis de ambiente
// Função para o envio de e-mail
const sendEmail = async (order: Order, emails: string[]) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "venda.croi.ns@gmail.com",
      pass: "dehq eejp kpql xcjc",
    },
  });

  const mailOptions = {
    from: "venda.croi.ns@gmail.com",
    to: emails,
    subject: `Novo Pedido Recebido: #${order.sequencia_ideal}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <h2 style="color: #0b3d91;">Detalhes do Pedido</h2>
        <span style="color: #0b3d91;">Essa é um envio de email quando for confirmado um pagamento pela nuvemshop.</span>
        <p><strong>ID do Pedido:</strong> ${order.order_id_Nuvem}</p>
        <p><strong>N° Sequencia Gerada:</strong> ${order.sequencia_ideal}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total:</strong> R$ ${order.total}</p>
        <h2 style="color: #0b3d91;">Cliente:${order.name} Cpf/Cnpj:${order.cpfCnpj}</h2>
        <h3>Produtos:</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${order.products.map(product => `
            <li style="margin-bottom: 10px;">
              <strong>${product.productId}</strong>-${product.name} - Quantidade: ${product.quantity} - Preço Unitário: R$ ${product.price}
            </li>
          `).join('')}
        </ul>
        <h3>Detalhes de Pagamento:</h3>
        <p><strong>Forma de Pagamento:</strong> ${order.paymentDetails.method}</p>
        <p><strong>Parcelas:</strong> ${order.paymentDetails.installments}</p>
        <h3>Endereço de Envio:</h3>
        <p><strong>Endereço:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province} - ${order.shippingAddress.zipcode}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
};
// Função para enviar E-mail quando der erro na criação de venda na Idealsoft
const sendEmailError = async (emails: string[], error: any, orderdb: Order) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "venda.croi.ns@gmail.com",
      pass: "dehq eejp kpql xcjc",
    },
  });
  const mailOptions = {
    from: "venda.croi.ns@gmail.com",
    to: emails,
    subject: "Erro ao criar venda na Idealsoft",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <h2 style="color: #0b3d91;">Erro ao criar venda na Idealsoft</h2>
        <p><strong>Erro:</strong> ${error}</p>
        <h3>Detalhes do Pedido:</h3>
        <p><strong>ID do Pedido:</strong> ${orderdb._id}</p>
        <p><strong>Nome do Cliente:</strong> ${orderdb.name}</p>
        <p><strong>Cpf/Cnpj:</strong> ${orderdb.cpfCnpj}</p>
        <p><strong>Total:</strong> R$ ${orderdb.total}</p>
        <h3>Produtos:</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${orderdb.products.map(product => `
            <li style="margin-bottom: 10px;">
              <strong>${product._id}</strong>-${product.name} - Quantidade: ${product.quantity} - Preço Unitário: R$ ${product.price}
            </li>
          `).join('')}
        </ul>
        <h3>Detalhes de Pagamento:</h3>
        <p><strong>Forma de Pagamento:</strong> ${orderdb.paymentDetails.method}</p>
        <p><strong>Parcelas:</strong> ${orderdb.paymentDetails.installments}</p>
        <h3>Endereço de Envio:</h3>
        <p><strong>Endereço:</strong> ${orderdb.shippingAddress.address}, ${orderdb.shippingAddress.city}, ${orderdb.shippingAddress.province} - ${orderdb.shippingAddress.zipcode}</p>
      </div>
     
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
};


interface FormatUF {
  (uf: string): string;
}

const formatarUF: FormatUF = (uf) => {
  // Mapeamento dos estados para suas respectivas siglas
  const estados: { [key: string]: string } = {
    "ACRE": "AC",
    "ALAGOAS": "AL",
    "AMAPA": "AP",            // Removi o acento
    "AMAZONAS": "AM",
    "BAHIA": "BA",
    "CEARA": "CE",            // Removi o acento
    "DISTRITO FEDERAL": "DF",
    "ESPIRITO SANTO": "ES",   // Removi o acento
    "GOIAS": "GO",            // Removi o acento
    "MARANHAO": "MA",         // Removi o acento
    "MATO GROSSO": "MT",
    "MATO GROSSO DO SUL": "MS",
    "MINAS GERAIS": "MG",
    "PARA": "PA",             // Removi o acento
    "PARAIBA": "PB",          // Removi o acento
    "PARANA": "PR",           // Removi o acento
    "PERNAMBUCO": "PE",
    "PIAUI": "PI",            // Removi o acento
    "RIO DE JANEIRO": "RJ",
    "RIO GRANDE DO NORTE": "RN",
    "RIO GRANDE DO SUL": "RS",
    "RONDONIA": "RO",         // Removi o acento
    "RORAIMA": "RR",
    "SANTA CATARINA": "SC",
    "SAO PAULO": "SP",        // Removi o acento
    "SERGIPE": "SE",
    "TOCANTINS": "TO"
  };

  // Remove acentos e converte para maiúsculo
  const ufFormatado = uf.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  // Verifica se o valor é o nome completo do estado (sem acentos) e retorna a sigla correspondente
  if (estados[ufFormatado]) {
    return estados[ufFormatado];
  }

  // Caso já seja uma sigla, retorna a sigla como está
  return ufFormatado;
};

const venda_Schema = {
  getVenda_recibo: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_loja = req.headers.id as string;
      const user_store_id = req.headers.user_store_idd as string;
      const id_store = user_store_id ? user_store_id : id_loja


      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(
        id_store
      );

      // 1. Primeiro, obtenha o token de autenticação
      const token = await authService.getAuthToken(serie, codFilial, api);

      const method = "get";
      const body = "";

      // Assumindo que o corpo está vazio para requisição GET
      const { signature, timestamp } = generateSignature(method, senha, body);

      // pegar n° de recibo pelo req.headers
      const recibo = req.headers.recibo;

      // 2. Configuração do cabeçalho da requisição
      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };

      // 3. Requisição para a API da Idealsoft com os headers
      const { data } = await axios.get<response_recibo>(
        `${api}/vendas/${recibo}`,
        { headers }
      );


      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },
  getsequencia: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_loja = req.headers.id as string;
      const user_store_id = req.headers.user_store_idd as string;
      const id_store = user_store_id ? user_store_id : id_loja


      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(
        id_store
      );

      // 1. Primeiro, obtenha o token de autenticação
      const token = await authService.getAuthToken(serie, codFilial, api);

      const method = "get";
      const body = "";

      // Assumindo que o corpo está vazio para requisição GET
      const { signature, timestamp } = generateSignature(method, senha, body);

      // pegar n° de recibo pelo req.headers
      const sequenciaGerada = req.query.sequencia;

      // 2. Configuração do cabeçalho da requisição
      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };

      // 3. Requisição para a API da Idealsoft com os headers
      const { data } = await axios.get(
        `${api}/saidas/detalhes/${sequenciaGerada}`,
        { headers }
      );

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },
 

 





 
};

export default venda_Schema;
