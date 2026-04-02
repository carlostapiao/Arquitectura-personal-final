# Usamos una imagen específica para evitar ambigüedades de arquitectura
FROM --platform=linux/amd64 node:18

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar el código fuente (asegurando que se copie la carpeta src)
COPY . .

# Exponer el puerto
EXPOSE 3000

# Usar node directamente en lugar de scripts de shell para evitar el 'exec format error'
CMD ["node", "src/server.js"]