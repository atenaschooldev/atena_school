FROM node:22-alpine

# Install system dependencies required by Prisma engine on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Enable Corepack and activate exact pnpm version from package.json
RUN corepack enable && corepack prepare pnpm@11.13.1 --activate

WORKDIR /app

# Copy repository source files (.dockerignore excludes local node_modules, caches, and builds)
COPY . .

# Install dependencies inside the Linux container
RUN pnpm install --frozen-lockfile

# Generate Prisma Client for Linux Alpine
RUN pnpm --filter backend exec prisma generate

# Build packages, Backend REST API and Admin CRM
RUN npx turbo build --filter=backend --filter=admin

# Expose ports:
# 3001: Admin CRM Web UI (Vite preview)
# 4000: Backend API, Swagger Hub, and Scalar Playground
EXPOSE 3001 4000

ENV NODE_ENV=production
ENV PORT=4000

# Launch CRM standalone runner (defaults to DEV database: hcxpfzsm)
CMD ["node", "scripts/start-crm-prod.js", "dev"]
