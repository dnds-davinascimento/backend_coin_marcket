import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Cart, IProdutoCart } from "../models/cart";
import { Customer } from "../models/custumer";

interface CartBody {
  emitente: {
    _id: string;
    cnpj: string;
    razao_social: string;
  };
  consumidor?: {
    id?: string;
    cpf?: string;
    nome?: string;
    email?: string;
    contato?: string;
    endereco?: {
      logradouro: string;
      numero: string;
      bairro: string;
      descricaoCidade: string;
      estado: string;
      cep: string;
    }[];
  };
  vendedor?: {
    nome?: string;
    id?: string;
  };
  status_Cart?: string;
  descricao?: string;
  produtos: IProdutoCart[];
  valorTotal: number;
  valorTroco?: number;
  valor_de_Desconto: number;
}

const cartController = {


  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verifica se o ID é válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "ID de carrinho inválido",
        });
      }

      // Busca o carrinho pelo ID
      const carrinho = await Cart.findById(id);

      if (!carrinho) {
        return res.status(404).json({
          success: false,
          message: "Carrinho não encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: carrinho,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar carrinho",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },

  getByEmitente: async (req: Request, res: Response) => {
    try {
      const { emitenteId } = req.params;

      // Busca os carrinhos do emitente
      const carrinhos = await Cart.find({ "emitente._id": emitenteId });

      return res.status(200).json({
        success: true,
        data: carrinhos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar carrinhos do emitente",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },

  getByConsumidor: async (req: Request, res: Response) => {
    try {
      const { consumidorId } = req.params;

      // Busca os carrinhos do consumidor
      const carrinhos = await Cart.find({ "consumidor.id": consumidorId });

      return res.status(200).json({
        success: true,
        data: carrinhos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar carrinhos do consumidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },


  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verifica se o ID é válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "ID de carrinho inválido",
        });
      }

      // Verifica se o carrinho existe
      const carrinhoExistente = await Cart.findById(id);
      if (!carrinhoExistente) {
        return res.status(404).json({
          success: false,
          message: "Carrinho não encontrado",
        });
      }

      // Remove o carrinho
      await Cart.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Carrinho removido com sucesso",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao remover carrinho",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },

  addProduto: async (req: Request, res: Response) => {
    try {   
        const custumer_id = req.headers['id'] as string | undefined;

        const consumidor = await Customer.findById(custumer_id);
        if (!consumidor) {
          res.status(404).json({ msg: "Cliente não encontrado" });
          return;
        }

        const carrinho_Custumer = await Cart.find({ "consumidor.id": custumer_id });



      if (!consumidor || !consumidor._id || !consumidor.taxId || !consumidor.name) {
        return res.status(400).json({
          success: false,
          message: "Dados do consumidor são obrigatórios",
        });
      }
      const produtos = [{}]

      if (!produtos || produtos.length === 0) {
        return res.status(400).json({
          success: false,
          message: "O carrinho deve conter pelo menos um produto",
        });
      }

        if (!carrinho_Custumer) {
            const carrinho = {

            }
          }

        console.log(custumer_id)
        console.log(req.body)
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao adicionar produto ao carrinho",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },

  removeProduto: async (req: Request, res: Response) => {
    try {
      const { id, produtoId } = req.params;

      // Busca o carrinho
      const carrinho = await Cart.findById(id);
      if (!carrinho) {
        return res.status(404).json({
          success: false,
          message: "Carrinho não encontrado",
        });
      }

      // Filtra os produtos removendo o produto especificado
      const produtosAtualizados = carrinho.produtos.filter(p => p._id !== produtoId);

      // Se não houve alteração, o produto não existia no carrinho
      if (produtosAtualizados.length === carrinho.produtos.length) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado no carrinho",
        });
      }

      // Atualiza o carrinho
      carrinho.produtos = produtosAtualizados;
      
      // Recalcula totais
      carrinho.ItensTotal = carrinho.produtos.reduce(
        (total, p) => total + p.quantidade,
        0
      );
      carrinho.valorTotal = carrinho.produtos.reduce(
        (total, p) => total + (p.preco_de_Venda * p.quantidade - p.desconto),
        0
      );

      // Adiciona ao histórico
      carrinho.historico.push({
        acao: `Produto ${produtoId} removido`,
        data: new Date()
      });

      // Salva as alterações
      const carrinhoAtualizado = await carrinho.save();

      return res.status(200).json({
        success: true,
        message: "Produto removido do carrinho com sucesso",
        data: carrinhoAtualizado,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao remover produto do carrinho",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export default cartController;