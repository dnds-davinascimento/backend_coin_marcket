import { Request, Response } from "express";
import User from "../models/user";
import { Loja } from "../models/loja";
import Admin from "../models/Admin"; // Importa o model Admin
import bcrypt from "bcryptjs"; // Usando bcryptjs para a criptografia
import dotenv from "dotenv";

dotenv.config(); // Carregar as variáveis de ambiente

const userController = {
  // Registrar um novo usuário (admin ou padrão)
  registerUser: async (req: Request, res: Response): Promise<void> => {
             let id_loja = req.headers.user_store_id as string;
      if (!id_loja) {
        id_loja = "6807ab4fbaead900af4db229"
      }
  
    
    
  const loja = await Loja.findById(id_loja); // Busca a loja pelo ID
    if (!loja) {
      res.status(404).json({ msg: "Loja não encontrada." });
      return;
    }
    const id_store = loja._id; // ID da loja

    const { email, password, name, permissions, paymentAlert,cargo } = req.body;

    try {
      // Verificar se o email já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ msg: "Este email já está em uso." });
        return;
      }

      // Criptografar a senha
      const salt = await bcrypt.genSalt(12); // Gerar o salt para a hash
      const hashedPassword = await bcrypt.hash(password, salt); // Hash da senha

      // Criar novo usuário
      const newUser = new User({
        name,
        email,
        cargo,
        paymentAlert,
        password: hashedPassword,
        user_store_id: id_store,
        permissions: permissions || {
       user: { view: false, create: false, edit: false, delete: false },
    product: { view: false, create: false, edit: false, delete: false },
    order: { view: false, create: false, edit: false, delete: false },
    delivery: { view: false, create: false, edit: false, delete: false },
    route: { view: false, create: false, edit: false, delete: false },
    client: { view: false, create: false, edit: false, delete: false },
    
        },
      });

      // Salvar no banco de dados
      await newUser.save();

      res.status(201).json({
        msg: "Usuário registrado com sucesso!",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          permissions: newUser.permissions,
        },
      });
    } catch (error) {
      
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },
 
  get_user_store: async (req: Request, res: Response): Promise<void> => {
    try {
       let id_loja = req.headers.user_store_id as string;
      if (!id_loja) {
        id_loja = "6807ab4fbaead900af4db229"
      }

      // Busca a loja no banco de dados pelo ID do usuário
      const store = await User.find({ user_store_id: id_loja }); // Supondo que você tenha um modelo de `Store`

      if (!store) {
        res.status(404).json({ msg: "Loja não encontrada." });
        return;
      }

      // Retorna os dados da loja
      res.status(200).json(store);
    } catch (error) {
     
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },
  /* função parar listar apenas usuarios que são Motoristas */
  getMotoristas: async (req: Request, res: Response): Promise<void> => {
    try {
      const motoristas = await User.find({ cargo: 'Motorista' }).select(
        'name email user_store_id'
      );

      res.status(200).json(motoristas);
    } catch (error) {
      console.error("Erro ao buscar motoristas:", error);
      res.status(500).json({ msg: "Erro ao buscar motoristas" });
    }
  },
  UserById: async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id; // Pega o ID do usuário dos parâmetros da rota
    

    try {
      // Verificar se o usuário existe
      const user = await User.findById(userId);

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
  // Função para editar um usuário por ID
  editUserById: async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id; // Pega o ID do usuário dos parâmetros da rota
    const { name, email, password, permissions, paymentAlert,cargo } = req.body; // Dados a serem atualizados
   

    try {
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ msg: "Usuário não encontrado." });
        return;
      }

      // Atualizar os campos do usuário se fornecidos
      if (name) user.name = name;
      if (email) user.email = email;
      if (cargo) user.cargo = cargo;
      if (typeof paymentAlert === 'boolean') // Verifica se paymentAlert é booleano
      
      user.paymentAlert = paymentAlert;

      // Atualizar a senha se for fornecida (e criptografá-la)
      if (password) {
        const salt = await bcrypt.genSalt(12); // Gerar o salt para a hash
        const hashedPassword = await bcrypt.hash(password, salt); // Hash da senha
        user.password = hashedPassword;
      }

      // Atualizar permissões se fornecidas
      if (permissions) user.permissions = permissions;

      // Salvar as alterações no banco de dados
      await user.save();

      res.status(201).json({ msg: "Usuário atualizado com sucesso!", user });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },

  deleteUserById: async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id; // Pega o ID do usuário dos parâmetros da rota

    try {
      // Verificar se o usuário existe
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ msg: "Usuário não encontrado." });
        return;
      }

      // Deletar o usuário
      await User.findByIdAndDelete(userId);

      res.status(200).json({ msg: "Usuário deletado com sucesso!" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },
  /* função para o propio usuario editar o seu nome, email ou senha  */
  editOwnUser: async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;; // Pega o ID do usuário autenticado
    const { name, email, password } = req.body; // Dados a serem atualizados

   

    try {
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ msg: "Usuário não encontrado." });
        return;
      }

      // Atualizar os campos do usuário se fornecidos
      if (name) user.name = name;
      if (email) user.email = email;

      // Atualizar a senha se for fornecida (e criptografá-la)
      if (password) {
        const salt = await bcrypt.genSalt(12); // Gerar o salt para a hash
        const hashedPassword = await bcrypt.hash(password, salt); // Hash da senha
        user.password = hashedPassword;
      }

      // Salvar as alterações no banco de dados
      await user.save();

      res.status(201).json({ msg: "Usuário atualizado com sucesso!", user });
    } catch (error) {
      
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde." });
    }
  },
};

export default userController;
