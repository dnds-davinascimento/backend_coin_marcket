import { Request, Response } from 'express';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import User from '../models/user';

dotenv.config();

const loginController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ msg: 'Preencha todos os campos.' });
      return;
    }

    try {
      // Verificar se o email existe no Admin ou no User
      const existingAdmin = await Admin.findOne({ email });
      const existingUser = !existingAdmin ? await User.findOne({ email }) : null;

      const user = existingAdmin || existingUser;

      if (!user) {
        res.status(400).json({ msg: 'Usuário não encontrado.' });
        return;
      }

      // Verificar se a senha está correta
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        res.status(400).json({ msg: 'Senha ou Email incorretos.' });
        return;
      }

      const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        permissions: existingUser?.permissions,
        user_store_id: existingUser?.user_store_id,
        isAdmin: existingAdmin ? existingAdmin.isAdmin : false,
        nuvemshopConfigured: existingAdmin?.nuvemshopConfigured || true,
      };
     

      const secret = process.env.JWT_SECRET as string;
      const token = jwt.sign(payload, secret);
    

      res.status(200).json({ token, user: payload });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde.' });
    }
  },
};

export default loginController;
