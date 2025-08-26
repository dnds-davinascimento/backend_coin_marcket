import { Request, Response } from "express";
import { Entrega } from "../models/entregas";
import Rota from '../models/rotas'; // Importando o modelo Rota
import User from "../models/user";

export interface DadosOrdemVenda {
  ordem: number;
  filial: string;
  sequencia: number;
  cliente: ClienteDetalhes;
  tipo_Operacao: string;
  tipo_Selecionado: string;
  codigo_Cliente: number;
  codigo_Vendedor_1: number;
  codigo_Vendedor_2: number;
  data: string;
  total_Com_Desconto: number;
  total_Sem_Desconto: number;
  desconto_Total_Geral: number;
  observacao: string;
  produtos: Produto[];
  entrega: Entrega;
  documento_Fiscais: DocumentoFiscal[];
}
interface ClienteDetalhes {
  ordem: number;
  codigo: number;
  nome: string;
  fantasia: string;
  tipo: string;
  fisicaJuridica: string;
  cpfCnpj: string;
  rg: string;
  ie: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;
  telefone1: string;
  telefone2: string;
  fax: string;
  lGPD_Receber_Campanhas_Marketing: boolean;
  lGPD_Receber_Contato_Situacao_Pedido: boolean;
  lGPD_Telefone_Contato_Formatado: string;
  entregaCep: string;
  entregaEndereco: string;
  entregaComplemento: string;
  entregaBairro: string;
  entregaCidade: string;
  entregaUf: string;
  entregaPais: string;
  entregaPontoRef1: string;
  entregaPontoRef2: string;
  faturamentoCep: string;
  faturamentoEndereco: string;
  faturamentoNumero: string;
  faturamentoComplemento: string;
  faturamentoBairro: string;
  faturamentoCidade: string;
  faturamentoUf: string;
  faturamentoPais: string;
  faturamentoPontoRef1: string;
  faturamentoPontoRef2: string;
  indicadorIE: number;
  vendedor1: {
    ordem: number;
    codigo: number;
    nome: string;
  };
  vendedor2: {
    ordem: number;
    codigo: number;
    nome: string;
  };
  tabelaPrecosPadrao: string;
  codigoClasse: number;
  codigoFilial: number;
  filialExclusiva: boolean;
  urlContatos: string;
  utiliza_Fidelidade: boolean;
  contatos: Contatos[];
  inativo: boolean;
  comentariosGerente: string;
}
interface Contatos {
  ordem: number;
  codigo: number;
  nome: string;
  email: string;
  telefone: string;
  celular: string;
  observacao: string;
}
export interface Produto {
  ordem: number;
  ordem_Prod_Serv: number;
  codigo: string;
  quantidade: number;
  preco_Unitario: number;
  preco_Final: number;
  preco_Final_Com_Desconto: number;
  desconto_Unitario: number;
  desconto_Total: number;
}

export interface Entrega {
  volume: number;
  pesoBruto: number;
  pesoLiquido: number;
  opcoesFreteTipoEndereco: string;
  opcoesFretePagoPor: string;
  naoSomarFreteTotalNota: boolean;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cEP: string;
  dataPrometidoPara: string;
  situacao: string;
  entregueEm: string | null;
  entreguePara: string;
  placa: string;
  placaUF: string;
  rNTC: string;
  valor: number;
  modoEntrega: string;
  observacao: string;
}

