#!/bin/sh
set -eu

NODE_ENV="${NODE_ENV:-development}"
DB_USER="${DB_USER:-invoice_user}"
DB_PASSWORD="${DB_PASSWORD:-invoice_password}"
DB_NAME="${DB_NAME:-invoice_generator}"
DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"

export DATABASE_URL="${DATABASE_URL:-mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}}"
export AUTH_URL="${AUTH_URL:-http://localhost:3000}"

bunx prisma generate

if [ "$NODE_ENV" = "production" ]; then
	bunx prisma migrate deploy
	exec bun run start
fi

exec bun run dev
