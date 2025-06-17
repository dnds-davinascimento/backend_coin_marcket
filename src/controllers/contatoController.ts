import { Request, Response } from 'express';
import dotenv from 'dotenv';
import contato from '../models/contato';
dotenv.config();

const contatoController = {
  criarContato: async (req: Request, res: Response): Promise<void> => {
 try {
    const {  nome, email, telefone, assunto, mensagem } = req.body;
    

    // Validação básica
    if ( !nome || !email || !telefone || !assunto || !mensagem) {
        res.status(400).json({
            error: 'Todos os campos são obrigatórios.',
        });
        return;
    }
    /* validar para ver se já não tem um contato para o email com mesmo assunto e mensagem */
    const contatoExistente = await contato.findOne({
      email,
      assunto,
      mensagem,
    });
    if (contatoExistente) {
      res.status(400).json({
        msg: 'Já existe uma solicitação com este email, assunto e mensagem.',
      });
      return;
    }   

    const novoContato = new contato({
     
      nome,
      email,
      telefone,
      assunto,
      mensagem,
    });

    const contatoSalvo = await novoContato.save();

    res.status(201).json({
      msg: 'Contato criado com sucesso!',
      data: contatoSalvo,
    });
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    res.status(500).json({
      error: 'Erro interno ao criar o contato.',
    });
  }

   
  },
};

export default contatoController;