export interface DocumentoFiscal {
  numero: string;
  data_Emissao: string;
  situacao: string;
  xML_Documento: string;
  xML_Autorizacao: string;
}
const entregaController = {
  // Controlador para criar uma nova entrega
  createEntrega: async (req: Request, res: Response): Promise<void> => {
    try {
      const dados = req.body;




      if (!dados || !dados.endereco_entrega) {
        res.status(400).json({ msg: "Dados de entrega inválidos" });
        return;
      }
      /* verificar se já não existe uma entrega com a mesma sequencia */
      const sequenciaExistente = await Entrega.findOne({ sequencia: dados.sequencia });
      if (sequenciaExistente) {

        res.status(400).json({ msg: "Já existe uma entrega com essa sequência" });
        return;
      }
      // Verifica o ultimo número da entrega já existe  exemplo: 0001, 0002, 0003
      const ultimoEntrega = await Entrega.findOne().sort({ numero: -1 });
      const numeroSequencia = ultimoEntrega ? ultimoEntrega.sequencia + 1 : 1;
      const novaEntrega = new Entrega({
        link_da_localizacao: dados.link_da_localizacao || '',
        numero: `ENT-${numeroSequencia.toString().padStart(4, '0')}`,

        sequencia: dados.sequencia,
        codigo_Cliente: dados.codigo_Cliente?.toString(),
        consumidor_nome: dados.consumidor_nome,
        consumidor_email: dados.consumidor_email || '',
        consumidor_contato: dados.consumidor_contato || '',
        numero_nf: dados.numero_nf || '',
        tipo_Operacao: dados.tipo_Operacao,
        tipo_Selecionado: dados.tipo_Selecionado,
        filial: dados.filial,
        vendedor: dados.vendedor,
        responsavelPorReceber: dados.responsavelPorReceber,
        endereco_entrega: dados.endereco_entrega,
        status_entrega: 'pendente',
        data_entrega: dados.data_entrega || null,
        data_confirmacao_cliente: dados.data_confirmacao_cliente || null,
        observacoes: dados.observacoes || [],
        // novos campos
        levarMaquina: typeof dados.levarMaquina === "boolean" ? dados.levarMaquina : false,
        parcelas: typeof dados.parcelas === "number" ? dados.parcelas : 1,
        historico: dados.historico || [],

      });

      const saved = await novaEntrega.save();
      res.status(201).json({ msg: "Entrega criada com sucesso", entrega: saved, sucesso: true });
    } catch (error) {


      res.status(500).json({ msg: "Erro ao criar entrega" });
    }
  },
  /* buscar entregas */
  getEntregas: async (req: Request, res: Response): Promise<void> => {
    try {
      const typeUser = req.headers.typeuser as string;
      const userId = req.headers.userid as string;

      if (!typeUser || !userId) {
        res.status(400).json({ msg: "Tipo de usuário ou ID do usuário não fornecido" });
        return;
      }

      const { data, sequencia, numero_nf, status } = req.query;


      // monta query base com filtros
      let baseQuery: any = {};

      if (data) {
        const dataStr = data as string; // ex: "2025-08-21"

        const inicio = new Date(`${dataStr}T00:00:00.000Z`);
        const fim = new Date(`${dataStr}T23:59:59.999Z`);

        baseQuery["createdAt"] = { $gte: inicio, $lte: fim };
      }


      if (sequencia) {
        baseQuery["sequencia"] = Number(sequencia);
      }

      if (numero_nf) {
        baseQuery["numero_nf"] = numero_nf;
      }

      if (status) {
        baseQuery["status_entrega"] = status;
      }

      let entregas;

      if (typeUser === "admin") {
        // Admin vê tudo
        entregas = await Entrega.find(baseQuery)
          .select("sequencia consumidor_nome numero_nf status_entrega data_entrega createdAt")
          .sort({ createdAt: -1 });

      } else if (typeUser === "user") {
        // Buscar cargo
        const user = await User.findById(userId).select("cargo");
        if (!user) {
          res.status(404).json({ msg: "Usuário não encontrado" });
          return;
        }

        if (["Supervisor de Logística", "Motorista", "Gerente"].includes(user.cargo ?? "")) {
          // vê tudo
          entregas = await Entrega.find(baseQuery)
            .select("sequencia consumidor_nome numero_nf status_entrega data_entrega createdAt")
            .sort({ createdAt: -1 });

        } else if ((user.cargo ?? "") === "Vendedor") {
          // só as dele
          entregas = await Entrega.find({ ...baseQuery, "vendedor.id": userId })
            .select("sequencia consumidor_nome numero_nf status_entrega data_entrega createdAt")
            .sort({ createdAt: -1 });

        } else {
          res.status(403).json({ msg: "Cargo não autorizado" });
          return;
        }
      } else {
        res.status(403).json({ msg: "Tipo de usuário inválido" });
        return;
      }

      if (!entregas.length) {
        res.status(404).json({ msg: "Nenhuma entrega encontrada" });
        return;
      }

      res.status(200).json(entregas);
    } catch (error) {

      res.status(500).json({ msg: "Erro ao buscar entregas" });
    }
  },

  /* função para buscar entregas com status de pedente  */
  getEntregasPendentes: async (req: Request, res: Response): Promise<void> => {
    try {
      const entregasPendentes = await Entrega.find({ status_entrega: 'pendente' }).sort({ createdAt: -1 });

      res.status(200).json(entregasPendentes);
    } catch (error) {

      res.status(500).json({ msg: "Erro ao buscar entregas pendentes" });
    }
  },
  getEntregasDetails: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const entrega = await Entrega.findById(id);


      if (!entrega) {
        res.status(404).json({ msg: "Entrega não encontrada" });
        return;
      }

      res.status(200).json(entrega);
    } catch (error) {

      res.status(500).json({ msg: "Erro ao buscar detalhes da entrega" });
    }
  },
  /* função para cancelar entrega pelo id */
  cancelarEntrega: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const entrega = await Entrega.findById(id);
      if (!entrega) {
        res.status(404).json({ msg: "Entrega não encontrada" });
        return;
      }
      /* adicionar historico */
      entrega.historico.push({
        usuario: req.headers.username as string || "Sistema",
        data: new Date(),
        acao: "Entrega cancelada"
      });

      // Atualiza o status da entrega para cancelada
      entrega.status_entrega = 'cancelada';
      await entrega.save();

      res.status(200).json({ msg: "Entrega cancelada com sucesso" });
    } catch (error) {

      res.status(500).json({ msg: "Erro ao cancelar entrega" });
    }
  },
  /* função para adicionar obcevação pelo id da entrega */
  adicionarObservacao: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { observacao } = req.body;

      if (!observacao || typeof observacao !== "string") {
        res.status(400).json({ msg: "Observação inválida" });
        return;
      }

      const entrega = await Entrega.findById(id);
      if (!entrega) {
        res.status(404).json({ msg: "Entrega não encontrada" });
        return;
      }


      // monta objetos
      const novaObservacao = {
        texto: observacao,
        data: new Date(),
        usuario: (req.headers.username as string) || "Sistema",
      };
      const novoHistorico = {
        usuario: (req.headers.username as string) || "Sistema",
        data: new Date(),
        acao: "Observação adicionada",
      };

      // inicializa arrays se não tiverem
      if (!Array.isArray(entrega.observacoes)) entrega.observacoes = [];
      if (!Array.isArray(entrega.historico)) entrega.historico = [];

      // adiciona na entrega
      entrega.observacoes.push(novaObservacao);
      entrega.historico.push(novoHistorico);

      await entrega.save();

      // sincroniza entrega dentro da rota
      const rotaComEntrega = await Rota.findOne({ "entregas._id": entrega._id });

      if (rotaComEntrega) {


        const entregaNaRota = rotaComEntrega.entregas.find(
          (e) => e._id.toString() === String(entrega._id)
        );

        if (entregaNaRota) {
          // simplesmente copia os arrays inteiros da entrega
          entregaNaRota.observacoes = [...entrega.observacoes];
          entregaNaRota.historico = [...entrega.historico];
          await rotaComEntrega.save();
        }
      }

      res.status(200).json({
        msg: "Observação adicionada com sucesso",
        entrega,
      });
    } catch (error) {

      res.status(500).json({ msg: "Erro ao adicionar observação", error });
    }
  },
  attachDocumentEntrega: async (req: Request, res: Response) => {
    try {
      const entregaId = req.params.id;
      const id_usuario = req.headers.id as string;
      const { tipo, observacao, url, key } = req.body;
      

      if (!entregaId || !id_usuario) {
        return res.status(400).json({ msg: "ID da entrega e do usuário são necessários" });
      }

      if (!url) {
        return res.status(400).json({ msg: "URL do anexo é obrigatório" });
      }

      const entrega = await Entrega.findById(entregaId);
      if (!entrega) {
        return res.status(404).json({ msg: "Entrega não encontrada" });
      }

      // Adiciona o anexo
      const anexo = {
        data: new Date(),
        usuario: req.headers.username as string || "Sistema",
        nome: tipo,
        observacao: observacao || '',
        url,
        key
      };
      /* qando o tipo for "canhotoAss" mudar o status para entregue */
      if (!entrega.anexos) entrega.anexos = [];
      if (!entrega.historico) entrega.historico = [];
      if (tipo === "canhotoAss") {
        entrega.status_entrega = "entregue";
        entrega.data_confirmacao_cliente = new Date();
        entrega.historico.push({
          usuario: req.headers.username as string || "Sistema",
          data: new Date(),
          acao: `Anexo adicionado: ${tipo} - Status alterado para entregue`
        });
      }
      else {
        entrega.historico.push({
          usuario: req.headers.username as string || "Sistema",
          data: new Date(),
          acao: `Anexo adicionado: ${tipo}`
        });
      }
      entrega.anexos.push(anexo);


      const entregaAtualizada = await entrega.save();

      // Sincroniza com a rota
      const rotaComEntrega = await Rota.findOne({ "entregas._id": entrega._id });
      if (rotaComEntrega) {
        const entregaNaRota = rotaComEntrega.entregas.find(e => e._id.toString() === (entrega._id as any).toString());
        if (entregaNaRota) {



          entregaNaRota.anexos = [...(entrega.anexos ?? [])];
          entregaNaRota.historico = [...entrega.historico];
          entregaNaRota.status_entrega = entrega.status_entrega;



        }
        // Verifica se todas as entregas da rota estão entregues para finalizar a rota
        const todasEntregues = rotaComEntrega.entregas.every(e => e.status_entrega === "entregue");
        if (todasEntregues) {
          rotaComEntrega.status = "concluida";
        }
        await rotaComEntrega.save();
      }

      return res.status(200).json({
        success: true,
        msg: "Anexo adicionado com sucesso",
        entrega: entregaAtualizada
      });
    } catch (error) {

      return res.status(500).json({ msg: "Erro ao adicionar anexo", error });
    }
  },

  removeAttachEntrega: async (req: Request, res: Response) => {
    try {
      const entregaId = req.params.id;
      const id_usuario = req.headers.id as string;
      const { key } = req.body;

      if (!entregaId || !id_usuario || !key) {
        return res.status(400).json({ msg: "ID da entrega, do usuário e key do anexo são obrigatórios" });
      }

      const entrega = await Entrega.findById(entregaId);
      if (!entrega) return res.status(404).json({ msg: "Entrega não encontrada" });

      const anexoRemovido = entrega.anexos?.find(a => a.key === key);
      if (!anexoRemovido) return res.status(404).json({ msg: "Anexo não encontrado" });

      entrega.anexos = entrega.anexos?.filter(a => a.key !== key);
      entrega.historico.push({
        usuario: req.headers.username as string || "Sistema",
        data: new Date(),
        acao: `Anexo removido: ${anexoRemovido.nome || "sem nome"}`
      });

      const entregaAtualizada = await entrega.save();

      // Sincroniza com a rota
      const rotaComEntrega = await Rota.findOne({ "entregas._id": entrega._id });
      if (rotaComEntrega) {
        const entregaNaRota = rotaComEntrega.entregas.find(e => e._id.toString() === String(entrega._id));
        if (entregaNaRota) {
          entregaNaRota.anexos = [...(entrega.anexos ?? [])];
          entregaNaRota.historico = [...entrega.historico];
          await rotaComEntrega.save();
        }
      }

      return res.status(200).json({
        success: true,
        msg: "Anexo removido com sucesso",
        entrega: entregaAtualizada
      });
    } catch (error) {

      return res.status(500).json({ msg: `Erro interno ao remover anexo: ${error}` });
    }
  }


};

export default entregaController;

