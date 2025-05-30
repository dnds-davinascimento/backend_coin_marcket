import { Request, Response } from "express";
import dotenv from "dotenv";
import { Types } from "mongoose";
import { uploadToS3 } from "../services/uploadToS3";
import nodemailer from "nodemailer";
import axios from "axios";
import { Produto } from "../models/product";
import { Loja } from "../models/loja";
import { obterCredenciais } from "../services/credenciaisService";
import { generateSignature } from "../services/generateSignature";
import authService from "../services/authService";
import Admin from "../models/Admin";
import User from "../models/user";
import { Categoria } from "../models/categoria";
dotenv.config(); // Carregar as variáveis de ambiente

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
      user: process.env.EMAIL, // Use suas variáveis de ambiente para segurança
      pass: process.env.PASSWORD, // Use suas variáveis de ambiente para segurança
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

  } catch (error) {

  }
};

interface ICategoria {
  id: Types.ObjectId;
  nome?: string;
}
interface tabelas_precos {
  nome: string;
  valor?: string;
  mostrar?: boolean;
  id?: string;
  promocional?: boolean;
}



interface IHistorico {
  usuario?: string;
  data: Date;
  acao: string;
  id_acao?: string | Types.ObjectId;
  desc?: string;
  estoqueAntesAlteracao: number;
  quantidade: number;
  estoqueAposAlteracao: number;
}


