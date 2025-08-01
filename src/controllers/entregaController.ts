import { Request, Response } from "express";
import { Entrega } from "../models/entregas";
import { link } from "fs";

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
    const dados= req.body;
    

    if (!dados || !dados.endereco_entrega) {
      res.status(400).json({ message: "Dados de entrega inválidos" });
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
      vendedor: dados.vendedor ,
      endereco_entrega: dados.endereco_entrega,
      status_entrega: 'pendente',
      data_entrega: dados.data_entrega || null,
      data_confirmacao_cliente: dados.data_confirmacao_cliente || null,

      historico:dados.historico || [],
    });

    const saved = await novaEntrega.save();
    res.status(201).json({ message: "Entrega criada com sucesso", entrega: saved,sucesso: true });
  } catch (error) {
    console.error("Erro ao criar entrega:", error);
    res.status(500).json({ message: "Erro ao criar entrega" });
  }
},
/* buscar entregas */
getEntregas: async (req: Request, res: Response): Promise<void> => {
  try {
    const entregas = await Entrega.find().select(
      'sequencia consumidor_nome numero_nf status_entrega data_entrega createdAt'
    ).sort({ createdAt: -1 }); // opcional: ordena da mais recente pra mais antiga

    res.status(200).json(entregas);
  } catch (error) {
    console.error("Erro ao buscar entregas:", error);
    res.status(500).json({ message: "Erro ao buscar entregas" });
  }
},
/* função para buscar entregas com status de pedente  */
getEntregasPendentes: async (req: Request, res: Response): Promise<void> => {
  try {
    const entregasPendentes = await Entrega.find({ status_entrega: 'pendente' }).sort({ createdAt: -1 });

    res.status(200).json(entregasPendentes);
  } catch (error) {
    console.error("Erro ao buscar entregas pendentes:", error);
    res.status(500).json({ message: "Erro ao buscar entregas pendentes" });
  }
},
getEntregasDetails: async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
   
    const entrega = await Entrega.findById(id);

    if (!entrega) {
      res.status(404).json({ message: "Entrega não encontrada" });
      return;
    }

    res.status(200).json(entrega);
  } catch (error) {
    console.error("Erro ao buscar detalhes da entrega:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes da entrega" });
  }
}




};

export default entregaController;

