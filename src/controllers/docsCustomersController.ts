import { Request, Response } from "express";
import { generateSignedUrl } from "../services/uploadToS3";
import { Customer } from "../models/custumer";
import DocumentCustomerModel from "../models/dosc_custumer";
const documentController = {
  saveDocumentosCustomers: async (req: Request, res: Response) => {
    try {
      const customer_id = req.headers['id'] as string | undefined;
      const {
        email,
        rg_frente,
        rg_verso,
        cnh_frente,
        cnh_verso,
        comprovante_residencia,
        contrato_social
      } = req.body;

      // Verifica se o customer_id é válido
      const consumidor = await Customer.findById(customer_id);
      if (!consumidor) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      const dataToSave: any = {
        customer_id: consumidor._id,
        name: consumidor.name,
        email: consumidor.email || email, // Usa o email do cliente ou o fornecido
        status: 'em análise', // Status inicial
        rg_frente,
        rg_verso,
        cnh_frente,
        cnh_verso,
        comprovante_residencia,
        contrato_social,
      };

      const existingDoc = await DocumentCustomerModel.findOne({ customer_id });

      let doc;
      if (existingDoc) {
        // Atualiza caso já exista
        doc = await DocumentCustomerModel.findOneAndUpdate(
          { customer_id },
          { $set: dataToSave },
          { new: true }
        );
      } else {
        // Cria novo
        doc = await DocumentCustomerModel.create(dataToSave);
      }

      res.status(200).json({ message: 'Documentos salvos com sucesso!', document: doc });

    } catch (error) {
      console.error('Erro ao salvar documentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  generateSignedUrl: async (req: Request, res: Response) => {
    const { folder, filetype } = req.body;


    if (!folder || !filetype) {
      return res.status(400).json({ error: 'Folder e filetype são obrigatórios.' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(filetype)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido.' });
    }

    try {
      const { url, key } = await generateSignedUrl(folder, filetype);
      res.status(200).json({ url, key });
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },
  /* pegar documentos por constomers */
  getDocumentosCustomers: async (req: Request, res: Response) => {
    try {
      const customer_id = req.headers['id'] as string | undefined;
      if (!customer_id) {
        return res.status(400).json({ error: 'ID do cliente é obrigatório.' });
      }

      const documentos = await DocumentCustomerModel.findOne({ customer_id });


      res.status(200).json(documentos);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },
  /* pegar docs por id docustomer */
  getDocumentosCustomersById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      if (!id) {
        return res.status(400).json({ error: 'ID do cliente é obrigatório.' });
      }
      const documentos = await DocumentCustomerModel.findOne({ customer_id: id });

      res.status(200).json(documentos);
    } catch (error) {
      console.error('Erro ao buscar documentos por ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },
  /* função para aprovar status do cutomers */
  approveDocsCustomerStatus: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.query;

    // Verifica se o ID do cliente foi fornecido
    if (!id) {
      res.status(400).json({ msg: "ID do cliente é necessário" });
      return;
    }
    // Verifica se o status foi fornecido
    if (status && typeof status !== 'string') {
      res.status(400).json({ msg: "Status deve ser uma string" });
      return;
    }
    try {
      const documentcustomer = await DocumentCustomerModel.findById(id);
      if (!documentcustomer) {
        res.status(404).json({ msg: "Cliente não encontrado" });
        return;
      }
      // Atualiza o status do cliente para "aprovado"
      documentcustomer.status = status ? status : documentcustomer.status; // Se status não for fornecido, usa o status atual ou define como 'aprovado'
      await documentcustomer.save();
      res.status(200).json({ msg: "Status do cliente atualizado para aprovado", documentcustomer });
    } catch (error) {
      console.error("Erro ao aprovar status do cliente:", error);
      res.status(500).json({ msg: "Erro no servidor ao aprovar status do cliente" });
    }
  }


};

export default documentController;