interface IProdutoBody {
  nome: string;
  categoria: ICategoria;
  codigo_interno?: string;
  codigo_da_nota?: string;
  seotitle?: string;
  seodescription?: string;
  codigo_ideal?: string;
  produto_sincronizado?: boolean;
  enderecamento?: string;
  codigo_de_barras?: string;
  codigo_do_fornecedor?: string;
  marca?: string;
  estoque_minimo?: number;
  estoque_maximo?: number;
  estoque?: number;
  estoque_vendido?: number;
  un: string;
  historico?: IHistorico[];
  preco_de_custo: number;
  preco_de_venda: number;
  ncm?: string;
  cest?: string;
  cst?: string;
  cfop?: string;
  origem_da_mercadoria?: string;
  peso_bruto_em_kg?: number;
  peso_liquido_em_kg?: number;
  icms?: number;
  ipi?: number;
  frete?: number;
  tabelas_precos?: tabelas_precos[];
  produto_da_loja?: string;
  produto_do_fornecedor?: string;
  produto_verify?: boolean;
  produto_marcket?: boolean;
  produto_de_rota?: boolean;
  produto_shared?: boolean;
  produto_servico?: boolean;
  mostrar_no_super_market?: boolean;
  imgs?: { url: string, key: string }[]; // Array de imagens, cada imagem é um objeto com a propriedade url

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
interface Response_ideal_product_pagination {
  sucesso: true;
  mensagem: null;
  tipo: null;
  complementoTipo: null;
  statusCode: 200;
  dados: [ProductIdeal];
}
interface responseCriarproduto {
  message: string;
  results: [results];
}
interface results {
  nuvemshopProductId: number;
  idealProductId: string;
  name: string;
  obs: string;
}
interface EstoqueFilial {
  codigoFilial: number;
  estoqueAtual: number;
}
interface EstoqueResponse {
  sucesso: boolean;
  mensagem: string | null;
  tipo: string | null;
  complementoTipo: string | null;
  statusCode: number;
  dados: {
    codigo: string;
    urlDetalhe: string;
    tipoEstoque: string;
    estoqueFiliais: EstoqueFilial[]; // EstoqueFiliais tipado aqui
  };
}

interface Preco {
  tabela: string;
  preco: number;
  promocional: boolean;
}
interface ProductDetalhesResponse {
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
  estoqueAtual: number | null;
  codigoFabricante: number;
  webObs1: string | null;
  webObs2: string | null;
  inativo: boolean;
  altura: number;
  largura: number;
  comprimento: number;
  codigoAdicional1: string;
  codigoAdicional2: string;
  codigoAdicional3: string;
  codigoAdicional4: string;
  codigoAdicional5: string;
  codigoBarras: string;
  urlDetalhe: string;
  urlEstoqueDetalhe: string;
  urlTabelaPreco: string;
  urlPromocoes: string;
  urlFotos: string;
  nomeSite: string;
  estoqueFiliais: EstoqueFilial[]; // Adicionando estoqueFiliais
  precos: Preco[]; // Adicionando precos
}
interface PrecoResponse {
  sucesso: boolean;
  mensagem: string | null;
  tipo: string | null;
  complementoTipo: string | null;
  statusCode: number;
  dados: {
    codigo: string;
    precos: Preco[]; // Precos tipado aqui
  };
}
interface Subcategoria {
  id: string;
  nome: string;
  _id: string;
}

interface CategoriaData {
  _id: string;
  nome: string;
  codigo_ideal: number;
  categoriaDestaque: boolean;
  categoria_da_loja: string;
  subcategorias: Subcategoria[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CategoriaResponse {
  success: boolean;
  message: string;
  data: CategoriaData;
}
interface ApiResponse {
  sucesso: boolean;
  mensagem: string | null;
  tipo: string | null;
  complementoTipo: string | null;
  statusCode: number;
  dados: {
    codigo: string;
    fotos: Foto[];
  };
}

interface Foto {
  posicao: number;
  principal: boolean;
}
interface responseIA {
  output: string;
}


const produto_Schema = {

  createProduct: async (req: Request, res: Response) => {

    const { nome, categoria,
      codigo_interno,
      codigo_da_nota,
      enderecamento,
      codigo_de_barras,
      codigo_do_fornecedor,
      marca,
      estoque_minimo,
      estoque_maximo,
      estoque,
      estoque_vendido,
      un,
      preco_de_custo,
      preco_de_venda,
      ncm,
      cest,
      cst,
      cfop,
      origem_da_mercadoria,
      peso_bruto_em_kg,
      peso_liquido_em_kg,
      icms,
      ipi,
      frete,
      produto_do_fornecedor,
      produto_verify = false, // Valor padrão
      produto_marcket = false, // Valor padrão
      produto_de_rota = false, // Valor padrão
      produto_shared = false, // Valor padrão
      produto_servico = false, // Valor padrão
      mostrar_no_super_market = false, // Valor padrão
      imgs = [], // Array de imagens, pode ser vazio ou conter objetos com a propriedade url

    } = req.body.produto as IProdutoBody;


    const id_loja = req.headers.user_store_id as string;



    const loja = await Loja.findById(id_loja); // Busca a loja pelo ID
    if (!loja) {
      res.status(404).json({ msg: "Loja não encontrada." });
      return;
    }
    const id_store = loja._id; // ID da loja

    try {
      const produto = await Produto.create({
        nome,
        categoria,
        codigo_interno,
        codigo_da_nota,
        enderecamento,
        codigo_de_barras,
        codigo_do_fornecedor,
        marca,
        estoque_minimo,
        estoque_maximo,
        estoque,
        estoque_vendido,
        un,
        preco_de_custo,
        preco_de_venda,
        ncm,
        cest,
        cst,
        cfop,
        origem_da_mercadoria,
        peso_bruto_em_kg,
        peso_liquido_em_kg,
        icms,
        ipi,
        frete,
        produto_da_loja: id_store,
        produto_do_fornecedor,
        produto_verify,
        produto_marcket,
        produto_de_rota,
        produto_shared,
        produto_servico,
        mostrar_no_super_market,

        produto_sincronizado: false,
        imgs, // Inicializa o array de imagens vazio
        historico: [
          {
            usuario: "Sistema",
            data: new Date(),
            acao: "Cadastro",
            id_acao: new Types.ObjectId(),
            desc: "Produto cadastrado",
            estoqueAntesAlteracao: 0,
            quantidade: estoque || 0,
            estoqueAposAlteracao: estoque || 0,
          },
        ],





      });

      res.status(201).json(produto);
    } catch (error) {

      res.status(500).json({ message: "Erro ao criar produto" });
    }
  },
  /* buscar produtos por loja*/
  getProductsByStore: async (req: Request, res: Response) => {
    let id_loja = req.headers.user_store_id as string;
    if (!id_loja) {
      id_loja = "6807ab4fbaead900af4db229"
    }
    const { nome, categoria, codigo_interno } = req.query;

    const query: any = {
      produto_da_loja: id_loja, // Filtro para buscar produtos da loja específica
    };

    if (nome) {
      query.nome = { $regex: new RegExp(nome as string, "i") };
    }

 if (categoria) {
  if (typeof categoria === 'string') {
    const subcategoria = await Categoria.findById(categoria);
    
    // Ajuste: Verifique se subcategoria possui um campo que identifica subcategoria, por exemplo, 'parient' ou similar
    if (subcategoria && (subcategoria as any).parient) {
      query["categoria.subcategorias.id"] = new Types.ObjectId(categoria); // Subcategoria
    } else {
      query["categoria.id"] = new Types.ObjectId(categoria); // Categoria normal (id como string)
    }

  } else if (typeof categoria === 'object' && categoria) {
    query["categoria"] = new Types.ObjectId(
      typeof categoria === "string" ? categoria : Array.isArray(categoria) && typeof categoria[0] === "string"
        ? categoria[0]
        : ""
    ); // Objeto com id
  }
}


    if (codigo_interno) {
      query.codigo_interno = { $regex: new RegExp(codigo_interno as string, "i") };
    }

    try {
      const loja = await Loja.findById(id_loja);

      if (!loja) {
        return res.status(404).json({ msg: "Loja não encontrada." });
      }

      const produtos = await Produto.find(query);



      return res.status(200).json(produtos);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  },
  /* buscar produtos por id*/
  getProductById: async (req: Request, res: Response) => {
    const id = req.params.id; // Pega o ID do produto dos parâmetros da rota
    try {
      const produto = await Produto.findById(id);
      if (!produto) {
        res.status(404).json({ msg: "Produto não encontrado." });
        return;
      }
      res.status(200).json(produto);
    } catch (error) {

      res.status(500).json({ message: "Erro ao buscar produto" });
    }
  },
  /* deletar produto por id*/
  deleteProductById: async (req: Request, res: Response) => {
    const id = req.params.id; // Pega o ID do produto dos parâmetros da rota
    try {
      const produto = await Produto.findByIdAndDelete(id);
      if (!produto) {
        res.status(404).json({ msg: "Produto não encontrado." });
        return;
      }
      res.status(200).json({ msg: "Produto deletado com sucesso." });
    } catch (error) {

      res.status(500).json({ message: "Erro ao deletar produto" });
    }
  },
  /* atualizar produto por id*/
  updateProductById: async (req: Request, res: Response) => {
    const id = req.params.id; // Pega o ID do produto dos parâmetros da rota
    /* ver se o produto existe */
    const produto = await Produto.findById(id);
    if (!produto) {
      res.status(404).json({ msg: "Produto não encontrado." });
      return;
    }
    const { nome, categoria,
      codigo_interno,
      codigo_da_nota,
      enderecamento,
      codigo_de_barras,
      codigo_do_fornecedor,
      marca,
      estoque_minimo,
      estoque_maximo,
      estoque,
      estoque_vendido,
      un,
      imgs,
      preco_de_custo,
      preco_de_venda,
      ncm,
      cest,
      cst,
      cfop,
      origem_da_mercadoria,
      peso_bruto_em_kg,
      peso_liquido_em_kg,
      icms,
      ipi,
      frete,
      produto_do_fornecedor,
      produto_verify = false, // Valor padrão
      produto_marcket = false, // Valor padrão
      produto_de_rota = false, // Valor padrão
      produto_shared = false, // Valor padrão
      produto_servico = false, // Valor padrão
      mostrar_no_super_market = false, // Valor padrão
    } = req.body.produto as IProdutoBody; // Pega os dados do produto do corpo da requisição

    // Pega as imagens do corpo da requisição, se não houver, inicializa como array vazio
    try {
      produto.nome = nome || produto.nome;
      produto.categoria = categoria || produto.categoria;
      produto.codigo_interno = codigo_interno || produto.codigo_interno;
      produto.codigo_da_nota = codigo_da_nota || produto.codigo_da_nota;
      produto.enderecamento = enderecamento || produto.enderecamento;
      produto.codigo_de_barras = codigo_de_barras || produto.codigo_de_barras;
      produto.codigo_do_fornecedor = codigo_do_fornecedor || produto.codigo_do_fornecedor;
      produto.marca = marca || produto.marca;
      produto.estoque_minimo = estoque_minimo || produto.estoque_minimo;
      produto.estoque_maximo = estoque_maximo || produto.estoque_maximo;
      produto.estoque = estoque || produto.estoque;
      produto.estoque_vendido = estoque_vendido || produto.estoque_vendido;
      produto.un = un || produto.un;
      produto.preco_de_custo = preco_de_custo || produto.preco_de_custo;
      produto.preco_de_venda = preco_de_venda || produto.preco_de_venda;
      produto.ncm = ncm || produto.ncm;
      produto.cest = cest || produto.cest;
      produto.cst = cst || produto.cst;
      produto.cfop = cfop || produto.cfop;
      produto.origem_da_mercadoria = origem_da_mercadoria || produto.origem_da_mercadoria;
      produto.peso_bruto_em_kg = peso_bruto_em_kg || produto.peso_bruto_em_kg;
      produto.peso_liquido_em_kg = peso_liquido_em_kg || produto.peso_liquido_em_kg;
      produto.icms = icms || produto.icms;
      produto.ipi = ipi || produto.ipi;
      produto.frete = frete || produto.frete;
      produto.produto_do_fornecedor = produto_do_fornecedor
        ? (typeof produto_do_fornecedor === 'string' ? new Types.ObjectId(produto_do_fornecedor) : produto_do_fornecedor)
        : produto.produto_do_fornecedor;
      produto.produto_verify = produto_verify || produto.produto_verify;
      produto.produto_marcket = produto_marcket || produto.produto_marcket;
      produto.produto_de_rota = produto_de_rota || produto.produto_de_rota;
      produto.produto_shared = produto_shared || produto.produto_shared;
      produto.produto_servico = produto_servico || produto.produto_servico;
      produto.mostrar_no_super_market = mostrar_no_super_market || produto.mostrar_no_super_market;
      produto.imgs = imgs && imgs.length > 0 ? [imgs[0]] : undefined; // Atualiza as imagens do produto, se houver novas imagens no corpo da requisição
      const id_acao = new Types.ObjectId(); // Gera um novo ID para a ação
      (produto.historico ??= []).push({
        usuario: "Sistema",
        data: new Date(),
        acao: "Atualização",
        id_acao: `${id_acao}`,
        desc: "Produto atualizado",
        estoqueAntesAlteracao: produto.estoque ?? 0,
        quantidade: estoque || 0,
        estoqueAposAlteracao: estoque || 0,
      });
      // Atualiza o produto no banco de dados
      await produto.save();





      if (!produto) {
        res.status(404).json({ msg: "Produto não encontrado." });
        return;
      }
      res.status(200).json(produto);
    } catch (error) {

      res.status(500).json({ message: "Erro ao atualizar produto" });
    }
  },
  sincProducts: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_loja = req.headers.user_store_id as string;
      const user_store_id = req.headers.id as string;

      res.status(200).json({ msg: "Sincronização de produtos iniciada. Após o término da sincronização, você receberá um email." });
      console.log("Sincronização de produtos iniciada.");
      // Obter as credenciais do usuário
      const { serie, api, codFilial, senha } = await obterCredenciais(id_loja);

  const url_ideal = process.env.PRODUTION === "true" ? api : `${process.env.URL_IDEAL_LOCAL}`;


      // Obter o token de autenticação para Idealsoft
      const token = await authService.getAuthToken(serie, codFilial, api);
      const method = "get";
      const body = "";
      const { signature, timestamp } = generateSignature(method, senha, body);

      const headersIdeal = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };

      // Buscar as informações do admin
      const admin = await Admin.findById(user_store_id);
      if (!admin) {
        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }

      // Marcar o início da sincronização
      const inicioSincronizacao = Date.now();
      let paginaIdeal = 1;
      let produtosIdeal: ProductIdeal[] = [];
      let fimDePagina = false;
      let produtosCadastrados = 0;
      const modoTeste = false; // Coloca como false quando for pra produção
      let produtosDetalhes: Array<{
        nome: string;
        codigo_ideal: string;
        quantidade: number;
        preco: number;
        custo: number;
      }> = [];

      // Loop para buscar todos os produtos da Shop9 por paginação
      while (!fimDePagina) {
        const { data: produtosPagina } =
          await axios.get<Response_ideal_product_pagination>(
            `${url_ideal}/produtos/${paginaIdeal}`,
            { headers: headersIdeal }
          );

        produtosIdeal = produtosIdeal.concat(produtosPagina.dados);

        if (

          produtosPagina.tipo === "FIM_DE_PAGINA"
        ) {
          fimDePagina = true;
        } else {
          paginaIdeal++;
          console.log(
            `Página ${paginaIdeal} de produtos da Shop9: ${produtosIdeal.length}`
          );
        }
       
      }

      console.log(`Total de produtos pegos na Shop9: ${produtosIdeal.length}`);
      // Comparação e atualização de preços
      for (const produto of produtosIdeal) {
        if (!produto || !produto.codigo) {

          continue; // Pular para o próximo produto
        }

        if (produto.observacao3) {
          console.log("Produto:", produto);



          const existingProduct = await Produto.findOne({
            codigo_ideal: produto.codigo,
          });

          /* caso o produto não exita chamar a afunção para salvalo na nuvem shop */
          if (!existingProduct) {

            const headers = {
              "Content-Type": "application/json",
              authorization: req.headers.authorization,
              id: "6807a4d7860872fd82906b3f",
              user_store_id: "6807ab4fbaead900af4db229" as string,
            };
            const respose = await axios.post<responseCriarproduto>(
              `${process.env.URL_BACKEND}/api/postsingleProductsNuvemShop`,
              produto,
              {
                headers,
              }
            );
            console.log("Resposta da criação do produto:", respose.data);
            produtosCadastrados++;










          }
        }

      }


            // Enviar email após a sincronização
            const emails = [];
            if (admin.paymentAlert === true) {
              emails.push(admin.email);
            }
            // Busca outros usuários com `paymentAlert: true` que pertencem à loja do admin
            const users = admin ? await User.find({ user_store_id: admin._id, paymentAlert: true }) : [];
            // Adiciona os emails dos usuários encontrados
            emails.push(...users.map(user => user.email));
            // Enviar e-mail com o erro


      // Calcular o tempo total de sincronização
            const fimSincronizacao = Date.now();
            const tempoTotal = (fimSincronizacao - inicioSincronizacao) / 1000; // em segundos
            console.log(`Tempo total de sincronização: ${tempoTotal} segundos`);
            await sendEmail(
              emails,
              produtosIdeal.length,
              produtosCadastrados,
              tempoTotal
            );


    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },
  getProdutodetalhes: async (req: Request, res: Response): Promise<void> => {
    // Tipagem das respostas

    try {
      const id_loja = req.headers.user_store_id as string;
      const user_store_id = req.headers.id as string;

      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(id_loja);
  const url_ideal = process.env.PRODUTION === "true" ? api : `${process.env.URL_IDEAL_LOCAL}`;
      // 1. Obtenha o token de autenticação
      const token = await authService.getAuthToken(serie, codFilial, api);

      const codigoProduto = req.query.codigo;

      if (!codigoProduto) {
        res
          .status(400)
          .json({ msg: "Código do produto não fornecido nos headers" });
        return;
      }

      const method = "get";
      const body = ""; // Requisição GET, corpo vazio
      const { signature, timestamp } = generateSignature(method, senha, body);

      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };

      // 2. Fazer a chamada para pegar o objeto produto com as URLs
      const { data: produtoDetalhes } = await axios.get<{
        dados: ProductDetalhesResponse;
      }>(`${url_ideal}/produtos/detalhes/${codigoProduto}`, { headers });

      // Agora que temos as URLs, vamos realizar as outras requisições (estoque, preços)
      const urlEstoque = `${url_ideal}/estoque/${codigoProduto}`;
      const urlPrecos = `${url_ideal}/precos/${codigoProduto}`;

      const [estoqueResponse, precoResponse] = await Promise.all([
        axios.get<EstoqueResponse>(urlEstoque, { headers }), // Tipando a resposta de estoque
        axios.get<PrecoResponse>(urlPrecos, { headers }), // Tipando a resposta de preços
      ]);

      // Consolidar as respostas dentro do objeto produto
      const resultadoFinal = {
        produto: {
          ...produtoDetalhes.dados, // Dados do produto
          estoqueFiliais: estoqueResponse.data.dados.estoqueFiliais || [], // Dados de estoque
          precos: precoResponse.data.dados.precos || [], // Dados de preços
        },
      };

      // Retornar o resultado consolidado
      res.status(200).json(resultadoFinal);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },
  postsingleProductsNuvemShop: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id_loja = req.headers.user_store_id as string;
      const user_store_id = req.headers.id as string;



      const product = req.body; // O corpo da requisição deve conter o array de 
      console.log("Produto recebido:", product);

      const results = []; // Array para armazenar os resultados dos produtos enviados

      try {
        // Verificar se o Produto ja exite no MongoDB
        const existingProduct = await Produto.findOne({
          codigo_ideal: product.codigo,
        });
        console.log("Produto existente:", existingProduct);

        if (existingProduct) {
          // Produto já está cadastrado
          res.status(200).json({ msg: "já estava cadastrado" });
          return;
        }
        const codigoClasse = String(product.codigoClasse); // Código da classe que você quer filtrar
        /* fazer requisição para saber se ja existe */
        const headers = {
          "Content-Type": "application/json",
          authorization: req.headers.authorization,
          id: "6807a4d7860872fd82906b3f",
          user_store_id: "6807ab4fbaead900af4db229" as string,
        };
        const bodyCategoria = {
          categoria_codigo: codigoClasse,
        }
        const { data: resposeCategoria } = await axios.post<CategoriaResponse>(
          `${process.env.URL_BACKEND}/api/createCategoriaShop9`,
          bodyCategoria,
          {
            headers,
          }
        );
        console.log("Resposta da criação de categoria:", resposeCategoria);

        const codigoSubClasse = String(product.codigoSubclasse);

        const bodySubCategoria = {
          subcategoria_codigo: codigoSubClasse,
          parient: resposeCategoria.data.codigo_ideal, // Usando o ID da categoria criada
        };
        const { data: resposeSubCategoria } = await axios.post<CategoriaResponse>(
          `${process.env.URL_BACKEND}/api/createSubCategoriaShop9`,
          bodySubCategoria,
          {
            headers,
          }
        );
        console.log("Resposta da criação de subcategoria:", resposeSubCategoria);
        const categoriaProduto = {
          id: resposeCategoria.data._id, // Usando o ID da subcategoria criada
          nome: resposeCategoria.data.nome, // Nome da categoria
          subcategorias: {
            id: resposeSubCategoria.data._id, // Usando o ID da subcategoria criada
            nome: resposeSubCategoria.data.nome, // Nome da subcategoria
          },
        };
        const tabelas_precos = product.precos.map((preco: { tabela: string; preco: number; promocional: boolean }) => ({
          nome: preco.tabela,
          valor: preco.preco.toFixed(2),
          promocional: preco.promocional
        }));


        // Criar o produto no MongoDB
        const novoProduto = await Produto.create({
          nome: product.nome,
          categoria: categoriaProduto,
          codigo_interno: product.codigo,
          codigo_da_nota: product.codigo,
          seotitle: product.nome,
          seodescription: product.webObs1 || "",
          codigo_ideal: product.codigo,
          produto_sincronizado: true, // Marca como sincronizado
          enderecamento: product.urlDetalhe || "",
          codigo_de_barras: product.codigoBarras || "",
          codigo_do_fornecedor: product.codigoFabricante ? String(product.codigoFabricante) : "",
          marca: product.nomeSite || "",
          estoque_minimo: 0, // Defina o valor padrão ou obtenha do produto
          estoque_maximo: 0, // Defina o valor padrão ou obtenha do produto
          estoque: product.estoqueAtual || 0, // Usando estoqueAtual do produto
          estoque_vendido: 0, // Inicializando como 0
          un: "un", // Unidade de medida padrão
          preco_de_custo: product.precos[0]?.preco || 0, // Usando o primeiro preço como custo
          preco_de_venda: product.precos[0]?.preco || 0, // Usando o primeiro preço como venda
          ncm: "", // Defina o NCM conforme necessário
          cest: "", // Defina o CEST conforme necessário
          cst: "", // Defina o CST conforme necessário
          cfop: "", // Defina o CFOP conforme necessário
          origem_da_mercadoria: "", // Defina a origem da mercadoria conforme necessário
          peso_bruto_em_kg: product.pesoBruto || 0, // Usando pesoBruto do produto
          peso_liquido_em_kg: product.pesoLiquido || 0, // Usando pesoLiquido do produto
          icms: 0, // Defina o ICMS conforme necessário
          ipi: 0, // Defina o IPI conforme necessário
          frete: 0, // Defina o frete conforme necessário
          tabelas_precos, // Inicializando como array vazio ou preencher conforme necessário
          produto_da_loja: id_loja,
          produto_do_fornecedor: id_loja,
        });
        /* salvar o produto */
        console.log("Novo produto criado:", novoProduto);

        /* sincronizar img */
        const response_img = await axios.post(
          `${process.env.URL_BACKEND}/api/sinc_img_Product`,
          product,
          { headers }
        );
        console.log("Imagens sincronizadas:", response_img.data);
        /* generate metados IA */
        const response_IA = await axios.post<responseIA>(
          `${process.env.URL_BACKEND}/api/sinc_metadados_IA`,
          product,
          { headers }
        );
        console.log("Metadados IA gerados:", response_IA.data);



        // Adicionar o resultado ao array de resultados
        results.push({
          nuvemshopProductId: novoProduto._id,
          idealProductId: product.codigo,
          name: product.nome,
          obs: product.webObs1 || "",
        });
        console.log("Produto adicionado aos resultados:", results[results.length - 1]);





      } catch (error: any) {
        console.log(error);
        results.push({ error: error.message }); // Registra o erro no array de resultados
      }
      // Retornar os resultados
      res.status(200).json({
        message: "Produtos processados com sucesso",
        results: results,
      });


    } catch (error) {
      console.error("Erro no servidor:", error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },
  sinc_img_Product: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_loja = req.headers.user_store_id as string;
      const user_store_id = req.headers.id as string;





        const { serie, api, codFilial, senha } = await obterCredenciais(id_loja);
  const url_ideal = process.env.PRODUTION === "true" ? api : `${process.env.URL_IDEAL_LOCAL}`;
      // Obter o token de autenticação para Idealsoft
      const token = await authService.getAuthToken(serie, codFilial, api);
      const method = "get";
      const body = "";
      const { signature, timestamp } = generateSignature(method, senha, body);

      const headersIdeal = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };

