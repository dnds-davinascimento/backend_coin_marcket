import { Request, response, Response } from "express";
import { Venda } from "../models/venda";
import { Loja } from "../models/loja";
import { Cart } from "../models/cart";
import Admin from "../models/Admin"; // Importa o model Admin
import User from "../models/user"; // Importa o model User
import { Customer } from "../models/custumer"; // Importa o model Customer
import { obterCredenciais } from "../services/credenciaisService";
import { generateSignature } from "../services/generateSignature";
import authService from "../services/authService";
import axios from "axios";
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
export interface OrdemVendaResponse {
  sucesso: boolean;
  mensagem: string | null;
  tipo: string | null;
  complementoTipo: string | null;
  statusCode: number;
  dados: DadosOrdemVenda;
}

export interface DadosOrdemVenda {
  ordem: number;
  sequencia: number;
  tipo_Operacao: string;
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
  contatos: any[]; // pode tipar melhor se souber a estrutura
  inativo: boolean;
  comentariosGerente: string;
}

interface IdealSoftClienteResponse {
  sucesso: boolean;
  mensagem: string | null;
  tipo: string | null;
  complementoTipo: string | null;
  statusCode: number;
  dados: ClienteDetalhes;
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
      const vendedor = req.body.vendedor;
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
        vendedor: vendedor || null,
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


      const cart = await Cart.findOne({ 'consumidor.id': custumerId, 'status_Cart': "aberto" });

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

