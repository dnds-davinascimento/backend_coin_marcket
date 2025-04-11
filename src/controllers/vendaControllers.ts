import { Request, response, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import Admin from "../models/Admin"; // Importa o model Admin
import { generateSignature } from "../services/generateSignature";
import Product from "../models/product";
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
  getVeldasIdealsoft: async (req: Request, res: Response): Promise<void> => {
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

      // 2. Configuração do cabeçalho da requisição
      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };
      let pagina = req.query.pagina;

      // 3. Requisição para a API da Idealsoft com os headers
      const { data } = await axios.get(`${api}/saidas/${pagina || 1}`, {
        headers,
      });

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },
  //criar venda
  post: async (req: Request, res: Response): Promise<void> => {
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

      const method = "post";
      const body = "";

      // Assumindo que o corpo está vazio para requisição GET
      const { signature, timestamp } = generateSignature(method, senha, body);

      // 2. Configuração do cabeçalho da requisição
      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };

      // 3. Requisição para a API da Idealsoft com os headers
      const { data } = await axios.post(
        `${process.env.IDEALSOFT_API}/vendas/`,
        req.body,
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
  order_created_hook: async (req: Request, res: Response): Promise<void> => {
    // Definindo a estrutura da ordem de dados esperada para o Ideal Soft
    try {
      res
        .status(200)
        .json({ msg: "Pedido recebido, processamento em andamento" });


      // Coletando dados do corpo da requisição
      const order_id = req.body.id;
      const store_id = req.body.store_id;

      /* fazer verificação se a orden ja esta no mongo db */
      const existorderdb = await Orderdb.findOne({ order_id_Nuvem: order_id });

/*       if (existorderdb && existorderdb.sequencia_ideal) {
        console.log("Pedido já processado com sucesso, sequência gerada:", existorderdb.sequencia_ideal);
        // Se já foi processado e tem o campo `sequencia_ideal`, não precisa processar novamente
        return; // Pedido já processado com sucesso
      } */
      console.log("Pedido recebido, processando...");


      if (!order_id || !store_id) {

        res
          .status(400)
          .json({ msg: "ID do pedido ou ID da loja não fornecido." });
        return;
      }

      const admin = await Admin.findOne({ nuvemshop_user_id: store_id });
      if (!admin) {

        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }
      const credencial_user_id = admin._id as string;

      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(
        credencial_user_id
      );
      const nuvemshopAccessToken = admin.nuvemshopAccessToken;
      const nuvemshopStoreId = admin.nuvemshop_user_id;

      const { data: order } = await axios.get<NuvemShopOrder>(
        `${process.env.NUVEMSHOP_API}/${nuvemshopStoreId}/orders/${order_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authentication: `bearer ${nuvemshopAccessToken}`,
            "User-Agent": `Your App Name ${process.env.APP_ID_NUVEMSHOP}`,
          },
        }
      );
      console.log(order);


      interface ClienteIdealResponse {
        sucesso: boolean;
        mensagem: string | null;
        tipo: string | null;
        complementoTipo: string | null;
        statusCode: number;
        dados: {
          codigoAtual?: number;
          codigoGerado?: number;
        };
      }

      // Verifica se o cliente já está cadastrado na Idealsoft
      const cpfCnpj = order.customer.identification;
      let FisicaJuridica, indicadorIE,Operacao;

      // Se for CPF (11 dígitos)
      if (cpfCnpj.length === 11) {
        FisicaJuridica = "F"; // Pessoa Física
        indicadorIE = 9; // Indicador IE sempre 9 para CPF
        Operacao = "802"; // Código de operação para CPF
      }
      // Se for CNPJ (14 dígitos)
      else if (cpfCnpj.length === 14) {
        FisicaJuridica = "J"; // Pessoa Jurídica
        // Indicador IE: pode ser 1 (contribuinte de ICMS), 2 (isento), ou outro valor. Ajustar conforme a regra.
        indicadorIE = 1; // Supondo que seja 1 por padrão, ou ajustar conforme necessário
        Operacao = "800"; // Código de operação para CNPJ
      }

      const clienteData = {
        Nome: order.customer.name,
        Fantasia: order.billing_trade_name || null,
        indicadorIE: indicadorIE,
        ie: order.billing_state_registration,
        Tipo: "C", // Assumindo que sempre será cliente
        FisicaJuridica: FisicaJuridica,
        CpfCnpj: cpfCnpj,
        Cep: order.shipping_address.zipcode,
        Endereco: order.shipping_address.address,
        Numero: order.billing_number || "",
        Complemento: order.shipping_address.complement || null,
        Bairro: order.shipping_address.locality,
        Cidade: order.shipping_address.city,
        Uf: formatarUF(order.shipping_address.province),
        Telefone1: order.shipping_address.phone || "", // Ajuste conforme necessário
        entregaCep: order.shipping_address.zipcode,
        entregaEndereco: order.shipping_address.address,
        entregaNumero: order.billing_number || "",
        entregaComplemento: order.shipping_address.complement || null,
        entregaBairro: order.shipping_address.locality,
        entregaCidade: order.shipping_address.city,
        entregaUf: formatarUF(order.shipping_address.province),
        entregaPontoRef1: "", // Ajuste conforme necessário
        contatos:[{
          nome: order.customer.name,
          email: order.customer.email || null,
          telefone: order.customer.telefone || null,
        }]
      };



      // Função para cadastrar o cliente na Idealsoft
      const cadastrarClienteIdealsoft = async (
        clienteData: any
      ): Promise<ClienteIdealResponse> => {
        const token = await authService.getAuthToken(serie, codFilial, api);
        const method = "post";
        const body = clienteData;
        const { signature, timestamp } = generateSignature(
          method,
          senha,
          JSON.stringify(body)
        );
        const headers = {
          Signature: signature,
          CodFilial: codFilial,
          Authorization: `Token ${token}`,
          Timestamp: timestamp.toString(),
        };

        try {
          const { data } = await axios.post<ClienteIdealResponse>(
            `http://10.0.0.44:60002/clientes`,
            body,
            { headers }
          );
          return data;
        } catch (error: any) {
          if (error.response && error.response.status === 409) {
            // Cliente já cadastrado, retorno a mensagem com o código do cliente
            return error.response.data as ClienteIdealResponse;
          }
          throw error;
        }
      };

      // Exemplo de uso da função
      const clienteIdealResponse = await cadastrarClienteIdealsoft(clienteData);
      console.log(clienteIdealResponse);

      // Buscando cada produto da Nuvemshop na base de dados para pegar o idealProductId
      const produtosIdeal = [];
      for (const product of order.products) {
        // Buscar o produto no MongoDB usando o nuvemshopProductId
        const produtoMongo = await Product.findOne({
          nuvemshopProductId: product.product_id,
        });
        if (!produtoMongo) {

          res
            .status(404)
            .json({ msg: `Produto não encontrado para o ID: ${product.id}` });
          return;
        }
        // Adicionar o produto ao array de produtos para enviar para o Ideal Soft
        produtosIdeal.push({
          Codigo: produtoMongo.idealProductId, // Usando o ID da Ideal Soft
          Quantidade: product.quantity,
          PrecoUnitario: parseFloat(String(product.price)),
          DescontoUnitario: parseFloat(product.discount || "0"),
        });
      }
      /* criar data de entrega para 24 horas depois do orario atual na time zone são paulo */
      const dataEntrega = new Date();
      dataEntrega.setHours(dataEntrega.getHours() + 24); // Adiciona 24 horas


      // Transformando os dados da Nuvem Shop no formato esperado pelo Ideal Soft
      const orderData: OrderData = {
        CpfCnpj: order.customer.identification,
        CodigoOperacao: Operacao || "950", // Definindo código de operação fixo
        Observacao: order.note || "",
        Data: new Date().toISOString(),
        Produtos: produtosIdeal, // Usando os produtos com idealProductId
        CodigoIndicadorPresencial: 2,
        Recebimentos: [
          {
            ValorParcelas: parseFloat(order.total),
            valor: parseFloat(order.total),
            CodigoAdministradora: order.payment_details.method === "credit_card" ? 611 : null,
            Nsu: order.payment_details.method === "credit_card" ? "000001" : "",
            Vencimento: null,
            QuantidadeParcelas: order.payment_details.installments || 1,
            codigoContaBancaria: 26,
            // Verifica o método de pagamento e define o tipo correspondente
            Tipo: (() => {
              switch (order.payment_details.method) {
                case "credit_card":
                  return "C"; // Cartão de Crédito
                case "pix":
                  return "CB"; // Conta Bancária (PIX)
                case "boleto":
                  return "B"; // Boleto
                default:
                  return "B"; // Boleto por padrão
              }
            })(),
          },
        ],
        DadosEntrega: {
          Valor: parseFloat(order.shipping_cost_customer || "0"),
          OpcoesFretePagoPor: "D", // Ou "C" se for pago pelo cliente
          PesoBruto: parseFloat(order.weight || "0"),
          PesoLiquido: parseFloat(order.weight || "0"), // Talvez precise ajustar
          Volume: 0.0, // Se houver volume, ajustar
          DataEntrega: dataEntrega.toISOString(), // Verificar se existe alguma data de entrega
          CnpjTransportadora: "08632253000190", // Adicionar lógica para capturar o CNPJ correto
          NaoSomarFreteTotalNota: false,
          OutroEndereco: {
            Cep: order.shipping_address.zipcode || order.billing_zipcode || "",
            Endereco: order.shipping_address.address || order.billing_address || "",
            Numero: order.shipping_address.number || order.billing_number || "",
            Complemento: order.billing_floor || order.shipping_address.complement || null,
            Bairro: order.shipping_address.locality || order.billing_locality || "",
            Cidade: order.shipping_address.city || order.billing_city || "",
            Uf: formatarUF(order.shipping_address.province) || formatarUF(order.billing_province) || "",
          },
        },
      };



      if (!orderData.CpfCnpj || !orderData.Produtos.length) {

        res.status(400).json({
          msg: "Dados do pedido inválidos. CPF/CNPJ ou produtos ausentes.",
        });
        return;
      }

      // 1. Primeiro, obtenha o token de autenticação
      const token = await authService.getAuthToken(serie, codFilial, api);
      const method = "post";

      const body = orderData;

      const { signature, timestamp } = generateSignature(
        method,
        senha,
        JSON.stringify(body)
      );
      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };
      const { data: idealSoftResponse } =
        await axios.post<NuvemShopResponseOrder>(`http://10.0.0.44:60002/vendas/`, body, {
          headers,
        });
      console.log("resposta de criar venda", idealSoftResponse);




      const recibo = idealSoftResponse.dados.recibo;
      console.log("meu", recibo);

      const MAX_RETRIES = 5;
      let retries = 0;


      const header = {
        "Content-Type": "application/json",
        authorization: req.headers.authorization,
        id: admin._id as string,
        recibo: recibo,
      };
      let sequenciaGerada = null;
      while (retries < MAX_RETRIES) {
        try {
          // Chama a API
          const respose = await axios.get<response_recibo>(
            `${process.env.API_BACKEND}/vendas`,
            {
              headers: header,
            }
          );
          if (respose.data.dados.sequenciaGerada) {
            sequenciaGerada = respose.data.dados.sequenciaGerada;

          }

          // Verifica o erro "Recibo ainda não processado."
          if (respose.data.dados.erros === "Recibo ainda não processado.") {
            console.log("Recibo ainda não processado. Tentando novamente...");
            retries++;
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5 segundos antes de tentar de novo
          } else if (respose.data.dados.erros !== null && respose.data.dados.erros.length > 0) {
            // Se houver outros erros, chama a função de envio de e-mail
            console.log("Erro encontrado:", respose.data.dados.erros);

            // Enviar e-mail para o usuários com `paymentAlert: true` com os dados da venda
            const emails = [];
            // Busca outros usuários com `paymentAlert: true` que pertencem à loja do admin
            const users = admin ? await User.find({ user_store_id: admin._id, paymentAlert: true }) : [];
            // Adiciona os emails dos usuários encontrados
            emails.push(...users.map(user => user.email));
            // Enviar e-mail com o erro
            await sendEmailError(emails, respose.data.dados.erros, order as unknown as Order);

            break; // Sai do loop se houver erro
          } else if (respose.data.dados.erros === null) {
            console.log("Recibo processado com sucesso:", respose.data.dados);
            break; // Sai do loop se o recibo foi processado
          }
        } catch (error) {
          console.error("Erro ao buscar a venda:", error);
          break; // Sai do loop em caso de erro
        }
      }

      if (retries === MAX_RETRIES) {
        console.log("Máximo de tentativas atingido. Recibo ainda não processado.");
      }



      /* fazer verificação se ja exitete uma ordem para esse id da nuvemshop para não criar novamete no mongo db so atualizar o recibo */
  /*     if (existorderdb) {
        console.log("Pedido já existe no banco de dados, atualizando recibo...", existorderdb);
        // Atualiza o pedido no banco de dados MongoDB
        await Orderdb.updateOne(
          { _id: existorderdb._id }, // filtro para encontrar o pedido específico
          { $set: { recibo_ideal: recibo, sequencia_ideal: sequenciaGerada } } // as alterações a serem feitas
        )
      } if (!existorderdb) {
        console.log("Pedido não encontrado no banco de dados, criando novo pedido...");
        const orderdb = new Orderdb({
          order_id_Nuvem: req.body.id,
          store_id: req.body.store_id,
          recibo_ideal: recibo,
          sequencia_ideal: sequenciaGerada || null,
          cpfCnpj: order.customer.identification,
          name: order.customer.name,
          total: parseFloat(order.total),
          products: order.products.map((product) => ({
            productId: product.product_id,
            name: product.name,
            quantity: product.quantity,
            price: parseFloat(product.price),
            discount: parseFloat(product.discount || "0"),
          })),
          paymentDetails: {
            installments: order.payment_details.installments,
            method: order.payment_details.method,
          },
          shippingAddress: {
            address: order.shipping_address.address,
            city: order.shipping_address.city,
            province: order.shipping_address.province,
            zipcode: order.shipping_address.zipcode,
          },
        });
        await orderdb.save();
      } */





    } catch (error: any) {

      console.log(error);
    }
  },
  get_order_cnuvemshop: async (req: Request, res: Response): Promise<void> => {
    // Definindo a estrutura da ordem de dados esperada para o Ideal Soft
    try {
      // Coletando dados do corpo da requisição
      const order_id = req.body.id;
      const store_id = req.body.store_id;

    

      console.log("Pedido recebido, processando...");


      if (!order_id || !store_id) {

        res
          .status(400)
          .json({ msg: "ID do pedido ou ID da loja não fornecido." });
        return;
      }

      const admin = await Admin.findOne({ nuvemshop_user_id: store_id });
      if (!admin) {

        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }

      // Obter credenciais usando o serviço

      const nuvemshopAccessToken = admin.nuvemshopAccessToken;
      const nuvemshopStoreId = admin.nuvemshop_user_id;

      const { data: order } = await axios.get<NuvemShopOrder>(
        `${process.env.NUVEMSHOP_API}/${nuvemshopStoreId}/orders/${order_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authentication: `bearer ${nuvemshopAccessToken}`,
            "User-Agent": `Your App Name ${process.env.APP_ID_NUVEMSHOP}`,
          },
        }
      );
      console.log(order);

      res.status(200).json(order);


    } catch (error: any) {

      console.log(error);
    }
  },
  order_paid_hook: async (req: Request, res: Response): Promise<void> => {

    try {
      const order_id = req.body.id;
      const store_id = req.body.store_id;



      let order: Order | null = null;
      const maxAttempts = 5; // Número máximo de tentativas
      let attempts = 0;
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); // Função para gerar o delay

      // Loop para tentar encontrar a ordem
      while (!order && attempts < maxAttempts) {
        order = await Orderdb.findOne<Order>({ order_id_Nuvem: order_id });
        console.log(order);
        if (!order) {

          await delay(2000); // Aguardar 2 segundos antes de tentar novamente
          attempts++;
        }
      }

      if (!order) {
        throw new Error("Ordem não encontrada após várias tentativas.");
      }

      const recibo = order.recibo_ideal;


      const admin = await Admin.findOne({ nuvemshop_user_id: store_id });
      if (!admin) {

        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }
      const credencial_user_id = admin._id as string;

      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(credencial_user_id);

      // 1. Primeiro, obtenha o token de autenticação
      const token = await authService.getAuthToken(serie, codFilial, api);

      const method = "get";
      const body = "";

      // Gerar assinatura para requisição GET
      const { signature, timestamp } = generateSignature(method, senha, body);

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

      if (order && data.dados.sequenciaGerada) {
        // Atualiza o pedido no banco de dados MongoDB
        await Order.updateOne(
          { _id: order._id }, // filtro para encontrar o pedido específico
          { $set: { status: "pago" } } // as alterações a serem feitas
        );

        // Atualiza o objeto 'order' localmente com os novos valores
        order.status = "pago";
        const emails = [];

        // Verifica se o admin tem `paymentAlert` como `true`
        if (admin.paymentAlert === true) {
          emails.push(admin.email);
        }

        // Busca outros usuários com `paymentAlert: true` que pertencem à loja do admin
        const users = await User.find({ user_store_id: admin._id, paymentAlert: true });

        // Adiciona os emails dos usuários encontrados
        emails.push(...users.map(user => user.email));

        console.log(emails);


        // Somente envia o e-mail se a sequência ideal tiver sido salva com sucesso
        if (order.sequencia_ideal) {
          await sendEmail(order, emails); // Passar os e-mails como argumento
        }
      }

      res.status(200).json({ msg: "Pedido pago, processamento em andamento" });

    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },

  /* buscar orders na nuvemshop */
  getOrders: async (req: Request, res: Response): Promise<void> => {
    try {
      /* pegar admin com id */
      const id_loja = req.headers.id as string;
      const user_store_id = req.headers.user_store_idd as string;
      const id_store = user_store_id ? user_store_id : id_loja
      const admin = await Admin.findById(id_store);

      if (!admin) {
        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }

      const nuvemshopAccessToken = admin.nuvemshopAccessToken;
      const nuvemshopStoreId = admin.nuvemshop_user_id;

      const { data } = await axios.get(
        `${process.env.NUVEMSHOP_API}/${nuvemshopStoreId}/orders`,

        {
          headers: {
            "Content-Type": "application/json",
            Authentication: `bearer ${nuvemshopAccessToken}`,
            "User-Agent": `Your App Name ${process.env.APP_ID_NUVEMSHOP}`,
          },
        }
      );


      res.status(201).json({
        msg: "Webhook listados com  sucesso!",
        data: data, // Retorna a resposta da Nuvemshop
      });
    } catch (error) {
      console.log(error);
    }
  },
};

export default venda_Schema;
