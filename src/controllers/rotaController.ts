import { Request, Response } from 'express';
import Rota from '../models/rotas'; // Importando o modelo Rota
import { Entrega } from "../models/entregas";
import User from "../models/user";
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
      // 🚨 Validação: já existe rota com alguma dessas entregas?
      const entregasIds = entregas.map((e: any) => e._id);

      const rotaExistente = await Rota.findOne({
        "entregas._id": { $in: entregasIds }
      });

      if (rotaExistente) {
        return res.status(400).json({
          error: "Já existe uma rota que contém uma ou mais dessas entregas"
        });
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
  /* função para editar rota por Id */
  editarRota: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { motorista, veiculo, data, entregas } = req.body;


      if (!motorista || !veiculo || !data || !entregas || entregas.length === 0) {
        return res.status(400).json({ error: 'Dados incompletos para editar a rota' });
      }

      const rota = await Rota.findById(id);
      if (!rota) {
        return res.status(404).json({ error: 'Rota não encontrada' });
      }
      rota.motorista = motorista || rota.motorista;
      rota.veiculo = veiculo || rota.veiculo;
      rota.data = data || rota.data;
      rota.entregas = entregas || rota.entregas;
      await rota.save();


      return res.status(200).json(rota);
    } catch (error) {

      return res.status(500).json({ error: 'Erro ao editar a rota', detalhes: error });
    }
  },

  // Listar todas as rotas
  listarRotas: async (req: Request, res: Response) => {
    const typeUser = req.headers.typeuser as string;
    const userId = req.headers.userid as string;

    try {
      if (!typeUser || !userId) {
        return res
          .status(400)
          .json({ msg: "Tipo de usuário ou ID do usuário não fornecido" });
      }

      // filtros enviados no front
      const { motorista, data, status } = req.query;


      let baseQuery: any = {};

      if (typeUser === "admin") {
        // Admin vê tudo
        baseQuery = {};
      } else if (typeUser === "user") {
        // Buscar o cargo do usuário
        const user = await User.findById(userId).select("cargo");
        if (!user) {
          return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        if (
          user.cargo === "Supervisor de Logística" ||
          user.cargo === "Gerente"
        ) {
          baseQuery = {};
        } else if (user.cargo === "Motorista") {
          baseQuery = { "motorista.id": userId };
        } else {
          return res.status(403).json({ msg: "Cargo não autorizado" });
        }
      } else {
        return res.status(403).json({ msg: "Tipo de usuário inválido" });
      }

      // aplicar filtros opcionais
      if (motorista) {
        baseQuery["motorista.id"] = motorista;
      }
      if (status) {
        baseQuery["status"] = status;
      }
      if (data) {
        const dataStr = data as string; // ex: "2025-08-21"

        const inicio = new Date(`${dataStr}T00:00:00.000Z`);
        const fim = new Date(`${dataStr}T23:59:59.999Z`);

        baseQuery["data"] = { $gte: inicio, $lte: fim };
      }


      const rotas = await Rota.find(baseQuery).sort({ createdAt: -1 });

      if (!rotas || rotas.length === 0) {
        return res.status(404).json({ msg: "Nenhuma rota encontrada" });
      }

      return res.status(200).json(rotas);
    } catch (error) {

      return res.status(500).json({ error: "Erro ao listar as rotas" });
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
  },

  /*  cancelar rotaID */
  cancelarRotaId: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status_entrega } = req.body;

      const rota = await Rota.findById(id);
      if (!rota) {
        return res.status(404).json({ error: 'Rota não encontrada' });
      }
      if (rota.status === 'cancelada') {
        return res.status(400).json({ error: 'Rota já está cancelada' });
      }

      // Atualizar o status da rota para 'cancelada'
      rota.status = "cancelada";
      await rota.save();

      // Map de mensagens para os status
      const mensagensStatus: Record<string, string> = {
        pendente: "Status da entrega atualizado para pendente devido ao cancelamento da rota",
        cancelada: "Entrega cancelada devido ao cancelamento da rota",
        devolvido: "Entrega marcada como devolvida devido ao cancelamento da rota",
        entregue: "Entrega finalizada mesmo com a rota cancelada"
      };

      // Atualizar o status de todas as entregas associadas
      for (const entrega of rota.entregas) {
        const entregaExistente = await Entrega.findById(entrega._id);

        if (entregaExistente) {
          const novoStatus = status_entrega || "pendente";
          entregaExistente.status_entrega = novoStatus;

          entregaExistente.historico.push({
            usuario: (req.headers.username as string) || "Sistema",
            data: new Date(),
            acao: mensagensStatus[novoStatus] || "Status da entrega atualizado"
          });

          await entregaExistente.save();
        }
      }

      return res.status(200).json({
        msg: "Rota cancelada e entregas atualizadas",
        rota
      });
    } catch (error) {

      return res.status(500).json({
        error: "Erro ao cancelar a rota",
        detalhes: error
      });
    }
  },
  /* função para tranferir entrega para outra rota pelo id da entrega, tem que tirar ela da rota antiga e colocar em outra tanto o id da entrega quanto o id da rota nova vem pelo body */
  transferirEntrega: async (req: Request, res: Response) => {
    try {
      const { entregaId, novaRotaId } = req.body;

      if (!entregaId || !novaRotaId) {
        return res.status(400).json({ error: 'Dados incompletos para transferir a entrega' });
      }

      const entrega = await Entrega.findById(entregaId);
      if (!entrega) {
        return res.status(404).json({ error: 'Entrega não encontrada' });
      }

      const rotaAtual = await Rota.findOne({ "entregas._id": entregaId });
      if (!rotaAtual) {
        return res.status(404).json({ error: 'Rota atual da entrega não encontrada' });
      }

      const novaRota = await Rota.findById(novaRotaId);
      if (!novaRota) {
        return res.status(404).json({ error: 'Nova rota não encontrada' });
      }

      // Adicionar ao histórico da entrega
      entrega.historico.push({
        usuario: (req.headers.username as string) || "Sistema",
        data: new Date(),
        acao: `Entrega transferida da Rota ${rotaAtual.numero} para a Rota ${novaRota.numero}`
      });
      
      await entrega.save();

      // Remover a entrega da rota atual
      const acaoHistorico = `Entrega transferida da Rota ${rotaAtual.numero} para a Rota ${novaRota.numero}`;
      rotaAtual.entregas = rotaAtual.entregas.filter(e => e._id.toString() !== entregaId);
      rotaAtual.entregas = rotaAtual.entregas.map(e => {
        if (e._id.toString() === entregaId) {
          e.historico = e.historico ?? [];
          e.historico.push({
            usuario: (req.headers.username as string) || "Sistema",
            data: new Date(),
            acao: acaoHistorico
          });
        }
        return e;
      });
      // Se não sobrou nenhuma entrega, apagar a rota
      if (rotaAtual.entregas.length === 0) {
        await Rota.findByIdAndDelete(rotaAtual._id);
      } else {
        await rotaAtual.save();
      }

      // Adicionar a entrega na nova rota
      const entregaObj = entrega.toObject();
      novaRota.entregas.push({
        _id: (entregaObj._id as any).toString(),
        orden_de_entrega: novaRota.entregas.length + 1,
        nome: entregaObj.consumidor_nome || 'N/A',
        email: entregaObj.consumidor_email || 'N/A',
        telefone: entregaObj.consumidor_contato || 'N/A',
        descricao: `${entregaObj.endereco_entrega.logradouro}, ${entregaObj.endereco_entrega.numero} - ${entregaObj.endereco_entrega.bairro}, ${entregaObj.endereco_entrega.descricaoCidade} - ${entregaObj.endereco_entrega.estado}`,
        numero_nf: entregaObj.numero_nf,
        sequencia: entregaObj.sequencia,
        status_entrega: entregaObj.status_entrega,
        link_da_localizacao: entregaObj.link_da_localizacao,
        endereco_entrega: entregaObj.endereco_entrega,
        historico: entregaObj.historico ?? [],
        anexos: entregaObj.anexos ?? [],
        observacoes: entregaObj.observacoes ?? []
      });

      await novaRota.save();

      return res.status(200).json({ msg: 'Entrega transferida com sucesso', novaRota });

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao transferir a entrega', detalhes: error });
    }
  }

};
export default rotaController;
