import { defineConfig } from "prisma/config";

import { getDatabaseUrl } from "./lib/db/database-url";

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: getDatabaseUrl(),
	},
});
