# Imagen base oficial de Node
FROM node:18-bullseye-slim

# Directorio de la app
WORKDIR /app

# Instalación de dependencias
COPY package*.json ./
RUN npm install --only=production

# Copiar el código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Ejecutar node directamente (evita errores de shell/arquitectura)
CMD ["node", "src/server.js"]