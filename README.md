# Invoice Generator

Starter app for generating invoices for international clients with:

- Next.js App Router
- Tailwind CSS
- shadcn-style UI primitives
- TanStack Query
- Better auth foundation with Google login via Auth.js
- Prisma + MySQL
- Bun runtime and package manager
- Docker Compose with separate `app` and `mysql` services

## Quick start

1. Copy `.env.example` to `.env`.
2. Fill in `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET`.
3. Install dependencies locally if you want to run it outside Docker:

```bash
bun install
```

4. Start the stack:

```bash
docker compose up --build
```

5. In another shell, run the Prisma sync once the database is healthy:

```bash
docker compose exec app bunx prisma db push
```

6. Open `http://localhost:3000`.

## Notes

- The current dashboard includes Google sign-in, invoice creation, and invoice listing.
- Invoice totals are stored in cents to avoid floating point issues.
- The next good step is generating PDF invoices and adding company profile settings.

## Deploy with Coolify

Use [docker-compose.coolify.yml](docker-compose.coolify.yml) as your stack file in Coolify.

1. Create a new Docker Compose application in Coolify and point it to this repository.
2. Set compose file path to `docker-compose.coolify.yml`.
3. Configure environment variables in Coolify (recommended), using the same names from the compose file:
	- `AUTH_URL=https://invoices.terule.dev.br`
	- `AUTH_SECRET=<strong-random-secret-at-least-32-chars>`
	- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
	- `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `MYSQL_ROOT_PASSWORD`
	- Optionally set `DATABASE_URL` directly. If omitted, it is derived using `${VAR:-default}` compose interpolation.
4. Expose app service port `3000` through Coolify domain routing.
5. In Google Cloud OAuth settings, add this callback URL:
	- `https://invoices.terule.dev.br/api/auth/callback/google`

The app entrypoint runs Prisma migrations automatically in production before starting Next.js.

## Security checklist for production

Before deploying to production:

1. Set strong auth values:
	- `AUTH_SECRET` must be a high-entropy secret (at least 32 chars).
	- `AUTH_URL` must be an `https://` URL.
	- Keep `AUTH_TRUST_HOST=false` unless your deployment platform requires trusted proxy headers.
2. Use managed secrets storage (not plain files in CI/CD).
3. Enable TLS end-to-end (client -> edge -> app).
4. Restrict database network access to private network paths only.
5. Run dependency auditing before release:

```bash
bun audit
```

6. Run static checks before release:

```bash
bun run lint
bun run check
```

7. Confirm observability and incident response:
	- structured request logs
	- alerting on auth failures and 5xx spikes
	- backup and restore drills for MySQL data
