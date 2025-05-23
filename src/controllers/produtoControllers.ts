import { Request, Response } from "express";
import dotenv from "dotenv";
import { Types } from "mongoose";
import User from "../models/user";
import nodemailer from "nodemailer";
import axios from "axios";
import { Produto } from "../models/product";
import { Loja } from "../models/loja";
import { obterCredenciais } from "../services/credenciaisService";
import { generateSignature } from "../services/generateSignature";
import authService from "../services/authService";
import Admin from "../models/Admin";
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
  imgs?: [{ url: string }];

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
      // Correção: Verifica se a categoria existe antes de acessar .id
      query["categoria.id"] = categoria; // Alternativa mais segura
      // Ou se sua estrutura for diferente:
      // query.categoria = { id: categoria };
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
      produto.imgs = imgs; // Atualiza as imagens do produto, se houver novas imagens no corpo da requisição
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
            `http://10.0.0.44:60002/produtos/${paginaIdeal}`,
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
        if(modoTeste) break
      }

      console.log(`Total de produtos pegos na Shop9: ${produtosIdeal.length}`);
      // Comparação e atualização de preços
      for (const produto of produtosIdeal) {
        console.log("Produto:", produto.observacao2);
        if (produto.observacao3){
          console.log("Produto:", produto);
        }
        if (!produto || !produto.codigo) {
        
          continue; // Pular para o próximo produto
        }

        const existingProduct = await Produto.findOne({
          idealProductId: produto.codigo,
        });

        /* caso o produto não exita chamar a afunção para salvalo na nuvem shop */
        if (!existingProduct) {
         

          const tabela1 = produto.precos?.find(
            (preco) => preco.tabela === "SITE"
          );
          const custo = produto.precos?.find(
            (preco) => preco.tabela === "CUSTO"
          );
          const preco_Avista = produto.precos?.find(
            (preco) => preco.tabela === "A VISTA"
          );
          produtosDetalhes.push({
            nome: produto.nome,
            codigo_ideal: produto.codigo,
            quantidade: Number(produto?.estoqueAtual),
            preco: tabela1?.preco ?? 10000,
            custo: custo?.preco ?? 1
          });
          const produtoBody: IProdutoBody = {
            nome: produto.nome,
            categoria: {
              id: new Types.ObjectId(produto.codigoGrupo),
              nome: produto.extra1,
            },
            codigo_interno: produto.codigo,
          
            enderecamento: produto.urlEstoqueDetalhe,
            codigo_de_barras: produto.codigoBarras,
            
            marca: produto.nomeSite,
            estoque_minimo: 0,
            estoque_maximo: 0,
            estoque: Number(produto?.estoqueAtual),
            estoque_vendido: 0,
            un: "UN",
            preco_de_custo: custo?.preco ?? 1,
            preco_de_venda: tabela1?.preco ?? 10000,
            ncm: produto.codigoClasse.toString(),
            cest: "",
            cst: "",
            cfop: "",
            origem_da_mercadoria: "",
            peso_bruto_em_kg:
              (produto.pesoBruto ? Number(produto.pesoBruto) : 0) / 1000,
            peso_liquido_em_kg:
              (produto.pesoLiquido ? Number(produto.pesoLiquido) : 0) / 1000,
            icms: 18,
            ipi: 0,
            frete: 0,
          };
       /*    const produtoCriado = await Produto.create(produtoBody); */
          produtosCadastrados++;



 






        }
      }


/*       // Enviar email após a sincronização
      const emails = [];
      if (admin.paymentAlert === true) {
        emails.push(admin.email);
      }
      // Busca outros usuários com `paymentAlert: true` que pertencem à loja do admin
      const users = admin ? await User.find({ user_store_id: admin._id, paymentAlert: true }) : [];
      // Adiciona os emails dos usuários encontrados
      emails.push(...users.map(user => user.email));
      // Enviar e-mail com o erro */


      // Calcular o tempo total de sincronização
/*       const fimSincronizacao = Date.now();
      const tempoTotal = (fimSincronizacao - inicioSincronizacao) / 1000; // em segundos
      console.log(`Tempo total de sincronização: ${tempoTotal} segundos`);
      await sendEmail(
        emails,
        produtosIdeal.length,
        produtosCadastrados,
        tempoTotal
      ); */


    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },



};

export default produto_Schema;
