import { Request, Response } from "express";
import Admin from "../models/Admin"; // Importa o model Admin
import bcrypt from "bcryptjs";  // Alterado para bcryptjs
import dotenv from "dotenv";

dotenv.config(); // Carregar as variáveis de ambiente

const adminController = {
  // Registrar um novo admin
  registerAdmin: async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    try {
      // Verificar se o email já existe
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        res.status(400).json({ msg: "Este email já está em uso." });
        return;
      }

      // Criptografar a senha
      const salt = await bcrypt.genSalt(12);  // Funciona igual com bcryptjs
      const hashedPassword = await bcrypt.hash(password, salt);  // Funciona igual com bcryptjs

      // Criar novo admin
      const newAdmin = new Admin({
        name: name,
        email,
        password: hashedPassword,
      });

      // Salvar no banco de dados
      await newAdmin.save();

      res.status(201).json({
        msg: "Admin registrado com sucesso!",
        admin: {
          _id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
    
        },
      });
    } catch (error) {
     
      res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },
  AdminById: async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id; // Pega o ID do usuário dos parâmetros da rota
    

    try {
      // Verificar se o usuário existe
      const user = await Admin.findById(userId);

      if (!user) {
        res.status(404).json({ msg: "Usuário não encontrado." });
        return;
      }

      // Deletar o usuário

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },
    // Função para editar admin por ID
   updateAdminById: async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params; // Obtém o ID dos parâmetros da rota
      const { name, email, password, paymentAlert } = req.body;
     
  
      try {
        // Verifica se o admin existe pelo ID
        const admin = await Admin.findById(id);
        if (!admin) {
          res.status(404).json({ msg: "Admin não encontrado." });
          return;
        }
  
        // Atualizar os campos se foram enviados no corpo da requisição
        if (name) admin.name = name;
        admin.paymentAlert = paymentAlert;
        if (email) {
          // Verificar se o email já está em uso por outro admin
          const existingAdmin = await Admin.findOne({ email });
          if (existingAdmin && existingAdmin._id.toString() !== id) {
            res.status(400).json({ msg: "Este email já está em uso." });
            return;
          }
          admin.email = email;
        }
        
        // Atualizar a senha, se fornecida
        if (password) {
          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(password, salt);
          admin.password = hashedPassword;
        }
  
        // Salva as alterações no banco de dados
        await admin.save();
  
        res.status(201).json({
          msg: "Admin atualizado com sucesso!",
          admin: {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            paymentAlert:admin.paymentAlert
          },
        });
      } catch (error) {
        
        res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde." });
      }
    },

};

export default adminController;
