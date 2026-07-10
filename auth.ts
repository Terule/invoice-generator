import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

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

const trustHost = process.env.AUTH_TRUST_HOST
	? process.env.AUTH_TRUST_HOST === "true"
	: !isProduction;

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	secret: authSecret,
	trustHost,
	session: {
		strategy: "database",
		maxAge: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
	],
	callbacks: {
		session: async ({ session, user }) => {
			if (session.user) {
				session.user.id = user.id;
			}

			return session;
		},
	},
	pages: {
		signIn: "/",
	},
});
