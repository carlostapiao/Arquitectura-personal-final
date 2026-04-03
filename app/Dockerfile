FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copiamos todo el contenido de la carpeta app al contenedor
COPY . .

EXPOSE 3000

# CAMBIO CLAVE: Ejecutamos server.js en lugar de index.js
CMD ["node", "server.js"]