      const products = req.body; // O corpo da requisição deve conter o array de produtos

      const results = [];
    
        try {
          // Verificar se o Produto já existe no MongoDB
          const existingProduct = await Produto.findOne({
            codigo_ideal: products.codigo,
          });

          if (!existingProduct) {

            results.push({
              error: `Produto com código ${products.codigo} não encontrado no MongoDB.`,
            });
            return; // Pular para o próximo produto se não existir
          }

          // Obtendo a posição das imagens dos produtos da Idealsoft
          const { data: imgProductposition } = await axios.get<ApiResponse>(
            `${url_ideal}/fotos/${existingProduct.codigo_ideal}`,
            {
              headers: headersIdeal,
            }
          );

          // Verificar se o produto tem fotos
          if (imgProductposition.dados.fotos.length === 0) {

            results.push({
              error: `Produto com código ${existingProduct.codigo_ideal} não possui fotos.`,
            });
            return; // Pular para o próximo produto se não houver fotos
          }

          const productId = existingProduct.codigo_ideal; // Obtendo o ID do produto criado

          if (!productId) {

            results.push({
              error: `Produto com código ${existingProduct.codigo_ideal} não possui ID.`,
            });
            return; // Pular para o próximo produto se não houver ID
          }

          // Loop para buscar cada foto com base na posição
          for (const foto of imgProductposition.dados.fotos) {
            // Obter a imagem do produto da Idealsoft em base64 para cada posição
            const { data: imgProduct } = await axios.get<ArrayBuffer>(
              `${url_ideal}/fotos/${existingProduct.codigo_ideal}/${foto.posicao}`,
              {
                headers: headersIdeal,
                responseType: "arraybuffer", // Garantir que estamos recebendo um array de bytes (binário)
              }
            );
            

            // Converte a resposta binária para base64
            const base64Img = Buffer.from(new Uint8Array(imgProduct)).toString(
              "base64"
            );
            // Monta a URL da imagem
            const { url, key } = await uploadToS3(base64Img, `products`, `img-${foto.posicao}`);

            // Adiciona a imagem ao produto existente
            if (!Array.isArray(existingProduct.imgs)) {
              existingProduct.imgs = [{ url: "", key: "" }];
            }
            existingProduct.imgs.push({ url, key });
            await existingProduct.save();


          }

          results.push(
            `Imagens do produto ${existingProduct.codigo_ideal} foram adicionadas com sucesso.`
          );
        } catch (error: any) {
          console.log(
            `Erro ao processar o produto ${products.codigo}: ${error.message}`
          );
          results.push({
            error: `Erro ao adicionar imagem para o produto ${products.codigo}: ${error.message}`,
          });
        }
    

