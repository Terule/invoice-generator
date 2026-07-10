#!/bin/sh
set -eu

DB_USER="${DB_USER:-invoice_user}"
DB_PASSWORD="${DB_PASSWORD:-invoice_password}"
DB_NAME="${DB_NAME:-invoice_generator}"
DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"

export DATABASE_URL="${DATABASE_URL:-mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}}"
export AUTH_URL="${AUTH_URL:-http://localhost:3000}"

npx prisma generate
exec bun run dev
