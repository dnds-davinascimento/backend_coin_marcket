import { Request, response, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import Admin from "../models/Admin"; // Importa o model Admin

import authService from "../services/authService";

import nodemailer from "nodemailer";

import User from "../models/user";




dotenv.config(); // Carregar as variáveis de ambiente
// Função para o envio de e-mail
/* const sendEmail = async (order: Order, emails: string[]) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "venda.croi.ns@gmail.com",
      pass: "dehq eejp kpql xcjc",
    },
  });

  const mailOptions = {
    from: "venda.croi.ns@gmail.com",
    to: emails,
    subject: `Novo Pedido Recebido: #${order.sequencia_ideal}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <h2 style="color: #0b3d91;">Detalhes do Pedido</h2>
        <span style="color: #0b3d91;">Essa é um envio de email quando for confirmado um pagamento pela nuvemshop.</span>
        <p><strong>ID do Pedido:</strong> ${order.order_id_Nuvem}</p>
        <p><strong>N° Sequencia Gerada:</strong> ${order.sequencia_ideal}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total:</strong> R$ ${order.total}</p>
        <h2 style="color: #0b3d91;">Cliente:${order.name} Cpf/Cnpj:${order.cpfCnpj}</h2>
        <h3>Produtos:</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${order.products.map(product => `
            <li style="margin-bottom: 10px;">
              <strong>${product.productId}</strong>-${product.name} - Quantidade: ${product.quantity} - Preço Unitário: R$ ${product.price}
            </li>
          `).join('')}
        </ul>
        <h3>Detalhes de Pagamento:</h3>
        <p><strong>Forma de Pagamento:</strong> ${order.paymentDetails.method}</p>
        <p><strong>Parcelas:</strong> ${order.paymentDetails.installments}</p>
        <h3>Endereço de Envio:</h3>
        <p><strong>Endereço:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province} - ${order.shippingAddress.zipcode}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
}; */
// Função para enviar E-mail quando der erro na criação de venda na Idealsoft
/* const sendEmailError = async (emails: string[], error: any, orderdb: Order) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "venda.croi.ns@gmail.com",
      pass: "dehq eejp kpql xcjc",
    },
  });
  const mailOptions = {
    from: "venda.croi.ns@gmail.com",
    to: emails,
    subject: "Erro ao criar venda na Idealsoft",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <h2 style="color: #0b3d91;">Erro ao criar venda na Idealsoft</h2>
        <p><strong>Erro:</strong> ${error}</p>
        <h3>Detalhes do Pedido:</h3>
        <p><strong>ID do Pedido:</strong> ${orderdb._id}</p>
        <p><strong>Nome do Cliente:</strong> ${orderdb.name}</p>
        <p><strong>Cpf/Cnpj:</strong> ${orderdb.cpfCnpj}</p>
        <p><strong>Total:</strong> R$ ${orderdb.total}</p>
        <h3>Produtos:</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${orderdb.products.map(product => `
            <li style="margin-bottom: 10px;">
              <strong>${product._id}</strong>-${product.name} - Quantidade: ${product.quantity} - Preço Unitário: R$ ${product.price}
            </li>
          `).join('')}
        </ul>
        <h3>Detalhes de Pagamento:</h3>
        <p><strong>Forma de Pagamento:</strong> ${orderdb.paymentDetails.method}</p>
        <p><strong>Parcelas:</strong> ${orderdb.paymentDetails.installments}</p>
        <h3>Endereço de Envio:</h3>
        <p><strong>Endereço:</strong> ${orderdb.shippingAddress.address}, ${orderdb.shippingAddress.city}, ${orderdb.shippingAddress.province} - ${orderdb.shippingAddress.zipcode}</p>
      </div>
     
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
}; */


interface FormatUF {
  (uf: string): string;
}

const formatarUF: FormatUF = (uf) => {
  // Mapeamento dos estados para suas respectivas siglas
  const estados: { [key: string]: string } = {
    "ACRE": "AC",
    "ALAGOAS": "AL",
    "AMAPA": "AP",            // Removi o acento
    "AMAZONAS": "AM",
    "BAHIA": "BA",
    "CEARA": "CE",            // Removi o acento
    "DISTRITO FEDERAL": "DF",
    "ESPIRITO SANTO": "ES",   // Removi o acento
    "GOIAS": "GO",            // Removi o acento
    "MARANHAO": "MA",         // Removi o acento
    "MATO GROSSO": "MT",
    "MATO GROSSO DO SUL": "MS",
    "MINAS GERAIS": "MG",
    "PARA": "PA",             // Removi o acento
    "PARAIBA": "PB",          // Removi o acento
    "PARANA": "PR",           // Removi o acento
    "PERNAMBUCO": "PE",
    "PIAUI": "PI",            // Removi o acento
    "RIO DE JANEIRO": "RJ",
    "RIO GRANDE DO NORTE": "RN",
    "RIO GRANDE DO SUL": "RS",
    "RONDONIA": "RO",         // Removi o acento
    "RORAIMA": "RR",
    "SANTA CATARINA": "SC",
    "SAO PAULO": "SP",        // Removi o acento
    "SERGIPE": "SE",
    "TOCANTINS": "TO"
  };

  // Remove acentos e converte para maiúsculo
  const ufFormatado = uf.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  // Verifica se o valor é o nome completo do estado (sem acentos) e retorna a sigla correspondente
  if (estados[ufFormatado]) {
    return estados[ufFormatado];
  }

  // Caso já seja uma sigla, retorna a sigla como está
  return ufFormatado;
};

const venda_Schema = {

 

 





 
};

export default venda_Schema;
