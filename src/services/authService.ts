import axios from 'axios';

// Função para obter o token de autenticação
const getAuthToken = async (
  serie: string,
  codFilial: string,
  api:string
): Promise<string> => {
  try {
    // Fazer a requisição GET para a autenticação, passando os parâmetros na URL
    const response = await axios.get<{
      dados: any;
      token: string;
    }>(
      `http://10.0.0.44:60002/auth/?serie=${serie}&codfilial=${codFilial}`
    );

    // O token de autenticação retornado pela API
    const token = response.data.dados.token;
    return token;
  } catch (error) {
    console.error(error);
    throw new Error("Falha na autenticação");
  }
};

// Exportando o serviço para ser usado em outros módulos
export default {
  getAuthToken,
};
