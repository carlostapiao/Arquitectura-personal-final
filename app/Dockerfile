FROM node:18-slim

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install --only=production

# COPIAR TODO EL CONTENIDO (incluyendo src y public)
COPY . .

# Si tu index.js busca 'public' pero está en 'src/public', 
# movemos la carpeta para que coincida con el código
RUN mv src/public ./public || true

EXPOSE 3000

CMD ["node", "index.js"]