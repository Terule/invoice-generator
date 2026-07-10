FROM oven/bun:1.1.26-alpine

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY package.json bun.lock ./
RUN bun install

COPY . .

RUN npx prisma generate
RUN AUTH_SECRET=build-time-secret-please-change-at-runtime-123456 AUTH_URL=https://invoices.terule.dev.br bun run build

EXPOSE 3000

RUN chmod +x docker/app-entrypoint.sh docker/mysql-setup.sh

CMD ["sh", "./docker/app-entrypoint.sh"]
