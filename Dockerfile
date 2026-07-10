FROM oven/bun:1.1.26-alpine

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY package.json bun.lock ./
RUN bun install

COPY . .

RUN npx prisma generate

EXPOSE 3000

RUN chmod +x docker/app-entrypoint.sh docker/mysql-setup.sh

CMD ["sh", "./docker/app-entrypoint.sh"]
