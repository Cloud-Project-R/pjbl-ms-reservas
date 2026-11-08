# Estágio 1: compila o TypeScript
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: leva só o necessário para rodar (imagem menor)
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Segurança: não roda como administrador (root) dentro do contêiner
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
