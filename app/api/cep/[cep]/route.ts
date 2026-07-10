import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LOOKUP_WINDOW_MS = 60 * 1000;
const LOOKUP_MAX_REQUESTS = 30;

	export async function GET(
	request: Request,
	context: { params: Promise<{ cep: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const ip = getClientIp(request);
	const rateLimit = checkRateLimit(`${session.user.id}:${ip}`, {
		keyPrefix: "lookup:cep",
		windowMs: LOOKUP_WINDOW_MS,
		maxRequests: LOOKUP_MAX_REQUESTS,
	});

	if (!rateLimit.allowed) {
		return NextResponse.json(
			{ message: "Too many CEP lookup requests. Try again shortly." },
			{
				status: 429,
				headers: {
					"Retry-After": String(
						Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
					),
				},
			},
		);
	}

	const { cep: rawCep } = await context.params;
	const cep = rawCep.replace(/\D/g, "");

	if (!/^\d{8}$/.test(cep)) {
		return NextResponse.json({ message: "Invalid CEP." }, { status: 400 });
	}

	let response: Response;

	try {
		response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
			cache: "no-store",
			signal: AbortSignal.timeout(5000),
		});
	} catch {
		return NextResponse.json(
			{ message: "CEP lookup failed." },
			{ status: 502 },
		);
	}

	if (!response.ok) {
		return NextResponse.json(
			{ message: "CEP lookup failed." },
			{ status: 502 },
		);
	}

	const payload = await response.json();

	if (payload.erro) {
		return NextResponse.json({ message: "CEP not found." }, { status: 404 });
	}

	return NextResponse.json(payload);
}
