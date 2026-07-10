/** @type {import("next").NextConfig} */
const isProduction = process.env.NODE_ENV === "production";

const scriptSrc = isProduction
	? "script-src 'self' 'unsafe-inline'"
	: "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const connectSrc = isProduction
	? "connect-src 'self' https:"
	: "connect-src 'self' http: https: ws: wss:";

const securityHeaders = [
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
	},
	{
		key: "Cross-Origin-Opener-Policy",
		value: "same-origin",
	},
	{
		key: "Cross-Origin-Resource-Policy",
		value: "same-origin",
	},
	{
		key: "Content-Security-Policy",
		value: [
			"default-src 'self'",
			"base-uri 'self'",
			"frame-ancestors 'none'",
			"object-src 'none'",
			scriptSrc,
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob: https:",
			"font-src 'self' data:",
			connectSrc,
			"form-action 'self'",
		].join("; "),
	},
];

if (isProduction) {
	securityHeaders.push({
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	});
}

const nextConfig = {
	poweredByHeader: false,
	reactStrictMode: true,
	typedRoutes: true,
	images: {
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
