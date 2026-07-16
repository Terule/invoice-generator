#!/bin/sh
set -eu

NODE_ENV="${NODE_ENV:-development}"

# Prisma builds the URL from the individual DB_* variables so credentials are
# encoded safely and an invalid externally supplied DATABASE_URL is ignored.
unset DATABASE_URL
export AUTH_URL="${AUTH_URL:-http://localhost:3000}"

npx prisma generate

if [ "$NODE_ENV" = "production" ]; then
	npx prisma migrate deploy
	exec npm run start
fi

exec npm run dev
