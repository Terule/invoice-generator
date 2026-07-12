import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { fetchSeaweedFs } from "@/lib/seaweedfs";

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
	});

	if (!invoice) {
		return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
	}

	if (!invoice.pdfPath) {
		return NextResponse.json({ message: "The saved PDF is not available for this invoice." }, { status: 404 });
	}

	let pdf: Response;

	try {
		pdf = await fetchSeaweedFs(invoice.pdfPath, { cache: "no-store" });
	} catch {
		return NextResponse.json({ message: "Invoice storage is temporarily unavailable." }, { status: 503 });
	}

	if (!pdf.ok || !pdf.body) {
		return NextResponse.json({ message: "The saved PDF is not available for this invoice." }, { status: 404 });
	}

	return new NextResponse(pdf.body, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
			"Cache-Control": "private, no-store",
		},
	});
}