      return res.status(500).json({msg: "Erro ao processar o pedido", });
    }
  },
  getByConsumidor: async (req: Request, res: Response) => {
    try {
      const custumer_id = req.headers['id'] as string | undefined;



      const Order = await Venda.find({ "consumidor.id": custumer_id }).sort({ createdAt: -1 });


      return res.status(200).json(Order);
    } catch (error) {
      return res.status(500).json({ msg: "Erro interno ao buscar Order do consumidor",});
    }
  },
  getByOrderEmitente: async (req: Request, res: Response) => {
    try {
            let id_loja = req.headers.user_store_id as string;
      if (!id_loja) {
        id_loja = "6807ab4fbaead900af4db229"
      }




      const Order = await Venda.find({ "emitente._id": id_loja }).sort({ createdAt: -1 });


      return res.status(200).json(Order);
    } catch (error) {
      return res.status(500).json({ msg: "Erro interno ao buscar Order do consumidor", });
    }
  },
  getOrderDetails: async (req: Request, res: Response) => {
    try {
      const venda_id = req.params.id



      const Order = await Venda.findById(venda_id);


      return res.status(200).json(Order);
    } catch (error) {
      return res.status(500).json({ msg: "Erro interno ao buscar Order do consumidor"});
    }
  },
  getsequencia: async (req: Request, res: Response): Promise<Response> => {
    try {
      let id_loja = req.headers.user_store_id as string;
      if (!id_loja) {
        id_loja = "6807ab4fbaead900af4db229"
      }
      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(id_loja);

      const url_ideal = process.env.PRODUTION === "true" ? api : `${process.env.URL_IDEAL_LOCAL}`;
      

      // Obter o token de autenticação para Idealsoft
      const token = await authService.getAuthToken(serie, codFilial, api);
      const method = "get";
      const body = "";
      const { signature, timestamp } = generateSignature(method, senha, body);

      // pegar n° de recibo pelo req.headers
      const sequenciaGerada = req.query.sequencia;
      // 2. Configuração do cabeçalho da requisição
      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };

      // 3. Requisição para a API da Idealsoft com os headers
      const { data } = await axios.get<OrdemVendaResponse>(
        `${url_ideal}/saidas/detalhes/${sequenciaGerada}`,
        { headers }
      );
      
      if (data.dados === null) {
        return res.status(404).json({ msg: "Venda não encontrada" });
      }
      const codigo = data.dados.codigo_Cliente;

      // Requisição para a API da Idealsoft com os headers e o código do cliente
      const { data: RsponseClente } = await axios.get<IdealSoftClienteResponse>(`${url_ideal}/clientes/detalhes/${codigo}`, {
        headers,
      });
/* incluir dados do cliente na resposta final dentro de dados */

      const responseData = {
        ...data,
        dados: {
          ...data.dados,
          cliente: RsponseClente.dados
        }
      };
      return res.status(200).json(responseData);
    } catch (error) {
      
      return res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
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
      /* quando status atual for pagamento em analize e porximo for aprovado_para_pagamento mudar status do pagamento para aprovado */
      if (atual === "pagamento_em_análise" && proximo === "aprovado_para_pagamento") {
        venda.formas_de_pagamento_array.forEach((pagamento: any) => {
          pagamento.status = "aprovado"; // Atualiza o status do pagamento para aprovado
        });
      }
      /* quando o status atual for aprovado_para_pagamento  e o proximo pagamento_em_análise as formas de pagamento tem que esta preenchida e o valor totas tem que bater com valor da venda
        */
      if (atual === "aprovado_para_pagamento" && proximo === "pagamento_em_análise") {
        if (!venda.formas_de_pagamento_array || venda.formas_de_pagamento_array.length === 0) {
          return res.status(400).json({ msg: "Formas de pagamento não informadas. Por favor, adicione as formas de pagamento antes de avançar." });
        }

        const totalPagamento = venda.formas_de_pagamento_array.reduce((total: number, pagamento: any) => total + pagamento.valor, 0);
        if (totalPagamento < venda.valorTotal) {
          return res.status(400).json({ msg: "O valor total das formas de pagamento não corresponde ao valor da venda." });
        }

      }
      if (atual === "pagamento_em_análise" && proximo === "pagamento_aprovado") {
        venda.formas_de_pagamento_array.forEach((pagamento: any) => {
          pagamento.status = "aprovado";
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

      return res.status(500).json({ msg: "Erro ao avançar o processo" });
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

      return res.status(500).json({ msg: "Erro ao enviar pagamento para análise", });
    }
  },
  attachDocument: async (req: Request, res: Response) => {
    try {
      const vendaId = req.params.id;
      const id_usuario = req.headers.id as string;
      const { tipo, observacao, url, key } = req.body;


      if (!vendaId || !id_usuario) {
        return res.status(400).json({ msg: "ID da venda e do usuário são necessários" });
      }

      if (!url) {
        return res.status(400).json({ msg: "URL do anexo são obrigatórios" });
      }

      const venda = await Venda.findById(vendaId);
      if (!venda) {
        return res.status(404).json({ msg: "Venda não encontrada" });
      }

      const usuario = await User.findById(id_usuario) || await Admin.findById(id_usuario) || await Customer.findById(id_usuario);
      if (!usuario) {
        return res.status(404).json({ msg: "Usuário não encontrado" });
      }

      if (venda.status_venda === "em análise") {
        return res.status(400).json({
          msg: "Não é possível anexar o comprovante de pagamento enquanto a venda estiver em análise."
        });
      }




      // Adicionar o anexo
      const anexo = {
        data: new Date(),
        usuario: usuario.name || "Sistema",
        nome: tipo, // Tipo do anexo (comprovante_pagamento, nota_fiscal, comprovante_entrega, outro)
        observacao,
        url,
        key
      };

      if (!venda.anexos) {
        venda.anexos = [];
      }
      venda.anexos.push(anexo);
      venda.historico.push({
        usuario: usuario.name || "Sistema",
        data: new Date(),
        acao: `Anexo adicionado: ${tipo}`
      });

      const vendaAtualizada = await venda.save();

      return res.status(200).json({
        success: true,
        msg: "Anexo adicionado com sucesso",
        venda: vendaAtualizada
      });
    } catch (error) {

    }
  },
  /* função para remover anexo */

  removeAttach: async (req: Request, res: Response) => {
    try {
      const vendaId = req.params.id;
      const id_usuario = req.headers.id as string;
      const { key } = req.body;
      

      if (!vendaId || !id_usuario || !key) {
        return res.status(400).json({ msg: "ID da venda, do usuário e key do anexo são obrigatórios" });
      }

      const venda = await Venda.findById(vendaId);
      if (!venda) {
        return res.status(404).json({ msg: "Venda não encontrada" });
      }

      const usuario = await User.findById(id_usuario) || await Admin.findById(id_usuario) || await Customer.findById(id_usuario);
      if (!usuario) {
        return res.status(404).json({ msg: "Usuário não encontrado" });
      }

      // Filtra fora o anexo com a key recebida
      const anexoRemovido = venda.anexos?.find((a: any) => a.key === key);
      if (!anexoRemovido) {
        return res.status(404).json({ msg: "Anexo não encontrado" });
      }

      venda.anexos = venda.anexos?.filter((a: any) => a.key !== key);

      venda.historico.push({
        usuario: usuario.name || "Sistema",
        data: new Date(),
        acao: `Anexo removido: ${anexoRemovido.nome || "sem nome"}`
      });

      const vendaAtualizada = await venda.save();

      return res.status(200).json({
        success: true,
        msg: "Anexo removido do Mongo com sucesso",
        venda: vendaAtualizada
      });
    } catch (error) {
      
      return res.status(500).json({ msg: `Erro interno ao remover anexo:${error}` });
    }
  }

};

export default venda_Schema;
