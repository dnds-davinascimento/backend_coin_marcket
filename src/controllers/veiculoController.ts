import e, { Request, Response } from 'express';
import Veiculo from '../models/veiculo'; // Importando o modelo Veiculo

const veiculoController = {
  // Criar um novo veículo
    criarVeiculo: async (req: Request, res: Response) => {
        try {
          console.log('Dados recebidos:', req.body);
        const novoVeiculo = await Veiculo.create(req.body);
        return res.status(201).json(novoVeiculo);
        } catch (error) {
        return res.status(500).json({ error: 'Erro ao criar o veículo', detalhes: error });
        }
    },
    // Listar todos os veículos
    listarVeiculos: async (_req: Request, res: Response) => {
        try {
        const veiculos = await Veiculo.find().sort({ createdAt: -1 });
        return res.status(200).json(veiculos);
        } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar os veículos' });
        }
    },}
    export default veiculoController;
