import { Request, Response } from "express";
import { Customer } from "../models/custumer"; // Importa o model Customer
import { Loja } from "../models/loja"; // Importa o model Loja
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import DocumentCustomerModel from "../models/dosc_custumer";
import Admin from "../models/Admin"; // Importa o model Admin
import nodemailer from "nodemailer";
import User from "../models/user";

dotenv.config();

const sendEmail = async (newCustomer: any, emails: string[]) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "venda.croi.ns@gmail.com",
      pass: "dehq eejp kpql xcjc",
    },
  });
const mailOptions = {
  from: '"CROI Distribuidora" <venda.croi.ns@gmail.com>',
  to: emails.join(","),
  subject: "🆕 Novo cliente cadastrado na plataforma CROI",
  html: `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden;">
      <div style="background-color:#0a3d62;padding:20px;text-align:center;color:white;">
        <img src="https://croidistribuidora.com.br/_next/image?url=%2Fimages%2Flogo%2Flogo.png&w=200&q=75" alt="Logo CROI" style="max-width:140px;margin-bottom:10px;" />
        <h1 style="margin:0;font-size:22px;">Novo Cliente Cadastrado</h1>
        <p style="margin:5px 0 0;">Um novo parceiro entrou na rede 🚀</p>
      </div>

      <div style="padding:20px;background-color:#f9f9f9;">
        <h2 style="color:#0a3d62;margin-bottom:10px;">📋 Detalhes do Cliente</h2>
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          <tr>
            <td style="padding:8px;font-weight:bold;">Nome:</td>
            <td style="padding:8px;">${newCustomer.name}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">Email:</td>
            <td style="padding:8px;">${newCustomer.email || "Não informado"}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">Telefone:</td>
            <td style="padding:8px;">${newCustomer.phone || "Não informado"}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">Tipo:</td>
            <td style="padding:8px;">${newCustomer.type}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">CPF/CNPJ:</td>
            <td style="padding:8px;">${newCustomer.cpf_cnpj || "Não informado"}</td>
          </tr>
          ${newCustomer.razao_social ? `
          <tr>
            <td style="padding:8px;font-weight:bold;">Razão Social:</td>
            <td style="padding:8px;">${newCustomer.razao_social}</td>
          </tr>` : ""}
          ${newCustomer.nome_fantasia ? `
          <tr>
            <td style="padding:8px;font-weight:bold;">Nome Fantasia:</td>
            <td style="padding:8px;">${newCustomer.nome_fantasia}</td>
          </tr>` : ""}
          <tr>
            <td style="padding:8px;font-weight:bold;">Data de Cadastro:</td>
            <td style="padding:8px;">${new Date(newCustomer.createdAt).toLocaleString("pt-BR")}</td>
          </tr>
        </table>

        <div style="margin-top:30px;text-align:center;">
          <a href="https://croidistribuidora.com.br/painel/clientes" style="background-color:#0a3d62;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block;">
            🔎 Ver no Painel
          </a>
        </div>
      </div>

      <div style="background-color:#f1f1f1;text-align:center;padding:15px;font-size:12px;color:#555;">
        <p style="margin:0;">Email automático enviado por <strong>CROI Distribuidora</strong></p>
        <p style="margin:5px 0 0;">Se você não é o destinatário deste e-mail, por favor, ignore.</p>
      </div>
    </div>
  `
};


 

  try {
    const info = await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
};
const customerController = {
  createCustomer: async (req: Request, res: Response): Promise<void> => {
    const {
      name,
      email,
      password,
      type,
      indicatorStateRegistration,
      phone,
        rg,

      cpf_cnpj,
      stateRegistration,
      tier,
      thumbnail,
      razao_social,
      nome_fantasia,
      endereco
    } = req.body;
    let { store } = req.body; // A loja pode ser passada no corpo da requisição


    try {
      // Validações básicas
      if (!name) {
        res.status(400).json({
          msg: "Campos obrigatórios faltando: nome e loja são necessários"
        });
        return;
      }

      // Verificar se a loja existe

      if (!store) {
        const lojaExists = await Loja.find({ centro_distribuicao: true });
        if (lojaExists.length === 0) {
          res.status(400).json({ msg: "Loja não encontrada" });
          return;
        } else {
          store = lojaExists[0]._id; // Atribui a primeira loja encontrada
        }
      }

      // Verificar se email já existe
      if (email) {
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
          res.status(400).json({ msg: "Já existe um cliente com este email" });
          return;
        }
      }

      // Verificar se CPF/CNPJ já existe
      if (cpf_cnpj) {
        const existingTaxId = await Customer.findOne({cpf_cnpj });
        if (existingTaxId) {
          res.status(400).json({ msg: "Já existe um cliente com este CPF/CNPJ" });
          return;
        }
      }

      // Criptografar senha se fornecida
      let hashedPassword;
      if (password) {
        const salt = await bcrypt.genSalt(12);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      // Criar novo cliente
      const newCustomer = new Customer({
        name,
        email,
        razao_social: razao_social || null,
        nome_fantasia: nome_fantasia || null,
        rg: rg || null, // Registro Geral (opcional)
        thumbnail: thumbnail || null,
        password: hashedPassword,
        type: type || 'individual',
        indicador_IE: indicatorStateRegistration || 0,
        phone,
        cpf_cnpj,
        stateRegistration,
        tier: tier || 'regular',
        store,
        endereco,
        creditBalance: 0,
        cashbackBalance: 0,
        monthlyPurchases: [],
        transactionHistory: []
      });

      // Salvar no banco de dados
      await newCustomer.save();
        /* buscar admin */
        const admin = await Admin.findById("6807a4d7860872fd82906b3f")
        if (!admin) {
          res.status(404).json({ msg: "Admin não encontrado para esta loja" });
          return;
        }
        const emails = [];
        if (admin.paymentAlert === true) {
          emails.push(admin.email);
        }

        // Busca outros usuários com `paymentAlert: true` que pertencem à loja do admin
        const users = await User.find({ user_store_id: store, paymentAlert: true });

        // Adiciona os emails dos usuários encontrados
        emails.push(...users.map(user => user.email));

        console.log(emails);


        // Somente envia o e-mail se a sequência ideal tiver sido salva com sucesso
       
          await sendEmail(newCustomer, emails); // Passar os e-mails como argumento

      // Retornar resposta sem informações sensíveis
      res.status(201).json({
        msg: "Cliente criado com sucesso",
        customer: {
          _id: newCustomer._id,
          name: newCustomer.name,
          email: newCustomer.email,
          type: newCustomer.type,
          phone: newCustomer.phone,
          tier: newCustomer.tier,
          store: newCustomer.store,
          createdAt: newCustomer.createdAt
        }
      });

    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      res.status(500).json({
        msg: "Erro no servidor ao criar cliente",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  /* buscar custumers por id */
  getCustomerById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const customer = await Customer.findById(id);
      if (!customer) {
        res.status(404).json({ msg: "Cliente não encontrado" });
        return;
      }
      res.status(200).json(customer);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      res.status(500).json({ msg: "Erro no servidor ao buscar cliente" });
    }
  },
  /* função para editar customer pelo id */
  updateCustomer: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, email, password, type, indicatorStateRegistration, phone, cpf_cnpj, stateRegistration, tier,endereco,thumbnail, rg,razao_social,nome_fantasia } = req.body;

    try {
      const customer = await Customer.findById(id);
      if (!customer) {
        res.status(404).json({ msg: "Cliente não encontrado" });
        return;
      }

      // Atualiza os campos do cliente
      customer.name = name || customer.name;
      customer.email = email || customer.email;
      customer.razao_social = razao_social || customer.razao_social; // Atualiza a razão social
      customer.nome_fantasia = nome_fantasia || customer.nome_fantasia; // Atualiza o nome fantasia 
      customer.rg = rg || customer.rg; // Atualiza o Registro Geral (opcional)

      customer.type = type || customer.type;
      customer.indicador_IE = indicatorStateRegistration || customer.indicador_IE;
      customer.phone = phone || customer.phone;
      customer.cpf_cnpj = cpf_cnpj || customer.cpf_cnpj;
      customer.stateRegistration = stateRegistration || customer.stateRegistration;
      customer.tier = tier || customer.tier;
      customer.endereco = endereco || customer.endereco;
      customer.thumbnail =thumbnail || customer.thumbnail; // Atualiza a imagem do cliente

      // Atualiza a senha se fornecida
      if (password) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        customer.password = hashedPassword;
      }

      // Salva as alterações no banco de dados
      await customer.save();

      res.status(201).json({ msg: "Cliente atualizado com sucesso", customer });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      res.status(500).json({ msg: "Erro no servidor ao atualizar cliente" });
    }
  },
  /* função para deletar customer pelo id */
  deleteCustomer: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const customer = await Customer.findByIdAndDelete(id);
      if (!customer) {
        res.status(404).json({ msg: "Cliente não encontrado" });
        return;
      }
      res.status(200).json({ msg: "Cliente deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      res.status(500).json({ msg: "Erro no servidor ao deletar cliente" });
    }
  },
  /* função para buscar todos os customers */
  getAllCustomers: async (req: Request, res: Response): Promise<void> => {
    try {
      const customers = await Customer.find().populate("store", "name"); // Popula o campo "store" com o nome da loja
      res.status(200).json(customers);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      res.status(500).json({ msg: "Erro no servidor ao buscar clientes" });
    }
  },
  /* função para buscar customers por loja */
  getCustomersByStore: async (req: Request, res: Response): Promise<void> => {
                let id_loja = req.headers.user_store_id as string;
      if (!id_loja) {
        id_loja = "6807ab4fbaead900af4db229"
      }
    try {
      const customers = await Customer.find({ store: id_loja })
      if (customers.length === 0) {
        res.status(404).json({ msg: "Nenhum cliente encontrado para esta loja" });
        return;
      }
      res.status(200).json(customers);
    } catch (error) {
      
      res.status(500).json({ msg: "Erro no servidor ao buscar clientes por loja" });
    }
  },
  /* função para aprovar status do cutomers */
  approveCustomerStatus: async (req: Request, res: Response): Promise<void> => {
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
    const documentos = await DocumentCustomerModel.findOne({ customer_id: id });
    if (!documentos) {
      res.status(404).json({ msg: "Documentos do cliente não encontrados" });
      return;
    }
    // Verifica se o status já está aprovado
if (documentos.status === 'em análise' || documentos.status === 'reprovado') {
  res.status(400).json({ msg: "A documentação do cliente precisa estar aprovada para que o cadastro possa ser aprovado." });
  return;
}

    try {
      const customer = await Customer.findById(id);
      if (!customer) {
        res.status(404).json({ msg: "Cliente não encontrado" });
        return;
      }
      // Atualiza o status do cliente para "aprovado"
      customer.status = status ? status : customer.status ; // Se status não for fornecido, usa o status atual ou define como 'aprovado'
      await customer.save();
      res.status(200).json({ msg: "Status do cliente atualizado para aprovado", customer });
    } catch (error) {
      console.error("Erro ao aprovar status do cliente:", error);
      res.status(500).json({ msg: "Erro no servidor ao aprovar status do cliente" });
    } 
  }
};

export default customerController;