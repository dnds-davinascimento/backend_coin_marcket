import { Request, Response } from "express";
import dotenv from "dotenv";
import Admin from "../models/Admin"; // Importa o model Admin
import axios from "axios";

dotenv.config(); // Carregar as variáveis de ambiente

const webhookController = {




  product_created_hook: async (req: Request, res: Response): Promise<void> => {
    try {
      // Para garantir que o body seja capturado como JSON
      const body = req.body;
     

      // Aqui você pode adicionar sua lógica para verificar o HMAC ou processar o body
      // Exemplo: verificar se é um produto válido
      if (body && body.product) {
        // Lógica para lidar com o produto criado
       
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
     

      res.status(200).send("Webhook recebido com sucesso");
    } catch (error) {
      console.error("Erro ao processar o webhook:", error);
      res.status(500).json({ msg: "Erro ao processar o webhook" });
    }
  },
};

export default webhookController;
