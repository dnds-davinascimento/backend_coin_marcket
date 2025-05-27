import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config();

// Validação das variáveis de ambiente
if (
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_BUCKET_NAME
) {
  throw new Error("Faltam variáveis de ambiente do AWS S3.");
}

// Instancia do S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (
  base64: string,
  folder: string,
  filename?: string
): Promise<{ url: string; key: string }> => {
  try {
    // Validação do base64
    if (!base64 || base64.length < 50) {
      throw new Error("Imagem inválida ou vazia.");
    }

    const buffer = Buffer.from(base64, "base64");
    const key = `${folder}/${filename || uuidv4()}.jpg`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: "image/jpeg",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return {
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`,
      key,
    };
  } catch (error) {
    console.error("Erro ao fazer upload pro S3:", error);
    throw error;
  }
};
