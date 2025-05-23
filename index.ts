import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import routes from './src/routes/router';
import connectDB from './src/config/db';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swaggerConfig';
import basicAuth from 'express-basic-auth';
import cookieParser from 'cookie-parser';
/* import agenda from './src/agenda/agenda' */


// Carrega as variáveis de ambiente
dotenv.config();

// Inicializa o app Express
const app = express();
// Middleware para lidar com cookies
app.use(cookieParser());



// Conecta ao banco de dados MongoDB
connectDB();

// Agenda
/* (async function() {
  await agenda.start();
  await agenda.every('1 hour', 'sincronizar estoque');
})(); */



// Middleware para interpretar JSON no body das requisições
app.use(express.json());

// Configura o CORS para permitir requisições apenas da origem do seu frontend
// Configura o CORS para permitir requisições apenas da origem do seu frontend
const corsOptions = {
  origin: ['http://localhost:3000', 'https://frontend-shop-fusion.vercel.app', 'https://shopfusion.croi.tech/'], // Permite apenas os frontends listados
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permite os métodos HTTP necessários
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite os cabeçalhos necessários
};

const corsOrigins = [
  'http://localhost:3000',
  'https://frontend-croi-distribuidora.vercel.app',
]
// Configura o CORS para permitir requisições da origem do frontend
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
// Middleware para lidar com as solicitações OPTIONS
app.options("/api*", cors());

// Configurar a rota onde o Swagger vai servir a documentação
app.use(
  '/docs',
  basicAuth({
    users: { 'admin': '@Croi.2025' }, // Defina o nome de usuário e senha
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);
// Rotas
app.use("/api", routes);

// Configura a porta do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
