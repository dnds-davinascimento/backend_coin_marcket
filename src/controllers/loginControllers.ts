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
      let user_store_id = "6807ab4fbaead900af4db229";


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

      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // garante que em produção só via HTTPS
        sameSite: "strict", // previne CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      })
        .status(200)
        .json({
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
