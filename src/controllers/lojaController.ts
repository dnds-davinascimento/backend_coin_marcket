import { Request, Response } from "express";
import { Loja } from "../models/loja";
import Admin from "../models/Admin";
import dotenv from "dotenv";

dotenv.config();

const lojaController = {
  createLoja: async (req: Request, res: Response): Promise<void> => {
    const {
      nome,
      email,
      telefone,
      whatsApp,
      facebook,
      instagram,
      site,
      razao_social,
      prestacao_de_servicos,
      comercializacao_de_produtos,
      utilizar_acrescimo_por_forma,
      cnpj,
      regime_tributario,
      utiliza_NFC,
      utiliza_NFC_e,
      centro_distribuicao,
      calcularcasheback,
      fechamento_unico,
      emissao_aut_nfc_e,
      descontar_aut_produtos_sincronizados,
      certificado,
      identificador_do_csc,
      codigo_de_Segurança_do_contribuinte,
      cnpj_cpf_do_escritorio_de_contabilidade,
      inscricao_municipal,
      inscricao_estadual,
      endereco,
      criadoPor
    } = req.body;

    try {
      // Validações básicas
      if (!nome || !telefone || !razao_social || !cnpj) {
        res.status(400).json({ 
          msg: "Campos obrigatórios faltando: nome, telefone, razão social e CNPJ são necessários" 
        });
        return;
      }

      // Verificar se CNPJ já existe
      const existingLoja = await Loja.findOne({ cnpj });
      if (existingLoja) {
        res.status(400).json({ msg: "Já existe uma loja cadastrada com este CNPJ" });
        return;
      }

      // Verificar se admin criador existe
      if (criadoPor) {
        const adminExists = await Admin.findById(criadoPor);
        if (!adminExists) {
          res.status(400).json({ msg: "Admin criador não encontrado" });
          return;
        }
      }

      // Criar nova loja
      const novaLoja = new Loja({
        nome,
        email,
        telefone,
        whatsApp,
        facebook,
        instagram,
        site,
        razao_social,
        prestacao_de_servicos: prestacao_de_servicos || false,
        comercializacao_de_produtos: comercializacao_de_produtos || false,
        utilizar_acrescimo_por_forma: utilizar_acrescimo_por_forma || false,
        cnpj,
        regime_tributario,
        utiliza_NFC: utiliza_NFC || false,
        utiliza_NFC_e: utiliza_NFC_e || false,
        centro_distribuicao: centro_distribuicao || false,
        calcularcasheback: calcularcasheback || false,
        fechamento_unico: fechamento_unico || false,
        emissao_aut_nfc_e: emissao_aut_nfc_e || false,
        descontar_aut_produtos_sincronizados: descontar_aut_produtos_sincronizados || false,
        certificado,
        identificador_do_csc,
        codigo_de_Segurança_do_contribuinte,
        cnpj_cpf_do_escritorio_de_contabilidade,
        inscricao_municipal,
        inscricao_estadual,
        endereco,
        criadoPor
      });

      // Salvar no banco de dados
      await novaLoja.save();

      // Retornar resposta sem informações sensíveis
      res.status(201).json({
        msg: "Loja criada com sucesso",
        loja: {
          _id: novaLoja._id,
          nome: novaLoja.nome,
          email: novaLoja.email,
          telefone: novaLoja.telefone,
          razao_social: novaLoja.razao_social,
          cnpj: novaLoja.cnpj,
          createdAt: novaLoja.createdAt
        }
      });

    } catch (error) {
      console.error("Erro ao criar loja:", error);
      res.status(500).json({ msg: "Erro no servidor ao criar loja"});
    }
  },

  // Outras funções do controller podem ser adicionadas aqui...
};

export default lojaController;