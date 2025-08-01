import { Request, Response } from 'express';
import Rota from '../models/rotas'; // Importando o modelo Rota

const rotaController = {
  // Criar uma nova rota
  criarRota: async (req: Request, res: Response) => {
    try {
      const novaRota = await Rota.create(req.body);
      return res.status(201).json(novaRota);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar a rota', detalhes: error });
    }
  },

  // Listar todas as rotas
  listarRotas: async (_req: Request, res: Response) => {
    try {
      const rotas = await Rota.find().sort({ createdAt: -1 });
      return res.status(200).json(rotas);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar as rotas' });
    }
  },
};
export default rotaController;
