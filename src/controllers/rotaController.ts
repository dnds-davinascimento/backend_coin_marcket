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
    _id: string;
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
        const entregaExistente = await Entrega.findById(entrega._id);
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
  /* buscar rota pelo id */
  buscarRotaPorId: async (req: Request, res: Response) => {
    try {
      const rota = await Rota.findById(req.params.id);
      if (!rota) {
        return res.status(404).json({ error: 'Rota não encontrada' });
      }
      return res.status(200).json(rota);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar a rota' });
    }
  },
  
// PUT /confirmarEntregas/:rotaId
updateStatusEntregaNaRota: async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { entregaId, nameUser, idUser } = req.body;
   

    const rota = await Rota.findById(id);
    if (!rota) {
     
      return res.status(404).json({ msg: "Rota não encontrada" });
    }
 

const entregaNaRota = rota.entregas.find(e => 
  e._id.toString() === entregaId
);




    if (!entregaNaRota) {
      return res.status(400).json({ msg: "Entrega não pertence a essa rota" });
    }

    // Atualiza entrega no banco de entregas
    const entregaAtualizada = await Entrega.findByIdAndUpdate(
      entregaId,
      {
        status_entrega: "entregue",
        entregueEm: new Date().toISOString(),
        // Atualiza histórico da entrega (push um novo registro)
        $push: {
          historico: {
            usuario: `${nameUser} (${idUser})`,
            data: new Date(),
            acao: "Entrega confirmada como entregue",
          }
        }
      },
      { new: true }
    );

    if (!entregaAtualizada) {
      return res.status(404).json({ msg: "Entrega não encontrada" });
    }

    // Atualiza a entrega dentro da rota
    entregaNaRota.status_entrega = "entregue";

    // Verifica se todas as entregas da rota estão entregues para finalizar a rota
    const todasEntregues = rota.entregas.every(e => e.status_entrega === "entregue");
    if (todasEntregues) {
      rota.status = "concluida";
    }

    await rota.save();

    return res.status(200).json({ msg: "Entrega confirmada como entregue", rota });
  } catch (error) {

    return res.status(500).json({ msg: "Erro ao atualizar status da entrega" });
  }
}


};
export default rotaController;