      res.status(200).json(results);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },
   sinc_metadados_IA: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Pegar o admin com id
      const id_loja = req.headers.user_store_id as string;
      const user_store_id = req.headers.id as string;


      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(id_loja);
  const url_ideal = process.env.PRODUTION === "true" ? api : `${process.env.URL_IDEAL_LOCAL}`;
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

      const product = req.body; // O corpo da requisição deve conter o array de produtos

      const results = []; // Array para armazenar os resultados dos produtos enviados

 
        try {
          // Verificar se o Produto já existe no MongoDB
           const existingProduct = await Produto.findOne({
          codigo_ideal: product.codigo,
        });

          if (!existingProduct) {
            console.log(`Produto ${product.id} não encontrado no MongoDB`);
            results.push({
              error: `Produto com ID ${product.id} não encontrado no MongoDB.`,
            });
            return; // Adicionado para evitar uso de existingProduct nulo
          }
          // 2. Fazer a chamada para pegar o objeto produto com as URLs
          const { data: produtoDetalhes } = await axios.get<{
            dados: ProductDetalhesResponse;
          }>(`${url_ideal}/produtos/detalhes/${existingProduct.codigo_ideal}`, {
            headers,
          });

          if (!produtoDetalhes.dados.observacao1) {
            results.push({
              msg: `Insira uma descrição no produto:${existingProduct?.codigo_ideal} dentro da shop9`,
            });
            
          }
          
          // Envia a requisição para a Nuvemshop para deletar o produto
          const { data: iaagente } = await axios.post<responseIA>(
            `https://n8n.croi.tech/webhook/9e21a663-8494-432b-841c-8c69603886c4`,
            {
              nome_produto: String(produtoDetalhes.dados.nome),
              "descricaotecnica ": String(produtoDetalhes.dados.observacao1),
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!iaagente) {
            res.status(500).json({ msg: "deuerrado" });
          }

          // Função para extrair dados entre as tags
          function extractBetweenTags(text: string, tag: string) {
            const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, "s"); // 's' para pegar múltiplas linhas
            const match = text.match(regex);
            return match ? match[1].trim() : null;
          }

          // Acessando o campo 'output' do array e separando os elementos
          const output = iaagente.output; // Pegando o primeiro item do array
          const seoTitle = extractBetweenTags(output, "seo_title");
          const seoDescription = extractBetweenTags(output, "seo_description");
          const productCopy = extractBetweenTags(output, "product_copy");
          const productSpecs = extractBetweenTags(output, "product_specs");
          

          const productData =     {
              description: `
              <p>${productCopy}</p>\n</br>
              Código:${existingProduct?.codigo_ideal}\n</br>
              <p>${productSpecs}</p>`,
              seo_title: seoTitle,
              seo_description: seoDescription,
            }
          // Atualizando o produto no MongoDB com os dados gerados
            existingProduct.seotitle = seoTitle ?? undefined;
          existingProduct.seodescription = seoDescription ?? undefined;
            existingProduct.description = productData.description;
            /* salvar */
          await existingProduct.save();

          results.push(
            `Descrição e Metadados Gerados com sucesso Produto:${product.codigo}`
          );
        } catch (error: any) {
          console.log(error);
          // Caso ocorra um erro ao tentar excluir o produto na Nuvemshop
          results.push({
            error: error.message,
            idealProductId: product.codigo,
            obs: "Erro ao tentar deletar produto", // Registra o erro no array de resultados
          });
        }
      

      res.status(200).json(results);
    } catch (error) {
      console.error("Erro no servidor:", error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },



};

export default produto_Schema;
