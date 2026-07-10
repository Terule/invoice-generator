import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { normalizeCompanyIdentifier } from "@/lib/dashboard";
import { prisma } from "@/lib/db/prisma";
import { contractorSchema } from "@/lib/validations";

function emptyToUndefined(value?: string) {
	return value?.trim() ? value.trim() : undefined;
}

export async function PATCH(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const json = await request.json();
	const parsed = contractorSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json(
			{
				message: "Invalid contractor payload.",
				issues: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}
	const { id } = await context.params;
	const companyIdentifier = emptyToUndefined(parsed.data.companyIdentifier);
	const normalizedCompanyIdentifier = companyIdentifier
		? normalizeCompanyIdentifier(companyIdentifier)
		: null;

	const contractor = await prisma.contractor.updateMany({
		where: {
			id,
			userId: session.user.id,
		},
		data: {
			legalName: parsed.data.legalName,
			tradingName: emptyToUndefined(parsed.data.tradingName),
			companyIdentifier: normalizedCompanyIdentifier,
			contactEmail: emptyToUndefined(parsed.data.contactEmail),
			taxId: emptyToUndefined(parsed.data.taxId)?.replace(/\D/g, ""),
			cep: emptyToUndefined(parsed.data.cep)?.replace(/\D/g, ""),
			street: emptyToUndefined(parsed.data.street),
			number: emptyToUndefined(parsed.data.number),
			neighborhood: emptyToUndefined(parsed.data.neighborhood),
			city: emptyToUndefined(parsed.data.city),
			state: emptyToUndefined(parsed.data.state)?.toUpperCase(),
			country: parsed.data.country,
			defaultCurrency: parsed.data.defaultCurrency.toUpperCase(),
			defaultRateCents: parsed.data.defaultRateCents,
			isActive: parsed.data.isActive,
		},
	});

	if (!contractor.count) {
		return NextResponse.json(
			{ message: "Contractor not found." },
			{ status: 404 },
		);
	}

	const updated = await prisma.contractor.findUnique({
		where: {
			id,
		},
	});

	return NextResponse.json(updated);
}
