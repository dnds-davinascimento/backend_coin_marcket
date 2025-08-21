import { Request, Response } from 'express';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { Customer } from "../models/custumer"; // Importa o model Customer
import User from '../models/user';
import nodemailer from "nodemailer";
import  ResetToken from '../models/ResetToken'; // Importa o model ResetToken
import { Loja } from "../models/loja";
dotenv.config();
//inteface mailOptions
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (mailOptions: MailOptions ) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "venda.croi.ns@gmail.com",
      pass: "dehq eejp kpql xcjc",
    },
  });
  // Configuração do e-mail

  await transporter.sendMail(mailOptions);



 

  try {
  /*   const info = await transporter.sendMail(mailOptions); */

  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
};
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
        statusCustomer: existingCustomer?.status ,
        user_store_id: user_store_id,
        permissions: existingUser?.permissions,
        isAdmin: existingAdmin ? true : false,
        isCustomer: existingCustomer ? true : false,
        typeCustomer: existingCustomer ? existingCustomer.type : null,
        cargoUser: existingUser?.cargo,
        isUser: existingUser ? true : false,
      };
      



      const secret = process.env.JWT_SECRET as string;
      const token = jwt.sign(payload, secret);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // garante que em produção só via HTTPS
        sameSite: 'none', // ajuda a evitar CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      })
        .status(200)
        .json({
          user: payload,
          userType: existingAdmin ? 'admin' : existingUser ? 'user' : 'customer'
        });

    } catch (error) {
      
      res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde.' });
    }
  },
 ForgotPassword: async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ msg: 'Preencha o campo de email.' });
    return;
  }

  try {
    // Verificar se o email existe
    const existingAdmin = await Admin.findOne({ email });
    const existingUser = !existingAdmin ? await User.findOne({ email }) : null;
    const existingCustomer = !existingUser ? await Customer.findOne({ email }) : null;
    const user = existingAdmin || existingUser || existingCustomer;

    if (!user) {
      res.status(400).json({ msg: 'Usuário não encontrado.' });
      return;
    }

  

    // Criar token de recuperação (expira em 1h)
    const secret = process.env.JWT_SECRET as string;
    const payload = {
      id: user._id,
      email: user.email,
      type: existingAdmin ? 'admin' : existingUser ? 'user' : 'customer',
    };

    const resetToken = jwt.sign(payload, secret, { expiresIn: '120s' });
    const resetUrl = `https://croidistribuidora.com.br/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"Croi Distribuidora" <venda.croi.ns@gmail.com>',
      to: String(user.email),
      subject: "Redefinição de Senha - Croi Distribuidora",
      html: `
        <h2>Olá ${user.name || 'usuário'},</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no botão abaixo para continuar:</p>
        <a href="${resetUrl}" style="padding: 12px 24px; background: #0A58CA; color: white; text-decoration: none; border-radius: 8px;">Redefinir Senha</a>
        <p>Ou copie e cole o link no navegador:</p>
        <p>${resetUrl}</p>
        <br />
        <p>Se você não solicitou essa mudança, pode ignorar este e-mail.</p>
        <p><strong>Croi Distribuidora</strong></p>
      `
    };

    await sendEmail(mailOptions);


// Salvar o token no banco
await ResetToken.create({
  user_id: user._id,
  token: resetToken,
});


    res.status(200).json({ msg: 'Email de redefinição de senha enviado com sucesso.' });

  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
    res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde.' });
  }
},
  ValidateToken: async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ msg: 'Token não fornecido.' });
      return;
    }

    try {
      const secret = process.env.JWT_SECRET as string;
      const decoded = jwt.verify(token, secret);

      // Verificar se o token existe no banco de dados
      const id = typeof decoded === 'object' && 'id' in decoded ? (decoded as any).id : null;
      if (!id) {
        res.status(400).json({ msg: 'Id do usuario no token não encontrado' });
        return;
      }
      const resetToken = await ResetToken.findOne({ user_id: id,});
      if (!resetToken) {
        res.status(400).json({ msg: 'Token não encontado' });
        return;
      }
      // Verificar se o token já foi usado
      if (resetToken.used) {
        res.status(400).json({ msg: 'Token já foi usado.' });
        return;
      }
      // Marcar o token como usado
      resetToken.used = true;
      await resetToken.save();
     
      res.status(200).json({ msg: 'Token válido.' });
    } catch (error) {
      console.error("Erro ao validar token: ", error);
      res.status(400).json({ msg: 'Token inválido ou expirado.' });
    }
  },
  ResetPassword: async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ msg: 'Preencha todos os campos.' });
      return;
    }
    

    try {
      const secret = process.env.JWT_SECRET as string;
      const decoded: any = jwt.verify(token, secret);

      // Verificar se o usuário existe
      const user = await Admin.findById(decoded.id) || 
                   await User.findById(decoded.id) || 
                   await Customer.findById(decoded.id);

      if (!user) {
        res.status(400).json({ msg: 'Usuário não encontrado.' });
        return;
      }

      // Atualizar a senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ msg: 'Senha redefinida com sucesso.' });

    } catch (error) {
      console.error("Erro ao redefinir senha: ", error);
      res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde.' });
    }
  }


};

export default loginController;
