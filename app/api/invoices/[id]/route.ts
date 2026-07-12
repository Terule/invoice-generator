import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { fetchSeaweedFs } from "@/lib/seaweedfs";

async function findInvoice(id: string, userId: string) {
  return prisma.invoice.findFirst({
    where: { id, userId },
    include: { items: true }
  });
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const invoice = await findInvoice(id, session.user.id);

  if (!invoice) {
    return NextResponse.json({ message: "Invoice not found." }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const invoice = await findInvoice(id, session.user.id);

  if (!invoice) {
    return NextResponse.json({ message: "Invoice not found." }, { status: 404 });
  }

  if (invoice.status !== "DRAFT") {
    return NextResponse.json({ message: "Only draft invoices can be deleted." }, { status: 409 });
  }

  if (invoice.pdfPath) {
    await fetchSeaweedFs(invoice.pdfPath, { method: "DELETE" }).catch(() => undefined);
  }

  await prisma.invoice.delete({ where: { id: invoice.id } });

  return new NextResponse(null, { status: 204 });
}
