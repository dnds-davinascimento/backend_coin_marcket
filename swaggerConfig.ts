import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Distribuidora Croi.tech API',
      version: '1.0.0',
      description: 'Documentação API gerada com Swagger',
      contact: {
        name: 'Shop Fusion',
        url: 'https://distribuidora.croi.tech/',
        email: 'distribuidora@croi.tech',
      },
    },
    servers: [
      {
        url: 'distribuidora.croi.tech/api', // Coloque o URL do seu servidor
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'], // Ajuste o caminho para os arquivos onde você faz as rotas
  
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default swaggerDocs;
