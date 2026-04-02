# Forzamos la plataforma desde la base
FROM --platform=linux/amd64 node:18-bullseye-slim

WORKDIR /usr/src/app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalación limpia
RUN npm install --only=production

# Copiamos el resto del código
COPY . .

# EXTREMADAMENTE IMPORTANTE: 
# Usamos la forma de "vector" para el CMD. 
# Esto evita que se invoque /bin/sh y ejecuta node directamente.
CMD ["node", "src/server.js"]