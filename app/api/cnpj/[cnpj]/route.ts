import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isValidCnpj, normalizeCnpj } from "@/lib/cnpj";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LOOKUP_WINDOW_MS = 60 * 1000;
const LOOKUP_MAX_REQUESTS = 30;

	export async function GET(
	request: Request,
	context: { params: Promise<{ cnpj: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const ip = getClientIp(request);
	const rateLimit = checkRateLimit(`${session.user.id}:${ip}`, {
		keyPrefix: "lookup:cnpj",
		windowMs: LOOKUP_WINDOW_MS,
		maxRequests: LOOKUP_MAX_REQUESTS,
	});

	if (!rateLimit.allowed) {
		return NextResponse.json(
			{ message: "Too many CNPJ lookup requests. Try again shortly." },
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

	const { cnpj: rawCnpj } = await context.params;
	const cnpj = normalizeCnpj(rawCnpj);

	if (!isValidCnpj(cnpj)) {
		return NextResponse.json({ message: "Invalid CNPJ." }, { status: 400 });
	}

	let response: Response;

	try {
		response = await fetch(`https://api.opencnpj.org/${cnpj}?dataset=receita`, {
			cache: "no-store",
			signal: AbortSignal.timeout(5000),
		});
	} catch {
		return NextResponse.json(
			{ message: "CNPJ lookup failed." },
			{ status: 502 },
		);
	}

	if (!response.ok) {
		return NextResponse.json(
			{ message: "CNPJ lookup failed." },
			{ status: response.status === 404 ? 404 : 502 },
		);
	}

	const payload = await response.json();

	return NextResponse.json({
		legalName: payload.razao_social,
		tradingName: payload.nome_fantasia,
		taxId: payload.cnpj,
		cep: payload.cep,
		street: payload.logradouro,
		number: payload.numero,
		neighborhood: payload.bairro,
		city: payload.municipio,
		state: payload.uf,
		country: payload.pais || "Brazil",
	});
}
