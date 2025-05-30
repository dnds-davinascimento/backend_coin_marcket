import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config();

// Validação das variáveis de ambiente
const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
} = process.env;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET_NAME) {
  throw new Error("Faltam variáveis de ambiente do AWS S3.");
}


// Instancia do S3
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
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

    const match = base64.match(/^data:image\/(\w+);base64,/);
    const ext = match?.[1] || "jpg";
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const key = `${folder}/${ uuidv4()}.${ext}`;
    const contentType = `image/${ext}`;


    const uploadParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: contentType,

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
export const generateSignedUrl = async (
  folder: string,
  filetype: string
): Promise<{ url: string; key: string }> => {
  const ext = filetype.split("/")[1] || "jpg";
  const key = `${folder}/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key,
    ContentType: filetype,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min

  return { url, key };
};
