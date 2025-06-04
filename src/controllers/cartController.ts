import { Request, Response } from "express";
import mongoose from "mongoose";
import { Cart, IProdutoCart } from "../models/cart";
import { Customer } from "../models/custumer";
import { Produto } from "../models/product";
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
      const custumer_id = req.headers['id'] as string | undefined;
     

      // Busca os carrinhos do consumidor
      const carrinhos = await Cart.findOne({ 
        "consumidor.id": custumer_id
        , "status_Cart": { $ne: "finalizado" } // Exclui carrinhos finalizados
        
      });
      
      return res.status(200).json(carrinhos);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar carrinhos do consumidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },

 addProduto: async (req: Request, res: Response) => {
  try {
    const custumer_id = req.headers['id'] as string | undefined;
    const produtoBody = req.body;

    if (!custumer_id) {
      return res.status(400).json({
        success: false,
        message: "ID do cliente é obrigatório",
      });
    }

    const consumidor = await Customer.findById(custumer_id);
    if (!consumidor) {
      return res.status(404).json({
        success: false,
        msg: "Cliente não encontrado"
      });
    }

    // Busca o produto direto no banco pra pegar estoque atualizado
    const produtoDb = await Produto.findById(produtoBody.id);
    if (!produtoDb) {
      return res.status(404).json({
        success: false,
        msg: "Produto não encontrado"
      });
    }

    const estoqueAtual = produtoDb.estoque ?? 0;

    const produtoCart: IProdutoCart = {
      _id: produtoBody.id,
      nome: produtoDb.nome,
      quantidade: 1,
      un: 'un',
      preco_de_Venda: produtoBody.price,
      preco_de_custo: 0,
      desconto: 0,
      precoTotal: produtoBody.price , // Usa o preço com desconto
      estoque: produtoDb.estoque ?? 0,
      status: 'pendente',
      codigo_interno: '',
      categoria: produtoBody.category,
      imgs: produtoDb.imgs
    };

    let carrinhoAtivo = await Cart.findOne({
      "consumidor.id": custumer_id,
      "status_Cart": "aberto"
    });

    if (!carrinhoAtivo) {
      // Verifica estoque antes de criar novo carrinho
      if (estoqueAtual < 1) {
        return res.status(400).json({
          success: false,
          message: "Estoque insuficiente"
        });
      }

      const novoCarrinho = new Cart({
        consumidor: {
          id: consumidor._id.toString(),
          cpf: consumidor.cpf_cnpj,
          nome: consumidor.name,
          email: consumidor.email || '',
          contato: consumidor.phone || '',
          endereco: consumidor.endereco || []
        },
        produtos: [produtoCart],
        ItensTotal: 1,
        valorTotal: produtoBody.price, // Total inicial
        status_Cart: 'aberto',
        historico: [{
           acao: `Carrinho criado com produto ${produtoBody.title}`,
          data: new Date()
        }]
      });

      const carrinhoSalvo = await novoCarrinho.save();

      return res.status(201).json({
        success: true,
        message: "Novo carrinho criado e produto adicionado",
        data: carrinhoSalvo
      });
    } else {
      const produtoExistenteIndex = carrinhoAtivo.produtos.findIndex(
         p => p._id === produtoBody.id
      );

      if (produtoExistenteIndex >= 0) {
        const quantidadeAtual = carrinhoAtivo.produtos[produtoExistenteIndex].quantidade;
        if (quantidadeAtual + 1 > estoqueAtual) {
          return res.status(400).json({
            success: false,
            message: "Quantidade excede o estoque disponível"
          });
        }

        carrinhoAtivo.produtos[produtoExistenteIndex].quantidade += 1;
        carrinhoAtivo.produtos[produtoExistenteIndex].precoTotal =
          carrinhoAtivo.produtos[produtoExistenteIndex].quantidade *
          carrinhoAtivo.produtos[produtoExistenteIndex].preco_de_Venda;

      } else {
        if (estoqueAtual < 1) {
          return res.status(400).json({
            success: false,
            message: "Estoque insuficiente"
          });
        }

        carrinhoAtivo.produtos.push(produtoCart);
      }

      carrinhoAtivo.ItensTotal = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + prod.quantidade, 0
      );

      carrinhoAtivo.valorTotal = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + prod.precoTotal, 0
      );

      await carrinhoAtivo.save();

      return res.status(200).json({
        success: true,
        message: "Produto adicionado ao carrinho existente",
        data: carrinhoAtivo
      });
    }

  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao adicionar produto ao carrinho"
    });
  }
},


  RemoveProductFromCart: async (req: Request, res: Response) => {
    try {
      const custumer_id = req.headers['id'] as string | undefined;
      const produtoBody = req.body; // Produto recebido do frontend


      // Verifica se o ID do cliente foi fornecido
      if (!custumer_id) {
        return res.status(400).json({
          success: false,
          message: "ID do cliente é obrigatório",
        });
      }

      // Busca o carrinho ativo do cliente
      const carrinhoAtivo = await Cart.findOne({ 
        "consumidor.id": custumer_id,
        "status_Cart": { $ne: "finalizado" }
      });

      if (!carrinhoAtivo) {
        return res.status(404).json({ 
          success: false,
          message: "Carrinho ativo não encontrado para este cliente" 
        });
      }

      // Encontra o índice do produto no carrinho
      const produtoIndex = carrinhoAtivo.produtos.findIndex(
        p => p._id === produtoBody.id
      );

      if (produtoIndex === -1) {
        return res.status(404).json({ 
          success: false,
          message: "Produto não encontrado no carrinho" 
        });
      }

      // Armazena informações do produto para o histórico
      const produtoRemovido = carrinhoAtivo.produtos[produtoIndex];
      
      // Remove o produto do array
      carrinhoAtivo.produtos.splice(produtoIndex, 1);

      // Atualiza totais do carrinho
      carrinhoAtivo.ItensTotal = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + prod.quantidade, 0
      );
      
      carrinhoAtivo.valorTotal = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + prod.precoTotal, 0
      );
      
      carrinhoAtivo.valor_de_Desconto = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + (prod.desconto || 0), 0
      );

      // Adiciona registro no histórico
      carrinhoAtivo.historico.push({
        acao: `Produto ${produtoRemovido.nome} removido completamente do carrinho`,
        data: new Date()
      });

      // Se não houver mais produtos, atualiza o status para "vazio" ou similar
      if (carrinhoAtivo.produtos.length === 0) {
        carrinhoAtivo.status_Cart = "vazio";
        carrinhoAtivo.historico.push({
          acao: "Carrinho esvaziado",
          data: new Date()
        });
      }

      const carrinhoAtualizado = await carrinhoAtivo.save();
      
      return res.status(200).json({
        success: true,
        message: "Produto removido do carrinho com sucesso",
        data: {
          carrinho: carrinhoAtualizado,
          produtoRemovido: produtoRemovido
        }
      });
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao remover produto do carrinho",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },
  increaseProductQuantity: async (req: Request, res: Response) => {
    try {
      const custumer_id = req.headers['id'] as string | undefined;
      const produtoBody = req.body;
      
      if (!custumer_id) {
        return res.status(400).json({
          success: false,
          message: "ID do cliente é obrigatório",
        });
      }

      // Busca carrinho ativo
      const carrinhoAtivo = await Cart.findOne({ 
        "consumidor.id": custumer_id,
        "status_Cart": { $ne: "finalizado" }
      });

      if (!carrinhoAtivo) {
        return res.status(404).json({ 
          success: false,
          message: "Carrinho ativo não encontrado" 
        });
      }

      // Encontra o produto no carrinho
      const produtoIndex = carrinhoAtivo.produtos.findIndex(
        p => p._id === produtoBody.id
      );

      if (produtoIndex === -1) {
        return res.status(404).json({ 
          success: false,
          message: "Produto não encontrado no carrinho" 
        });
      }

      // Incrementa a quantidade
      carrinhoAtivo.produtos[produtoIndex].quantidade += 1;
      
      // Recalcula o preço total do produto
      const precoUnitario = carrinhoAtivo.produtos[produtoIndex].preco_de_Venda;
     /*  const descontoUnitario = carrinhoAtivo.produtos[produtoIndex].desconto || 0; */
      carrinhoAtivo.produtos[produtoIndex].precoTotal = (precoUnitario * carrinhoAtivo.produtos[produtoIndex].quantidade);

      // Atualiza totais do carrinho
      carrinhoAtivo.ItensTotal = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + prod.quantidade, 0
      );
      
      carrinhoAtivo.valorTotal = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + prod.precoTotal, 0
      );
      
  /*     carrinhoAtivo.valor_de_Desconto = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + (prod.desconto || 0), 0
      ); */

      // Registra no histórico
