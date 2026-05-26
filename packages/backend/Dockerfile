FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.json ./

# Inline base tsconfig for Docker context (avoids referencing outside build context)
RUN echo '{"compilerOptions":{"target":"ES2022","module":"commonjs","lib":["ES2022"],"strict":true,"esModuleInterop":true,"skipLibCheck":true,"forceConsistentCasingInFileNames":true,"resolveJsonModule":true}}' > /tsconfig.base.json

RUN npm install

COPY src ./src
COPY migrations ./migrations
COPY knexfile.ts ./

# Build app source
RUN npm run build

# Compile migrations separately (they are not in src/)
RUN npx tsc --outDir dist/migrations --rootDir migrations migrations/*.ts --esModuleInterop --skipLibCheck --module commonjs --target ES2022

FROM node:22-alpine AS production

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/migrations ./migrations

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]