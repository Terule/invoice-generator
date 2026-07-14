import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { normalizeCnpj } from "@/lib/cnpj";
import { prisma } from "@/lib/db/prisma";
import { companyInfoSchema, companyProfileSchema } from "@/lib/validations";

function normalizeDigits(value: string) {
	return value.replace(/\D/g, "");
}

function optionalValue(value?: string) {
	return value?.trim() || null;
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const existing = await prisma.companyProfile.findUnique({
		where: {
			userId: session.user.id,
		},
	});

	if (existing) {
		return NextResponse.json(
			{ message: "Company profile is already configured." },
			{ status: 409 },
		);
	}

	const json = await request.json();
	const parsed = companyProfileSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json(
			{ message: "Invalid company profile.", issues: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const profile = await prisma.companyProfile.create({
		data: {
			userId: session.user.id,
			legalName: parsed.data.legalName,
			tradingName: parsed.data.tradingName?.trim() || parsed.data.legalName,
			taxId: normalizeCnpj(parsed.data.taxId),
			cep: normalizeDigits(parsed.data.cep),
			street: parsed.data.street,
			number: parsed.data.number,
			neighborhood: parsed.data.neighborhood,
			city: parsed.data.city,
			state: parsed.data.state.toUpperCase(),
			country: parsed.data.country,
			paymentBeneficiary: optionalValue(parsed.data.paymentBeneficiary),
			paymentBankName: optionalValue(parsed.data.paymentBankName),
			paymentAccountNumber: optionalValue(parsed.data.paymentAccountNumber),
			paymentSortCode: optionalValue(parsed.data.paymentSortCode),
			paymentIban: optionalValue(parsed.data.paymentIban),
			paymentSwiftBic: optionalValue(parsed.data.paymentSwiftBic),
			paymentPixKey: optionalValue(parsed.data.paymentPixKey),
			paymentInstructions: optionalValue(parsed.data.paymentInstructions),
			setupSource: parsed.data.setupSource,
		},
	});

	return NextResponse.json(profile, { status: 201 });
}

export async function PATCH(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const existing = await prisma.companyProfile.findUnique({
		where: {
			userId: session.user.id,
		},
	});

	if (!existing) {
		return NextResponse.json({ message: "Company profile not found." }, { status: 404 });
	}

	const json = await request.json();
	const parsed = companyInfoSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json(
			{ message: "Invalid company information.", issues: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const profile = await prisma.companyProfile.update({
		where: { userId: session.user.id },
		data: {
			legalName: parsed.data.legalName,
			tradingName: parsed.data.tradingName?.trim() || parsed.data.legalName,
			taxId: normalizeCnpj(parsed.data.taxId),
			cep: normalizeDigits(parsed.data.cep),
			street: parsed.data.street,
			number: parsed.data.number,
			neighborhood: parsed.data.neighborhood,
			city: parsed.data.city,
			state: parsed.data.state.toUpperCase(),
			country: parsed.data.country,
		},
	});

	return NextResponse.json(profile);
}
