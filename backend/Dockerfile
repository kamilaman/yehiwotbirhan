# Production Dockerfile for Node.js Backend API
FROM node:20-alpine AS base

WORKDIR /app

# Install native build tools for compiling sqlite3 if needed on Alpine musl
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

# Remove build tools to minimize image footprint
RUN apk del python3 make g++

COPY . .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/server.js"]
