function getDatabasePort() {
	const port = process.env.DB_PORT?.trim();

	return port && /^\d+$/.test(port) ? port : "3306";
}

export function getDatabaseUrl() {
	if (process.env.DATABASE_URL) {
		return process.env.DATABASE_URL;
	}

	const url = new URL("mysql://localhost");
	url.username = process.env.DB_USER ?? "invoice_user";
	url.password = process.env.DB_PASSWORD ?? "invoice_password";
	url.hostname = process.env.DB_HOST ?? "mysql";
	url.port = getDatabasePort();
	url.pathname = `/${process.env.DB_NAME ?? "invoice_generator"}`;

	return url.toString();
}
