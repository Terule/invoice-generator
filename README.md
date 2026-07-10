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
