# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Add necessary build tools for Prisma
RUN apt-get update && apt-get install -y openssl

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy prisma files specifically
COPY prisma ./prisma

# Generate Prisma Client (use local version, not npx which may download v7)
RUN ./node_modules/.bin/prisma generate

# Copy all other source files
COPY . .

# Build-time env vars needed by next.config.ts
ARG S3_PUBLIC_URL=https://cdn.band.stream
ARG SCALEWAY_ENDPOINT=https://placeholder.example.com
ENV S3_PUBLIC_URL=${S3_PUBLIC_URL}
ENV SCALEWAY_ENDPOINT=${SCALEWAY_ENDPOINT}
ENV MJ_APIKEY_PUBLIC=placeholder
ENV MJ_APIKEY_PRIVATE=placeholder
ENV STRIPE_API_KEY=placeholder
ENV STRIPE_WEBHOOK_SECRET=placeholder

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
FROM node:20-slim AS runner

WORKDIR /app

# Add necessary runtime tools for Prisma
RUN apt-get update && apt-get install -y openssl

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Copy the full prisma + @prisma modules for migrate deploy
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Build provenance — written to /app/BUILD_INFO.json
ARG BUILD_COMMIT=unknown
ARG BUILD_BRANCH=unknown
ARG BUILD_ENV=unknown
ARG BUILD_TIME=unknown
ARG BUILD_RUN_ID=unknown
RUN printf '{"commit":"%s","branch":"%s","env":"%s","built_at":"%s","run_id":"%s"}\n' \
    "$BUILD_COMMIT" "$BUILD_BRANCH" "$BUILD_ENV" "$BUILD_TIME" "$BUILD_RUN_ID" \
    > /app/BUILD_INFO.json

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

# Use entrypoint script to handle Prisma migrations and start the app
ENTRYPOINT ["./entrypoint.sh"]
