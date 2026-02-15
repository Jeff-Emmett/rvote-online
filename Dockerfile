# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY rvote-online/package*.json ./
COPY rvote-online/prisma ./prisma/
# Copy local SDK dependency (package.json references file:../encryptid-sdk)
COPY encryptid-sdk /encryptid-sdk/

# Install dependencies
RUN npm ci || npm install

# Copy source files, then restore node_modules
COPY rvote-online/ .
RUN rm -rf node_modules .next

# Re-install to get clean node_modules with SDK resolved
RUN npm ci || npm install

# Generate Prisma client
RUN npx prisma generate

# Build the application (use webpack - Turbopack has issues with file: linked subpath exports)
RUN npx next build --no-turbopack

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
