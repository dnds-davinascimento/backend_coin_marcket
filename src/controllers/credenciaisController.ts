/* credenciasController */
import { Request, Response } from 'express';
import credenciais from '../models/credenciais';
import Admin from '../models/Admin';
import { Loja } from "../models/loja";
import dotenv from "dotenv";

dotenv.config();

const credenciaisController = {

    // Registrar uma nova credencial
    registerCredencial: async (req: Request, res: Response): Promise<void> => {

      /* pegar Loja com id */
      const loja = await Loja.findById(req.headers.user_store_id);

      if (!loja) {
        res.status(404).json({ msg: "Loja não encontrada" });
        return;
      }
      

        const { apiURL, serie, codeFilial,password } = req.body;
       
    
        try {
        // Verificar se a credencial já existe
        const existingCredencial = await credenciais.findOne({credencial_loja_id: loja._id });
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
            credencial_loja_id: loja._id,
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
            credencial_loja_id: newCredencial.credencial_loja_id,
            },
        });
        } catch (error) {
        
        res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
        }
    },
    
    // Listar todas as credenciais
    listCredenciais: async (req: Request, res: Response): Promise<void> => {
        try {
         let id_loja = req.headers.user_store_id as string;
      if (!id_loja) {
        id_loja = "6807ab4fbaead900af4db229"
      }
        const credenciaisList = await credenciais.find({ credencial_loja_id:id_loja });
        res.status(200).json({ credenciais: credenciaisList });
        } catch (error) {
        
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
        
        res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
        }
    }
};

export default credenciaisController;
 


