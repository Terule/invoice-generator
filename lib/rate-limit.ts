type RateLimitOptions = {
	keyPrefix: string;
	windowMs: number;
	maxRequests: number;
};

type RateLimitEntry = {
	count: number;
	resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
	__invoiceRateLimitStore?: Map<string, RateLimitEntry>;
};

const store =
	globalStore.__invoiceRateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalStore.__invoiceRateLimitStore) {
	globalStore.__invoiceRateLimitStore = store;
}

export function getClientIp(request: Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");

	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() ?? "unknown";
	}

	return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(key: string, options: RateLimitOptions) {
	const now = Date.now();
	const storeKey = `${options.keyPrefix}:${key}`;
	const current = store.get(storeKey);

	if (!current || now >= current.resetAt) {
		const resetAt = now + options.windowMs;
		store.set(storeKey, { count: 1, resetAt });

		return {
			allowed: true,
			remaining: options.maxRequests - 1,
			resetAt,
		};
	}

	if (current.count >= options.maxRequests) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: current.resetAt,
		};
	}

	current.count += 1;
	store.set(storeKey, current);

	return {
		allowed: true,
		remaining: Math.max(options.maxRequests - current.count, 0),
		resetAt: current.resetAt,
	};
}
