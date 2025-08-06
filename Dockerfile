# Usar a imagem base do Node.js v20
FROM node:20

# Criar o diretório de trabalho dentro do container
WORKDIR /app

# Copiar o package.json e o package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Instalar dependências globais como ts-node e nodemon
RUN npm install -g ts-node nodemon

# Copiar o código da aplicação
COPY . .

# Expor a porta que o Node.js vai rodar
EXPOSE 4000

# Comando para rodar o nodemon com ts-node
CMD ["npm", "run", "dev"]
