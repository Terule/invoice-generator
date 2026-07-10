import { defineConfig } from "prisma/config";

const databaseUrl =
	process.env.DATABASE_URL ??
	`mysql://${process.env.DB_USER ?? "invoice_user"}:${process.env.DB_PASSWORD ?? "invoice_password"}@${process.env.DB_HOST ?? "mysql"}:${process.env.DB_PORT ?? "3306"}/${process.env.DB_NAME ?? "invoice_generator"}`;

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: databaseUrl,
	},
});
