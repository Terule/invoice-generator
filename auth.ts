import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/db/prisma";

const isProduction = process.env.NODE_ENV === "production";
const authSecret = process.env.AUTH_SECRET;
const authUrl = process.env.AUTH_URL;
const isDefaultSecret = authSecret === "replace-with-a-long-random-secret";

function isLocalhostUrl(value: string) {
	try {
		const parsed = new URL(value);
		return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
	} catch {
		return false;
	}
}

if (isProduction) {
	if (!authSecret || isDefaultSecret || authSecret.length < 32) {
		throw new Error(
			"AUTH_SECRET must be set to a strong random value with at least 32 characters in production.",
		);
	}
	if (!authUrl?.startsWith("https://") && !isLocalhostUrl(authUrl ?? "")) {
		throw new Error(
			"AUTH_URL must use HTTPS in production (localhost is allowed for local smoke tests).",
		);
	}
}

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "mysql",
	}),
	secret: authSecret,
	baseURL: authUrl ?? "http://localhost:3000",
	socialProviders: {
		google: {
			clientId: process.env.AUTH_GOOGLE_ID!,
			clientSecret: process.env.AUTH_GOOGLE_SECRET!,
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // refresh session daily
	},
});
