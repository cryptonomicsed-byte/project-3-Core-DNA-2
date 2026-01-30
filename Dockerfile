# Core DNA AI Agency Platform - Multi-stage Docker Build

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Copy source files
COPY . .

# Expose ports
EXPOSE 3001 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start backend server
CMD ["node", "--loader=tsx/esm", "server.ts"]
