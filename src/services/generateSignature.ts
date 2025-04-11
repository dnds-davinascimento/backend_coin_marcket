import crypto from 'crypto'; // Usaremos o pacote 'crypto' nativo do Node.js
import dotenv from 'dotenv'; // Pacote para carregar variáveis de ambiente

dotenv.config(); // Carregar as variáveis de ambiente

// Função para remover espaços extras do corpo da requisição
function removeExtraSpaces(body: any): string {
  if (typeof body !== 'string') {
    body = JSON.stringify(body); // Converte o body para string se não for uma string
  }
  return body.trim();
}



// Função para gerar a assinatura
export function generateSignature(method: string,senha: string,  body: string = '') {

  
  const timestamp = Math.floor(Date.now() / 1000); // Timestamp atual em segundos

  // 1. Método HTTP em minúsculo e Body sem espaços no começo e no fim
  const lowerCaseMethod = method.toLowerCase(); // Converter o método HTTP para minúsculo
 // Remover espaços extras do body
  const trimmedBody = removeExtraSpaces(body);


  // 2. Codificar o Body em Base64
  const bodyBase64 = Buffer.from(trimmedBody).toString('base64');

  // 3. Concatenar os valores (method + timestamp + bodyBase64)
  const dataToSign = lowerCaseMethod + timestamp + bodyBase64;

  // 4. Encriptar os dados concatenados usando HMAC SHA256 com o token (senha)

    // Senha da API Idealsoft
  if (!senha) {
    throw new Error('IDEALSOFT_SENHA is not defined in the environment variables');
  }
  const hmac = crypto.createHmac('sha256', senha);
  hmac.update(dataToSign);
  const encryptedData = hmac.digest();

  // 5. Converter o valor encriptado para Base64
  const signature = encryptedData.toString('base64');

  // Retornar a assinatura e o timestamp
  return {
    signature: signature,
    timestamp: timestamp
  };
}
