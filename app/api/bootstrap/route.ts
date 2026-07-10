import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const [companyProfile, contractors, invoices] = await Promise.all([
		prisma.companyProfile.findUnique({
			where: {
				userId: session.user.id,
			},
		}),
		prisma.contractor.findMany({
			where: {
				userId: session.user.id,
			},
			orderBy: [{ isActive: "desc" }, { legalName: "asc" }],
		}),
		prisma.invoice.findMany({
			where: {
				userId: session.user.id,
			},
			include: {
				items: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		}),
	]);

	return NextResponse.json({
		companyProfile,
		contractors,
		invoices,
	});
}
