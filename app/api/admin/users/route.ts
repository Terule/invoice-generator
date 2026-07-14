import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (!isAdminEmail(session.user.email)) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	const users = await prisma.user.findMany({
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			name: true,
			email: true,
			createdAt: true,
			updatedAt: true,
			companyProfile: {
				select: {
					id: true,
				},
			},
			_count: {
				select: {
					contractors: true,
					invoices: true,
				},
			},
		},
	});

	return NextResponse.json(
		users.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			hasCompanyProfile: Boolean(user.companyProfile),
			contractorCount: user._count.contractors,
			invoiceCount: user._count.invoices,
		})),
	);
}