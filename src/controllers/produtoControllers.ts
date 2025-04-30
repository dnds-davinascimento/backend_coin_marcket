import { Request, Response } from "express";
import dotenv from "dotenv";
import { Types } from "mongoose";


import nodemailer from "nodemailer";
import { create } from "axios";
import { Produto } from "../models/product";
import { Loja } from "../models/loja";
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
   
  } catch (error) {
   
  }
};
interface ICategoria {
  id: Types.ObjectId;
  nome?: string;
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
  produto_da_loja?: string;
  produto_do_fornecedor?: string;
  produto_verify?: boolean;
  produto_marcket?: boolean;
  produto_de_rota?: boolean;
  produto_shared?: boolean;
  produto_servico?: boolean;
  mostrar_no_super_market?: boolean;
  imgs?: [{url: string}];
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
   
    
    const id_loja = req.headers.id as string;
    


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
    let id_loja = req.headers.id as string;
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



};

export default produto_Schema;
