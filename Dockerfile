FROM oven/bun:1.3.14-alpine

WORKDIR /app

COPY package.json bun.lock ./
# NODE_ENV=development ensures devDependencies (tailwindcss, postcss, etc.) are
# installed even when Coolify injects NODE_ENV=production as a build-arg.
RUN NODE_ENV=development bun install

COPY . .

RUN bunx prisma generate
RUN NEXT_TELEMETRY_DISABLED=1 AUTH_SECRET=build-time-secret-please-change-at-runtime-123456 AUTH_URL=https://invoices.terule.dev.br bun run build

EXPOSE 3000

RUN chmod +x docker/app-entrypoint.sh docker/mysql-setup.sh

CMD ["sh", "./docker/app-entrypoint.sh"]
