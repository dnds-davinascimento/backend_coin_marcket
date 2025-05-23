import credenciais from '../models/credenciais';

export const obterCredenciais = async (credencial_loja_id: string) => {
  if (!credencial_loja_id) {
    throw new Error('Credencial User ID não fornecido');
  }

  const credenciaisList = await credenciais.find({ credencial_loja_id });

  if (credenciaisList.length === 0) {
    throw new Error('Credenciais não encontradas para esse usuário');
  }

  const { api, serie, codFilial, senha } = credenciaisList[0];
  return { api, serie, codFilial, senha };
};
