import axios from 'axios';

// Função para obter o token de autenticação
const getAuthToken = async (
  serie: string,
  codFilial: string,
  api:string
): Promise<string> => {
  try {
    // Fazer a requisição GET para a autenticação, passando os parâmetros na URL
    const url_ideal = process.env.PRODUTION === "true" ? api : `${process.env.URL_IDEAL_LOCAL}`;
    const response = await axios.get<{
      dados: any;
      token: string;
    }>(
      `${url_ideal}/auth/?serie=${serie}&codfilial=${codFilial}`
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
