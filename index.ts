import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './src/routes/router';
import connectDB from './src/config/db';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swaggerConfig';
import basicAuth from 'express-basic-auth';
import cookieParser from 'cookie-parser';
// import agenda from './src/agenda/agenda';

// Carrega as variáveis de ambiente
dotenv.config();

// Inicializa o app Express
const app = express();

// Middleware para lidar com cookies
app.use(cookieParser());

// Conecta ao banco de dados MongoDB
connectDB();

// Agenda (comentar se não estiver usando)
/*
(async function() {
  await agenda.start();
  await agenda.every('1 hour', 'sincronizar estoque');
})();
*/

// Middleware para interpretar JSON no body das requisições
app.use(express.json());

// Middleware de CORS com função personalizada para aceitar múltiplos domínios
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Permite chamadas sem origin (ex: curl/Postman)

    const allowedOrigins = [
      'http://localhost:3000',
      'https://frontend-croi-distribuidora.vercel.app',
      'https://croidistribuidora.com.br',
      'https://www.croidistribuidora.com.br',
    ];

    if (allowedOrigins.includes(origin) || /\.croidistribuidora\.com\.br$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Middleware para lidar com requisições OPTIONS
app.options('*', cors());

// Documentação Swagger protegida com auth
app.use(
  '/docs',
  basicAuth({
    users: { 'admin': '@Croi.2025' },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);

// Rotas principais
app.use('/api', routes);

// Inicializa o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
