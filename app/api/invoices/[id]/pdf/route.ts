import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { createInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(
	_: Request,
	context: { params: Promise<{ id: string }> },
) {
	const session = await auth();

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

	const pdf = createInvoicePdf({
		invoiceNumber: invoice.invoiceNumber,
		currency: invoice.currency,
		issueDate: invoice.issueDate,
		dueDate: invoice.dueDate,
		clientName: invoice.clientName,
		clientEmail: invoice.clientEmail,
		notes: invoice.notes,
		totalCents: invoice.totalCents,
		company: invoice.companySnapshot as Record<string, unknown>,
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
