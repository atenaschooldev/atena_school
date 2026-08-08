FROM node:22-alpine AS builder

# Install system dependencies for Prisma engine
RUN apk add --no-cache openssl libc6-compat

# Enable Corepack & pnpm
RUN corepack enable && corepack prepare pnpm@11.13.1 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package manifests for monorepo packages
COPY apps/backend/package.json ./apps/backend/
COPY packages/api-types/package.json ./packages/api-types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/validators/package.json ./packages/validators/
COPY packages/config/package.json ./packages/config/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/design/package.json ./packages/design/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY tooling/eslint/package.json ./tooling/eslint/
COPY tooling/prettier/package.json ./tooling/prettier/
COPY tooling/typescript/package.json ./tooling/typescript/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build backend
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "apps/backend/dist/main.js"]
