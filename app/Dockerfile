# Imagen base (la plataforma la define el pipeline ahora)
FROM node:18-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 3000

# Ejecución directa para evitar problemas de arquitectura/shell
CMD ["node", "src/server.js"]