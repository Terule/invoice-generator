import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const databaseUrl =
	process.env.DATABASE_URL ??
	`mysql://${process.env.DB_USER ?? "invoice_user"}:${process.env.DB_PASSWORD ?? "invoice_password"}@${process.env.DB_HOST ?? "mysql"}:${process.env.DB_PORT ?? "3306"}/${process.env.DB_NAME ?? "invoice_generator"}`;

const adapter = new PrismaMariaDb(databaseUrl);

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
