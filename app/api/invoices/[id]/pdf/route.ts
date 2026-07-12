import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { createInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { id } = await context.params;

	const invoice = await prisma.invoice.findFirst({
		where: {
			id,
			userId: session.user.id,
		},
		include: {
			items: true,
		},
	});

	if (!invoice) {
		return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
	}

	const companySnapshot = invoice.companySnapshot as Record<string, unknown>;
	const currentCompany = await prisma.companyProfile.findUnique({
		where: { userId: session.user.id },
		select: { logoPath: true },
	});
	const company = {
		...companySnapshot,
		logoPath: companySnapshot.logoPath || currentCompany?.logoPath || null,
	};

	const pdf = await createInvoicePdf({
		invoiceNumber: invoice.invoiceNumber,
		currency: invoice.currency,
		issueDate: invoice.issueDate,
		dueDate: invoice.dueDate,
		clientName: invoice.clientName,
		clientEmail: invoice.clientEmail,
		notes: invoice.notes,
		totalCents: invoice.totalCents,
		company,
		contractor: invoice.contractorSnapshot as Record<string, unknown>,
		items: invoice.items,
	});

	return new NextResponse(pdf, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
			"Cache-Control": "private, no-store",
		},
	});
}
