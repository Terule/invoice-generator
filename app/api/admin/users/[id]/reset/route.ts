import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";
import { fetchSeaweedFs } from "@/lib/seaweedfs";

export async function POST(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (!isAdminEmail(session.user.email)) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	const { id } = await context.params;
	const targetUser = await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			email: true,
			companyProfile: {
				select: {
					logoPath: true,
				},
			},
			invoices: {
				select: {
					pdfPath: true,
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

	if (!targetUser) {
		return NextResponse.json({ message: "User not found." }, { status: 404 });
	}

	const filePaths = [
		targetUser.companyProfile?.logoPath,
		...targetUser.invoices.map((invoice) => invoice.pdfPath),
	].filter((path): path is string => Boolean(path));

	await Promise.all(
		filePaths.map((path) =>
			fetchSeaweedFs(path, { method: "DELETE" }).catch(() => undefined),
		),
	);

	await prisma.$transaction([
		prisma.invoice.deleteMany({ where: { userId: targetUser.id } }),
		prisma.contractor.deleteMany({ where: { userId: targetUser.id } }),
		prisma.companyProfile.deleteMany({ where: { userId: targetUser.id } }),
	]);

	return NextResponse.json({
		message: "Account data reset successfully.",
		userId: targetUser.id,
		email: targetUser.email,
		removed: {
			companyProfile: Boolean(targetUser.companyProfile),
			contractors: targetUser._count.contractors,
			invoices: targetUser._count.invoices,
			storedFiles: filePaths.length,
		},
	});
}