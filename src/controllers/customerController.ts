import { Request, Response } from "express";
import { Customer } from "../models/custumer"; // Importa o model Customer
import { Loja } from "../models/loja"; // Importa o model Loja
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { get } from "axios";

dotenv.config();

const customerController = {
  createCustomer: async (req: Request, res: Response): Promise<void> => {
    const {
      name,
      email,
      password,
      type,
      indicatorStateRegistration,
      phone,
      taxId,
      stateRegistration,
      tier,
      
      endereco
    } = req.body;
    let { store } = req.body; // A loja pode ser passada no corpo da requisição
    

    try {
      // Validações básicas
      if (!name ) {
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
        }else{
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
      if (taxId) {
        const existingTaxId = await Customer.findOne({ taxId });
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
        password: hashedPassword,
        type: type || 'individual',
        indicador_IE: indicatorStateRegistration || 0,
        phone,
        taxId,
        stateRegistration,
        tier: tier || 'regular',
        store,
        endereco,
        // Valores padrão
        creditBalance: 0,
        cashbackBalance: 0,
        monthlyPurchases: [],
        transactionHistory: []
      });

      // Salvar no banco de dados
      await newCustomer.save();

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
  }
};

export default customerController;