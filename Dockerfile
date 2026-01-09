# Build stage
FROM node:22-alpine3.20 AS builder

WORKDIR /app

# Copy prisma schema and migrations
COPY prisma ./prisma

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client (with dummy DATABASE_URL for build)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN yarn prisma generate

# Build the application
RUN yarn build

# Production stage
FROM node:22-alpine3.20

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package.json yarn.lock ./

COPY prisma.config.ts ./prisma.config.ts
# Copy Prisma schema and migrations for production
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies (this will also run prisma generate via postinstall)
# Set dummy DATABASE_URL for install phase
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN yarn install --production --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Run migrations and start the application
CMD ["sh", "-c", "yarn prisma migrate deploy && node dist/src/main"]
