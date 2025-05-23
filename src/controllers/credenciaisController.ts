/* credenciasController */
import { Request, Response } from 'express';
import credenciais from '../models/credenciais';
import Admin from '../models/Admin';
import dotenv from "dotenv";

dotenv.config();

const credenciaisController = {

    // Registrar uma nova credencial
    registerCredencial: async (req: Request, res: Response): Promise<void> => {

      /* pegar admin com id */
      const admin = await Admin.findById(req.headers.id);

      if (!admin) {
        res.status(404).json({ msg: "Admin não encontrado" });
        return;
      }
      

        const { apiURL, serie, codeFilial,password } = req.body;
       
    
        try {
        // Verificar se a credencial já existe
        const existingCredencial = await credenciais.findOne({credencial_user_id: admin._id });
        if (existingCredencial) {
            res.status(400).json({ msg: "Esta credencial já está em uso." });
            return;
        }
    
        // Criar nova credencial
        const newCredencial = new credenciais({
            api: apiURL,
            serie,
            codFilial: codeFilial,
            senha: password,
            credencial_user_id: admin._id,
        });
    
        // Salvar no banco de dados
        await newCredencial.save();
        
    
        res.status(201).json({
            msg: "Credencial registrada com sucesso!",
            credencial: {
            _id: newCredencial._id,
            api: newCredencial.api,
            serie: newCredencial.serie,
            codFilial: newCredencial.codFilial,
            senha: newCredencial.senha,
            credencial_user_id: newCredencial.credencial_user_id,
            },
        });
        } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
        }
    },
    
    // Listar todas as credenciais
    listCredenciais: async (req: Request, res: Response): Promise<void> => {
        try {
            const credencial_user_id = req.headers.id;
        // Listar todas as credenciais
        const credenciaisList = await credenciais.find({ credencial_user_id });
        res.status(200).json({ credenciais: credenciaisList });
        } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
        }
    },
    
    // editar uma credencial pelo id
    updateIdealSoftwareCredentials: async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
    
        try {
        const credencial = await credenciais.findById(id);
        if (!credencial) {
            res.status(404).json({ msg: "Credencial não encontrada." });
            return;
        }

        const { api , serie, codFilial,senha } = req.body;
    

        // Atualizar credencial
          credencial.api = api || credencial.api;
        credencial.serie = serie || credencial.serie;
        credencial.codFilial = codFilial || credencial.codFilial;
        credencial.senha = senha || credencial.senha;

        // Salvar no banco de dados

        await credencial.save();
        res.status(200).json({ msg: "Credencial atualizada com sucesso!" });
        } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
        }
    }
};

export default credenciaisController;
 


