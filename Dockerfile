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

# Ensure SDK is properly linked in node_modules
RUN rm -rf node_modules/@encryptid/sdk && \
    mkdir -p node_modules/@encryptid && \
    cp -r /encryptid-sdk node_modules/@encryptid/sdk

# Copy source files (exclude node_modules/.next from source)
COPY rvote-online/ /tmp/rvote-src/
RUN cp -r /tmp/rvote-src/src ./src && \
    cp -r /tmp/rvote-src/public ./public 2>/dev/null || true && \
    cp /tmp/rvote-src/next.config.ts /tmp/rvote-src/tsconfig.json /tmp/rvote-src/postcss.config.mjs /tmp/rvote-src/tailwind.config.ts /tmp/rvote-src/eslint.config.mjs /tmp/rvote-src/components.json ./ 2>/dev/null || true && \
    cp /tmp/rvote-src/middleware.ts ./ 2>/dev/null || true && \
    rm -rf /tmp/rvote-src

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

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
