# Build Stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY nx.json tsconfig.base.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy all source code
COPY . .

# Build all apps
RUN npx nx run-many --target=build --all --prod

# Gateway Runtime
FROM node:18-alpine AS gateway
WORKDIR /app
COPY --from=build /app/dist/apps/gateway ./
COPY --from=build /app/package-docker.json ./package.json
RUN npm install --production
EXPOSE 3000
CMD ["node", "main.js"]

# Explorer Runtime
FROM node:18-alpine AS explorer
WORKDIR /app
COPY --from=build /app/dist/apps/explorer ./
COPY --from=build /app/package-docker.json ./package.json
RUN npm install --production
EXPOSE 3001
CMD ["node", "main.js"]

# Analytics Runtime
FROM node:18-alpine AS analytics
WORKDIR /app
COPY --from=build /app/dist/apps/analytics ./
COPY --from=build /app/package-docker.json ./package.json
RUN npm install --production
EXPOSE 3002
CMD ["node", "main.js"]

# Worker Runtime
FROM node:18-alpine AS worker
WORKDIR /app
COPY --from=build /app/dist/apps/worker ./
COPY --from=build /app/package-docker.json ./package.json
RUN npm install --production
CMD ["node", "main.js"]
