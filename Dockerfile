# syntax=docker/dockerfile:1

# --- Estágio 1: build (instala tudo e gera o bundle de produção) ---
FROM node:24-alpine AS build

WORKDIR /app

# Instala dependências a partir do lockfile (build reprodutível)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código e gera o build (adapter-node -> ./build)
COPY . .
RUN npm run build

# Remove as devDependencies, mantendo só o necessário para rodar
RUN npm prune --omit=dev

# --- Estágio 2: runtime (imagem final enxuta) ---
FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copia apenas artefatos necessários para executar o servidor node
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Roda como usuário sem privilégios (imagem node já inclui o usuário "node")
USER node

EXPOSE 3000

CMD ["node", "build"]
