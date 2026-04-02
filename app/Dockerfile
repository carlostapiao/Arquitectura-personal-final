# Usamos Bullseye para mayor compatibilidad con los nodos de Azure
FROM node:18-bullseye-slim

WORKDIR /app

# Instalación limpia de dependencias
COPY package*.json ./
RUN npm install --only=production

# Copiamos el código
COPY . .

EXPOSE 3000

# Ejecución directa para evitar errores de shell y arquitectura
CMD ["node", "src/server.js"]