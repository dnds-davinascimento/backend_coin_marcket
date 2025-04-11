import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import Admin from "../models/Admin"; // Importa o model Admin
import Auxiliares from "../models/auxiliares"; // Importa o model Admin
import Product from "../models/product";
import { generateSignature } from "../services/generateSignature";
import authService from "../services/authService";
import { obterCredenciais } from "../services/credenciaisService";
import nodemailer from "nodemailer";
import User from "../models/user";
dotenv.config(); // Carregar as variáveis de ambiente
interface Response_ideal_product_pagination {
  sucesso: true;
  mensagem: null;
  tipo: null;
  complementoTipo: null;
  statusCode: 200;
  dados: [ProductIdeal];
}
interface ProductIdeal {
  na_nuvem: boolean;
  ordem: number;
  codigo: string;
  nome: string;
  extra1: string;
  extra2: string;
  extra3: string;
  observacao1: string;
  observacao2: string;
  observacao3: string;
  tipo: number;
  codigoClasse: number;
  codigoSubclasse: number;
  codigoGrupo: number;
  codigoMoeda: number;
  codigoFamilia: number;
  codigoUnidadeVenda: number;
  codigoPesquisa1: number;
  codigoPesquisa2: number;
  codigoPesquisa3: number;
  pesoLiquido: number;
  pesoBruto: number;
  estoqueAtual: number;
  codigoFabricante: number;
  webObs1: string | null;
  webObs2: string | null;
  inativo: boolean;
  altura: number | null;
  largura: number | null;
  comprimento: number | null;
  codigoAdicional1: string | null;
  codigoAdicional2: string | null;
  codigoAdicional3: string | null;
  codigoAdicional4: string | null;
  codigoAdicional5: string | null;
  codigoBarras: string;
  urlDetalhe: string;
  urlEstoqueDetalhe: string;
  urlTabelaPreco: string;
  urlPromocoes: string;
  urlFotos: string;
  precos: {
    tabela: string;
    preco: number;
    promocional: boolean;
  }[];
  nomeSite: string;
}
// Função de envio de e-mail atualizada
const sendEmail = async (
  emails: string[],
  produtosShop9: number,
  produtosCadastrados: number,
  tempoTotal: number
) => {
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
    subject: `Relatório de Sincronização - ${new Date().toLocaleDateString()}`,
    html: `
      <h1>Relatório de Sincronização de Produtos</h1>
      <p><strong>Produtos encontrados na Shop9:</strong> ${produtosShop9}</p>
      <p><strong>Produtos cadastrados na Nuvemshop:</strong> ${produtosCadastrados}</p>
      <p><strong>Tempo total de sincronização:</strong> ${tempoTotal.toFixed(2)} segundos</p>
      <hr>
      <p>Este é um e-mail automático, por favor não responda.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de relatório enviado com sucesso');
  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
};
// Nova função de e-mail específica para alterações de preço
const sendPriceEmail = async (
  emails: string[],
  alteracoes: Array<{
    codigo: string;
    nome: string;
    precoAntigo: number;
    precoNovo: number;
  }>,
  tempoTotal: number
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "venda.croi.ns@gmail.com",
      pass: "dehq eejp kpql xcjc",
    },
  });

  const formatCurrency = (value: number) => 
    `R$ ${value.toFixed(2).replace('.', ',')}`;

  const mailOptions = {
    from: "venda.croi.ns@gmail.com",
    to: emails,
    subject: `Relatório de Atualização de Preços - ${new Date().toLocaleDateString()}`,
    html: `
      <h1>Relatório de Atualização de Preços</h1>
      <p><strong>Tempo total de sincronização:</strong> ${tempoTotal.toFixed(2)} segundos</p>
      <p><strong>Produtos alterados:</strong> ${alteracoes.length}</p>
      
      ${alteracoes.length > 0 ? `
        <table border="1" cellpadding="5" style="border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th>Código</th>
              <th>Produto</th>
              <th>Preço Anterior</th>
              <th>Novo Preço</th>
              <th>Variação</th>
            </tr>
          </thead>
          <tbody>
            ${alteracoes.map(alt => `
              <tr>
                <td>${alt.codigo}</td>
                <td>${alt.nome}</td>
                <td>${formatCurrency(alt.precoAntigo)}</td>
                <td>${formatCurrency(alt.precoNovo)}</td>
                <td style="color: ${alt.precoNovo > alt.precoAntigo ? 'red' : 'green'}">
                  ${((alt.precoNovo / alt.precoAntigo - 1) * 100).toFixed(2)}%
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `<p style="margin-top: 20px;">Nenhum preço foi alterado durante a sincronização.</p>`}
      
      <hr style="margin-top: 30px;">
      <p>Este é um e-mail automático, por favor não responda.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de alterações de preço enviado');
  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
};

const produto_Schema = {
  // pegar produtos por parginação da idealsoft
  getIdealsoft: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_loja = req.headers.id as string;
      const user_store_id = req.headers.user_store_idd as string;
      const id_store = user_store_id ? user_store_id : id_loja;

      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(id_store);

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
      let pagina = req.query.page;

      // 3. Requisição para a API da Idealsoft com os headers
      const { data } = await axios.get<Response_ideal_product_pagination>(
        `${api}/produtos/${pagina || 1}`,
        {
          headers,
        }
      );

      if (data.dados && data.dados.length > 0) {
        for (const produto of data.dados) {
          // Verificando se o produto já existe no MongoDB
          const produtoExistente = await Product.findOne({
            idealProductId: produto.codigo,
          });

          if (produtoExistente) {
            // Se existir, adiciona o atributo com o valor já presente
            produto.na_nuvem = true;
          } else {
            // Se não existir, adiciona o atributo com o valor 'false'
            produto.na_nuvem = false;
          }
        }
      }

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },

};

export default produto_Schema;
