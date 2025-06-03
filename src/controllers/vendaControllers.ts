import { Request, response, Response } from "express";
import { Venda } from "../models/venda";
import { Loja } from "../models/loja";
import { Customer } from "../models/custumer"; // Importa o model Customer
import { Cart} from "../models/cart";
interface IHistorico {
  usuario?: string;
  data: Date;
  acao: string;
}
interface IEstagioProcesso {
  usuario: string;
  data: Date;
  acao: string;
  tempo_do_processo?: string;
}




const venda_Schema = {
  createOrder: async (req: Request, res: Response) => {
    try {
      let custumerId = req.headers.id;
      

      const custumer = await Customer.findById(custumerId);
     
      if (!custumer) {
        return res.status(404).json({ msg: "Cliente não encontrado" });
      }
      // Verificar se o status do cliente é "aprovado"
      if (custumer.status !== "aprovado") {
        return res.status(403).json({ msg: "Cliente não aprovado. Envie seus documentos ou aguarde a análise do cadastro." });
      }


      let emitenteId = req.headers.emitenteId as string;
      if (!emitenteId) {
        emitenteId = "6807ab4fbaead900af4db229";
      }

      const emitente = await Loja.findById(emitenteId);
     
      if (!emitente) {
        return res.status(404).json({ msg: "Emitente não encontrado" });
      }
      
 
      

      // Mapear endereço do cliente
      const enderecoConsumidor = custumer.endereco.map(end => ({
        logradouro: end.logradouro,
        numero: end.numero,
        bairro: end.bairro,
        descricaoCidade: end.descricaoCidade,
        estado: end.estado,
        cep: end.cep
      }));

      // Mapear endereço do emitente
      const enderecoEmitente = emitente.endereco?.map(end => ({
        logradouro: end.logradouro,
        numero: end.numero,
        bairro: end.bairro,
        descricaoCidade: end.descricaoCidade || "Cidade não informada", // fallback
        estado: end.estado,
        cep: end.cep
      }));



      // Criar registro de histórico
      const historicoInicial: IHistorico = {
        data: new Date(),
        acao: "Pedido criado",
        usuario: custumer.name || "Cliente"
      };
      // Criar estágio do processo inicial
      const estagioInicial:IEstagioProcesso = {
        usuario: custumer.name || "Sistema",
        data: new Date(),
        acao: "Pedido recebido - Em análise",
        tempo_do_processo: "0 minutos"
      };

      // Criar objeto da venda
      const vendaData = {
        emitente: {
          _id: emitente._id,
          cnpj: emitente.cnpj.toString(),
          razao_social: emitente.razao_social,
          regime_tributario: emitente.regime_tributario,
          endereco: enderecoEmitente
        },
        consumidor: {
          id: custumer._id.toString(),
          cpf: custumer.cpf_cnpj?.toString(),
          nome: custumer.name,
          email: custumer.email,
          contato: custumer.phone,
          endereco: enderecoConsumidor
        },
        formas_de_pagamento_array: [{
          metodo: "A definir", // Pode ser ajustado conforme seu fluxo
          pagar_no_local: false,
          valor: req.body.valorTotal,
          status: "pendente"
        }],
        Numero_da_nota: undefined, // Será gerado posteriormente
        status_venda: "em analize",
        descricao: "Pedido criado pelo cliente",
        historico: [historicoInicial],
        estagio_do_processo: [estagioInicial],
        ItensTotal: req.body.ItensTotal,
        produtos: req.body.produtos.map((prod: any) => ({
          ...prod,
          status: "vendido",
          qt_devolucao: 0,
          produto_servico: false
        })),
        valorTotal: req.body.valorTotal,
        valor_de_Desconto: req.body.valor_de_Desconto,
        prazo_de_entrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Padrão: 7 dias a partir de agora
      };
     
      // Criar e salvar a venda no banco de dados
      const novaVenda = new Venda(vendaData);
      const vendaSalva = await novaVenda.save();


      const cart = await Cart.findOne({ 'consumidor.id': custumerId });

      if (cart) {
/*         cart.produtos = [];
        cart.ItensTotal = 0;
        cart.valorTotal = 0;
        cart.valor_de_Desconto = 0; */
        cart.status_Cart = "finalizado";
        
        cart.historico.push({
          data: new Date(),
          acao: "Carrinho limpo após criação de venda",
          usuario: "Sistema"
        });
      
        await cart.save();
      }
      return res.status(201).json({
        success: true,
        message: "Pedido criado com sucesso",
        venda: vendaSalva
      });

    } catch (error) {
      console.error("Erro ao criar venda:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao processar o pedido",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  },
   getByConsumidor: async (req: Request, res: Response) => {
      try {
        const custumer_id = req.headers['id'] as string | undefined;
       
       
  
      const Order = await Venda.find({ "consumidor.id": custumer_id });
       
        
        return res.status(200).json(Order);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Erro interno ao buscar Order do consumidor",
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    },
    getByOrderEmitente: async (req: Request, res: Response) => {
      try {
        const emitente_id = req.headers['user_store_id'] as string | undefined;
        
       
       
  
      const Order = await Venda.find({ "emitente._id": emitente_id });
       
        
        return res.status(200).json(Order);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Erro interno ao buscar Order do consumidor",
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    },
    getOrderDetails: async (req: Request, res: Response) => {
      try {
        const venda_id = req.params.id
        
       
  
      const Order = await Venda.findById(venda_id);
        
        
        return res.status(200).json(Order);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Erro interno ao buscar Order do consumidor",
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    },
};

export default venda_Schema;
