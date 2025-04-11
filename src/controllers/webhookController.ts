import { Request, Response } from "express";
import dotenv from "dotenv";
import Admin from "../models/Admin"; // Importa o model Admin
import axios from "axios";

dotenv.config(); // Carregar as variáveis de ambiente

const webhookController = {
  /*  criar webhook */
  createWebhook: async (req: Request, res: Response): Promise<void> => {
    try {
      /* pegar admin com id */
      const admin = await Admin.findById(req.headers.id);

      if (!admin) {
        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }

      const nuvemshopAccessToken = admin.nuvemshopAccessToken;
      const nuvemshopStoreId = admin.nuvemshop_user_id;

      const { event, webhookUrl } = req.body;
      if (!event || !webhookUrl) {
        res.status(400).json({ msg: "Evento ou URL do Webhook ausente." });
        return;
      }

      const { data } = await axios.post(
        `${process.env.NUVEMSHOP_API}/${nuvemshopStoreId}/webhooks`,
        {
          event: event,
          url: webhookUrl,
        },

        {
          headers: {
            "Content-Type": "application/json",
            Authentication: `bearer ${nuvemshopAccessToken}`,
            "User-Agent": `Your App Name ${process.env.APP_ID_NUVEMSHOP}`,
          },
        }
      );

      res.status(201).json({
        msg: "Webhook criado com sucesso!",
        data: data, // Retorna a resposta da Nuvemshop
      });
    } catch (error) {
      console.log(error);
    }
  },

  /* listar webhooks */

  getWebhook: async (req: Request, res: Response): Promise<void> => {
    try {
      /* pegar admin com id */
      const admin = await Admin.findById(req.headers.id);

      if (!admin) {
        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }

      const nuvemshopAccessToken = admin.nuvemshopAccessToken;
      const nuvemshopStoreId = admin.nuvemshop_user_id;

      const { data } = await axios.get(
        `${process.env.NUVEMSHOP_API}/${nuvemshopStoreId}/webhooks`,

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

  /* editar webhook */
  updateWebhook: async (req: Request, res: Response): Promise<void> => {
    try {
      /* pegar admin com id */
      const admin = await Admin.findById(req.headers.id);

      if (!admin) {
        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }

      const nuvemshopAccessToken = admin.nuvemshopAccessToken;
      const nuvemshopStoreId = admin.nuvemshop_user_id;

      const { webhookId, event, webhookUrl } = req.body;
      

      // Verificar se todos os dados necessários foram passados
      if (!webhookId || !event || !webhookUrl) {
        res
          .status(400)
          .json({ msg: "Webhook ID, Evento ou URL do Webhook ausente." });
        return;
      }

      // Fazendo a requisição para atualizar o webhook
      const { data } = await axios.put(
        `${process.env.NUVEMSHOP_API}/${nuvemshopStoreId}/webhooks/${webhookId}`,
        {
          event: event,
          url: webhookUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authentication: `bearer ${nuvemshopAccessToken}`,
            "User-Agent": `Your App Name ${process.env.APP_ID_NUVEMSHOP}`,
          },
        }
      );

      res.status(200).json({
        msg: "Webhook atualizado com sucesso!",
        data: data, // Retorna a resposta da Nuvemshop
      });
    } catch (error) {
      console.log("Erro ao atualizar o webhook:", error);
      res.status(500).json({ msg: "Erro ao atualizar o webhook" });
    }
  },

  /* deletar webhook */

  product_created_hook: async (req: Request, res: Response): Promise<void> => {
    try {
      // Para garantir que o body seja capturado como JSON
      const body = req.body;
      console.log("Body:", body);

      // Aqui você pode adicionar sua lógica para verificar o HMAC ou processar o body
      // Exemplo: verificar se é um produto válido
      if (body && body.product) {
        // Lógica para lidar com o produto criado
        console.log("Produto criado:", body.product);
      }

      res.status(200).send("Webhook recebido com sucesso");
    } catch (error) {
      console.error("Erro ao processar o webhook:", error);
      res.status(500).json({ msg: "Erro ao processar o webhook" });
    }
  },

  order_cancelled_hook: async (req: Request, res: Response): Promise<void> => {
    try {
      // Para garantir que o body seja capturado como JSON
      const body = req.body;
      console.log("Body:", body);

      res.status(200).send("Webhook recebido com sucesso");
    } catch (error) {
      console.error("Erro ao processar o webhook:", error);
      res.status(500).json({ msg: "Erro ao processar o webhook" });
    }
  },
  whatsapp_hook: async (req: Request, res: Response): Promise<void> => {
    try {
      // Para garantir que o body seja capturado como JSON
      const body = req.body;
      console.log("Body:", body);

      res.status(200).send("Webhook recebido com sucesso");
    } catch (error) {
      console.error("Erro ao processar o webhook:", error);
      res.status(500).json({ msg: "Erro ao processar o webhook" });
    }
  },
};

export default webhookController;
