# Node 22 is the active LTS as of 2026. Using the official node image guarantees
# the correct LTS version and a standard npm-managed node_modules that webpack
# can always resolve (avoids Bun hardlink issues on Docker overlay filesystem).
FROM node:22-alpine

# Install latest Bun for prisma generate, next build, and the app runtime.
RUN npm install -g bun --quiet

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN NEXT_TELEMETRY_DISABLED=1 AUTH_SECRET=build-time-secret-please-change-at-runtime-123456 AUTH_URL=https://invoices.terule.dev.br bun run build

EXPOSE 3000

RUN chmod +x docker/app-entrypoint.sh docker/mysql-setup.sh

CMD ["sh", "./docker/app-entrypoint.sh"]