/*       carrinhoAtivo.historico.push({
        acao: `Quantidade do produto ${carrinhoAtivo.produtos[produtoIndex].nome} aumentada para ${carrinhoAtivo.produtos[produtoIndex].quantidade}`,
        data: new Date()
      }); */

      const carrinhoAtualizado = await carrinhoAtivo.save();
      
      return res.status(200).json({
        success: true,
        message: "Quantidade do produto aumentada com sucesso",
        data: carrinhoAtualizado
      });
    } catch (error) {
      console.error("Erro ao aumentar quantidade:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao aumentar quantidade do produto",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },
  decreaseProductQuantity: async (req: Request, res: Response) => {
    try {
      const custumer_id = req.headers['id'] as string | undefined;
      const produtoBody = req.body;
      
      if (!custumer_id) {
        return res.status(400).json({
          success: false,
          message: "ID do cliente é obrigatório",
        });
      }

      // Busca carrinho ativo
      const carrinhoAtivo = await Cart.findOne({ 
        "consumidor.id": custumer_id,
        "status_Cart": { $ne: "finalizado" }
      });

      if (!carrinhoAtivo) {
        return res.status(404).json({ 
          success: false,
          message: "Carrinho ativo não encontrado" 
        });
      }

      // Encontra o produto no carrinho
      const produtoIndex = carrinhoAtivo.produtos.findIndex(
        p => p._id === produtoBody.id
      );

      if (produtoIndex === -1) {
        return res.status(404).json({ 
          success: false,
          message: "Produto não encontrado no carrinho" 
        });
      }

      // Verifica se a quantidade atual é maior que 1
      if (carrinhoAtivo.produtos[produtoIndex].quantidade <= 1) {
        return res.status(400).json({
          success: false,
          message: "Quantidade mínima já atingida (1 unidade)",
          data: carrinhoAtivo
        });
      }

      // Decrementa a quantidade
      carrinhoAtivo.produtos[produtoIndex].quantidade -= 1;
      
      // Recalcula o preço total do produto
      const precoUnitario = carrinhoAtivo.produtos[produtoIndex].preco_de_Venda;
      
      carrinhoAtivo.produtos[produtoIndex].precoTotal = (precoUnitario * carrinhoAtivo.produtos[produtoIndex].quantidade);

      // Atualiza totais do carrinho
      carrinhoAtivo.ItensTotal = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + prod.quantidade, 0
      );
      
      carrinhoAtivo.valorTotal = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + prod.precoTotal, 0
      );
      
/*       carrinhoAtivo.valor_de_Desconto = carrinhoAtivo.produtos.reduce(
        (total, prod) => total + (prod.desconto || 0), 0
      ); */

      // Registra no histórico
/*       carrinhoAtivo.historico.push({
        acao: `Quantidade do produto ${carrinhoAtivo.produtos[produtoIndex].nome} diminuída para ${carrinhoAtivo.produtos[produtoIndex].quantidade}`,
        data: new Date()
      }); */

      const carrinhoAtualizado = await carrinhoAtivo.save();
      
      return res.status(200).json({
        success: true,
        message: "Quantidade do produto diminuída com sucesso",
        data: carrinhoAtualizado
      });
    } catch (error) {
      console.error("Erro ao diminuir quantidade:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao diminuir quantidade do produto",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },
};

export default cartController;