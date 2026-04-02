FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 3000

# Usamos esta forma para evitar el error de exec format
ENTRYPOINT ["node", "src/server.js"]