import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import Admin from "../models/Admin"; 
import { generateSignature } from "../services/generateSignature";
import authService from "../services/authService";
import { obterCredenciais } from "../services/credenciaisService";

dotenv.config(); // Carregar as variáveis de ambiente

const cliente_Schema = {
  // Criar cliente na Idealsoft
  createClienteIdealsoft: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const credencial_user_id = req.headers.id as string;

      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(credencial_user_id );
      
      // 1. Primeiro, obtenha o token de autenticação

      const token = await authService.getAuthToken(serie, codFilial, api);

      const method = "post";
      const body = req.body;

      // Assumindo que o corpo está vazio para requisição GET
      const { signature, timestamp } = generateSignature(method,senha,JSON.stringify(body));
 

      // 2. Configuração do cabeçalho da requisição
      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };

      // 3. Enviar a requisição para criar o cliente na Idealsoft
      const { data } = await axios.post(
        `${api}/clientes`, // Endpoint para criar clientes na Idealsoft
        body, // O corpo da requisição com os dados do cliente
        { headers }
      );

      res.status(201).json(data); // Retornar os dados do cliente criado
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ msg: "Erro ao criar cliente, tente novamente mais tarde" });
    }
  },

  // Obter clientes da Idealsoft (paginado)
  getClientesIdealsoft: async (req: Request, res: Response): Promise<void> => {
    try {
      const credencial_user_id = req.headers.id as string;

      // Obter credenciais usando o serviço
      const { serie, api, codFilial, senha } = await obterCredenciais(
        credencial_user_id
      );
      

      // 1. Primeiro, obtenha o token de autenticação

      const token = await authService.getAuthToken(serie, codFilial, api);

      const method = "get";
      const body = "";
      

      // Assumindo que o corpo está vazio para requisição GET
      const { signature, timestamp } = generateSignature(method,senha, body );

      // 2. Configuração do cabeçalho da requisição
      const headers = {
        Signature: signature,
        CodFilial: codFilial,
        Authorization: `Token ${token}`,
        Timestamp: timestamp.toString(),
      };
      let pagina = req.query.pagina;

      // 3. Requisição para a API da Idealsoft com os headers
      const { data } = await axios.get(`${api}/clientes/${pagina || 1}`, {
        headers,
      });

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde" });
    }
  },

};

export default cliente_Schema;
