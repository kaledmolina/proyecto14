# Multi-stage Dockerfile for Next.js with Prisma and SQLite
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lock* ./
RUN npm ci

# Stage 2: Rebuild the source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install prisma CLI globally with the exact version from package.json for migrations
RUN npm install -g prisma@6.11.1

# Create db directory and set permissions
RUN mkdir -p /app/db && chown -1001:1001 /app/db

# Copy standalone build files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:../db/custom.db"

# Startup command: push schema changes (creating/updating DB) and run server
CMD ["sh", "-c", "prisma db push --accept-data-loss && node server.js"]
