import { Request, Response } from 'express';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { Customer } from "../models/custumer"; // Importa o model Customer
import User from '../models/user';
import { Loja } from "../models/loja";
dotenv.config();

const loginController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ msg: 'Preencha todos os campos.' });
      return;
    }

    try {
      // Verificar se o email existe no Admin, User ou Customer
      // Adicionamos .select('+password') para incluir o campo password
      const existingAdmin = await Admin.findOne({ email }).select('+password');
      const existingUser = !existingAdmin ? await User.findOne({ email }).select('+password') : null;
      const existingCustomer = !existingUser ? await Customer.findOne({ email }).select('+password') : null;

      const user = existingAdmin || existingUser || existingCustomer;

      if (!user) {
        res.status(400).json({ msg: 'Usuário não encontrado.' });
        return;
      }

      // Verificar se a senha está correta
      if (!user.password) {
        res.status(400).json({ msg: 'Senha ou Email incorretos.' });
        return;
      }
      
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        res.status(400).json({ msg: 'Senha ou Email incorretos.' });
        return;
      }
      let user_store_id = null;
      
      // Para Users
      if (existingUser) {
        user_store_id = existingUser.user_store_id;
      } 
      // Para Admins
      else if (existingAdmin) {
        // CORREÇÃO AQUI: Usar findOne em vez de findById
        const lojaExistente = await Loja.findOne({ criadoPor: existingAdmin._id });
        
        if (!lojaExistente) {
          res.status(404).json({ msg: "Loja não encontrada para este admin." });
          return;
        }
        user_store_id = lojaExistente._id;
      }
      // Criar payload sem a senha
      const payload = {
        type: existingAdmin ? 'admin' : existingUser ? 'user' : 'customer',
        id: user._id,
        name: user.name,
        thumbnail_url: existingCustomer?.thumbnail?.url,
        email: user.email,
        user_store_id: user_store_id,
        permissions: existingUser?.permissions,
        isAdmin: existingAdmin ? true : false,
        isCustomer: existingCustomer ? true : false,
        isUser: existingUser ? true : false,
      };

      
     
      const secret = process.env.JWT_SECRET as string;
      const token = jwt.sign(payload, secret);
    
      res.status(200).json({ 
        token, 
        user: payload,
        userType: existingAdmin ? 'admin' : existingUser ? 'user' : 'customer'
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde.' });
    }
  },
};

export default loginController;
