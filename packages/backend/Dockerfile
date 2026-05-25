FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json ./
COPY ../../tsconfig.base.json /tsconfig.base.json

RUN npm install

COPY src ./src

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 3000

CMD ["node", "dist/server.js"]
