import { Request, response, Response } from "express";
import { Venda } from "../models/venda";
import { Loja } from "../models/loja";
import { Cart } from "../models/cart";
import Admin from "../models/Admin"; // Importa o model Admin
import User from "../models/user"; // Importa o model User
import { Customer } from "../models/custumer"; // Importa o model Customer
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
      const estagioInicial: IEstagioProcesso = {
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
        formas_de_pagamento_array: [],
        Numero_da_nota: undefined, // Será gerado posteriormente
        status_venda: "em análise", // Status inicial
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
        msg: "Pedido criado com sucesso",
        venda: vendaSalva
      });

    } catch (error) {
     
      return res.status(500).json({
        success: false,
        msg: "Erro ao processar o pedido",
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
        msg: "Erro interno ao buscar Order do consumidor",
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
        msg: "Erro interno ao buscar Order do consumidor",
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
        msg: "Erro interno ao buscar Order do consumidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },
  /* função para avanção o precesso de venda */
  advanceProcess: async (req: Request, res: Response) => {
    try {
      const vendaId = req.params.id;
      const id_usuario = req.headers.id as string;

      if (!vendaId || !id_usuario) {
        return res.status(400).json({ msg: "ID da venda e do usuário são necessários" });
      }

      const venda = await Venda.findById(vendaId);
      if (!venda) {
        return res.status(404).json({ msg: "Venda não encontrada" });
      }

      const usuario = await User.findById(id_usuario) || await Admin.findById(id_usuario) || await Customer.findById(id_usuario);
      if (!usuario) {
        return res.status(404).json({ msg: "Usuário não encontrado" });
      }

      // Lista de status válidos
      const estagios = [
        "em análise",
        "aprovado_para_pagamento",
        "pagamento_em_análise",
        "pagamento_aprovado",
        "pedido_separado",
        "pedido_entregue",
        "recebido_pelo_cliente"
      ];

      const atual = venda.status_venda;
      const indexAtual = estagios.indexOf(atual);

      if (indexAtual === -1 || indexAtual === estagios.length - 1) {
        return res.status(400).json({ msg: "Estágio atual inválido ou já está finalizado." });
      }

      const proximo = estagios[indexAtual + 1];

      const isCustomer = usuario instanceof Customer;
      const isEquipe = !isCustomer;


      // ⛔ Validação de permissão
      if (isCustomer) {

        const permitido = (
          atual === "aprovado_para_pagamento" && proximo === "pagamento_em_análise" ||
          atual === "pedido_entregue" && proximo === "recebido_pelo_cliente"
        );
        if (!permitido) {
          return res.status(403).json({ msg: `Você não tem permissão para avançar do status: ${atual}` });
        }
      }

      if (isEquipe) {
       
        const permitido = (
          (atual === "em análise" && proximo === "aprovado_para_pagamento") ||
          (atual === "pagamento_em_análise" && proximo === "pagamento_aprovado") ||
          (atual === "pagamento_aprovado" && proximo === "pedido_separado") ||
          (atual === "pedido_separado" && proximo === "pedido_entregue")

        );

        if (!permitido) {
          return res.status(403).json({ msg: "Aguardando ação do cliente para avançar este estágio." });
        }
      }
      /* quando status atual for pagamento em analize e porcimo for pagamento aprovado mudar status do pagamento para aprovado */
      if (atual === "pagamento_em_análise" && proximo === "pagamento_aprovado") {
        venda.formas_de_pagamento_array.forEach((pagamento: any) => {
          pagamento.status = "aprovado"; // Atualiza o status do pagamento para aprovado
        });
      }

      // Avançar status
      venda.status_venda = proximo;
      venda.historico.push({
        usuario: usuario.name || "Sistema",
        data: new Date(),
        acao: `Avançou para: ${proximo}`
      });
      venda.estagio_do_processo.push({
        usuario: usuario.name || "Sistema",
        data: new Date(),
        acao: `Avançou para: ${proximo}`,
        tempo_do_processo: `${indexAtual * 10} minutos`
      });

      const vendaAtualizada = await venda.save();

      return res.status(200).json({
        success: true,
        msg: "Processo avançado com sucesso",
        venda: vendaAtualizada
      });

    } catch (error) {
     
      return res.status(500).json({
        success: false,
        msg: "Erro ao avançar o processo",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  },
  addPaymentFor: async (req: Request, res: Response) => {
    try {
      const vendaId = req.params.id;
      const id_usuario = req.headers.id as string;
      const formas_de_pagamento_array = req.body.formas_de_pagamento_array;
     

      if (!vendaId || !id_usuario) {
        return res.status(400).json({ msg: "ID da venda e do usuário são necessários" });
      }
      if (!formas_de_pagamento_array || !Array.isArray(formas_de_pagamento_array) || formas_de_pagamento_array.length === 0) {
        return res.status(400).json({ msg: "Formas de pagamento inválidas" });
      }

      const venda = await Venda.findById(vendaId);
      if (!venda) {
        return res.status(404).json({ msg: "Venda não encontrada" });
      }

      const usuario = await User.findById(id_usuario) || await Admin.findById(id_usuario) || await Customer.findById(id_usuario);
      if (!usuario) {
        return res.status(404).json({ msg: "Usuário não encontrado" });
      }

      // Verificar se o status atual é 'aprovado_para_pagamento'
      if (venda.status_venda !== "aprovado_para_pagamento") {
        return res.status(400).json({
          msg: "A venda ainda não está aprovada para pagamento. Aguarde a aprovação da compra antes de enviar o pagamento para análise.",
        });
      }


      // Atualizar status da venda
      venda.status_venda = "pagamento_em_análise";
      venda.historico.push({
        usuario: usuario.name || "Sistema",
        data: new Date(),
        acao: "Pagamento enviado para análise"
      });
      venda.formas_de_pagamento_array = formas_de_pagamento_array.map((pagamento: any) => ({
        ...pagamento,
        status: "em análise", // Definindo o status como 'em análise'
        parcelas: pagamento.parcelas || [] // Garantindo que parcelas seja um array, mesmo que vazio
      }));
      venda.estagio_do_processo.push({
        usuario: usuario.name || "Sistema",
        data: new Date(),
        acao: "Pagamento enviado para análise",
        tempo_do_processo: "0 minutos" // Inicializando o tempo do processo
      });

      const vendaAtualizada = await venda.save();

      return res.status(200).json({
        success: true,
        msg: "Pagamento enviado para análise com sucesso",
        venda: vendaAtualizada
      });

    } catch (error) {
     
      return res.status(500).json({
        success: false,
        msg: "Erro ao enviar pagamento para análise",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  }

};

export default venda_Schema;
