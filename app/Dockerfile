FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Asegúrate de que server.js esté en la raíz de /app dentro del contenedor
CMD ["node", "server.js"]