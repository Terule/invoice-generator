import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCompanyIdentifier, getNextInvoiceNumber } from "@/lib/dashboard";
import { prisma } from "@/lib/db/prisma";
import { createInvoiceSchema } from "@/lib/validations";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const invoices = await prisma.invoice.findMany({
		where: {
			userId: session.user.id,
		},
		include: {
			items: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return NextResponse.json(invoices);
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const json = await request.json();
	const parsed = createInvoiceSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json(
			{
				message: "Invalid invoice payload",
				issues: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const subtotalCents = parsed.data.items.reduce((sum, item) => {
		return sum + item.quantity * item.unitPriceCents;
	}, 0);

	const companyProfile = await prisma.companyProfile.findUnique({
		where: {
			userId: session.user.id,
		},
	});

	if (!companyProfile) {
		return NextResponse.json(
			{ message: "Complete your company setup before issuing invoices." },
			{ status: 400 },
		);
	}

	const contractor = parsed.data.contractorId
		? await prisma.contractor.findFirst({
				where: {
					id: parsed.data.contractorId,
					userId: session.user.id,
				},
			})
		: null;

	if (parsed.data.contractorId && !contractor) {
		return NextResponse.json(
			{ message: "The selected contractor is not available." },
			{ status: 400 },
		);
	}

	const invoiceCount = await prisma.invoice.count({
		where: {
			userId: session.user.id,
		},
	});

	const invoiceNumber = getNextInvoiceNumber({
		invoiceCount,
		prefix: getCompanyIdentifier(
			undefined,
			undefined,
			companyProfile.legalName,
		),
	});

	const invoice = await prisma.invoice.create({
		data: {
			userId: session.user.id,
			contractorId: contractor?.id,
			invoiceNumber,
			clientName: parsed.data.clientName,
			clientEmail: parsed.data.clientEmail,
			currency: parsed.data.currency,
			issueDate: new Date(parsed.data.issueDate),
			dueDate: new Date(parsed.data.dueDate),
			notes: parsed.data.notes,
			subtotalCents,
			totalCents: subtotalCents,
			companySnapshot: {
				legalName: companyProfile.legalName,
				tradingName: companyProfile.tradingName,
				taxId: companyProfile.taxId,
				cep: companyProfile.cep,
				street: companyProfile.street,
				number: companyProfile.number,
				neighborhood: companyProfile.neighborhood,
				city: companyProfile.city,
				state: companyProfile.state,
				country: companyProfile.country,
				logoPath: companyProfile.logoPath,
				invoiceColor: companyProfile.invoiceColor,
				paymentBeneficiary: companyProfile.paymentBeneficiary,
				paymentBankName: companyProfile.paymentBankName,
				paymentAccountNumber: companyProfile.paymentAccountNumber,
				paymentIban: companyProfile.paymentIban,
				paymentSwiftBic: companyProfile.paymentSwiftBic,
				paymentPixKey: companyProfile.paymentPixKey,
				paymentInstructions: companyProfile.paymentInstructions,
			},
			contractorSnapshot: {
				legalName: parsed.data.clientName,
				contactEmail: parsed.data.clientEmail,
				contractorId: contractor?.id ?? null,
				companyIdentifier: contractor?.companyIdentifier ?? null,
				taxId: contractor?.taxId ?? null,
				tradingName: contractor?.tradingName ?? null,
				cep: contractor?.cep ?? null,
				street: contractor?.street ?? null,
				number: contractor?.number ?? null,
				neighborhood: contractor?.neighborhood ?? null,
				city: contractor?.city ?? null,
				state: contractor?.state ?? null,
				country: contractor?.country ?? null,
			},
			items: {
				create: parsed.data.items,
			},
		},
		include: {
			items: true,
		},
	});

	return NextResponse.json(invoice, { status: 201 });
}
