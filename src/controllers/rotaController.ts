import { Request, Response } from 'express';
import Rota from '../models/rotas'; // Importando o modelo Rota
import { Entrega } from "../models/entregas";
interface Rota {
    numero: string;
    motorista: {
        nome: string;
        id: string;
    }
    veiculo: {
        id: string;
        nome: string;
        placa: string;
        modelo: string;
        cor: string;
        ano: number;
    };
    link_da_Rota_maps?: string;
    data: Date;
    entregas: {
        id: string;
        orden_de_entrega: number;
        nome: string;
        email?: string;
        telefone?: string;
        descricao: string;
        numero_nf: string;
        sequencia: number;
        status_entrega: 'pendente' | 'em_transporte' | 'entregue' | 'devolvido' | 'cancelada';
        link_da_localizacao?: string;
        endereco_entrega: {
            logradouro: string;
            numero: string;
            bairro: string;
            descricaoCidade: string;
            estado: string;
            cep: string;
        };
    }[];
    status: 'pendente' | 'em_transporte' | 'concluida' | 'cancelada';
    createdAt: Date;
    updatedAt: Date;
}
const rotaController = {
  // Criar uma nova rota
criarRota: async (req: Request, res: Response) => {
  try {
    const { motorista, veiculo, data, entregas } = req.body;

    if (!motorista || !veiculo || !data || !entregas || entregas.length === 0) {
      return res.status(400).json({ error: 'Dados incompletos para criar a rota' });
    }

    // Gerar número sequencial de 6 dígitos
    const ultimaRota = await Rota.findOne().sort({ createdAt: -1 });
    let novoNumero = '000001';

    if (ultimaRota && ultimaRota.numero) {
      const ultimoNumero = parseInt(ultimaRota.numero, 10);
      const proximoNumero = ultimoNumero + 1;
      novoNumero = String(proximoNumero).padStart(6, '0');
    }

    req.body.numero = novoNumero;

    // Modificar status das entregas pra 'em_transporte'
    for (const entrega of entregas) {
      const entregaExistente = await Entrega.findById(entrega.id);
      if (entregaExistente) {
        entregaExistente.status_entrega = 'em_transporte';
        await entregaExistente.save();
      }
    }

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
