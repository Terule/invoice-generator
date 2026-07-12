import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { createInvoiceSchema } from "@/lib/validations";

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = createInvoiceSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid invoice payload." }, { status: 400 });
  }

  const { id } = await context.params;
  const invoice = await findInvoice(id, session.user.id);

  if (!invoice) {
    return NextResponse.json({ message: "Invoice not found." }, { status: 404 });
  }

  if (invoice.status !== "DRAFT") {
    return NextResponse.json({ message: "Only draft invoices can be edited." }, { status: 409 });
  }

  const totalCents = parsed.data.items.reduce((total, item) => {
    return total + item.quantity * item.unitPriceCents;
  }, 0);

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      currency: parsed.data.currency,
      issueDate: new Date(parsed.data.issueDate),
      dueDate: new Date(parsed.data.dueDate),
      notes: parsed.data.notes ?? null,
      subtotalCents: totalCents,
      totalCents,
      items: {
        deleteMany: {},
        create: parsed.data.items
      }
    },
    include: { items: true }
  });

  return NextResponse.json(updated);
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

  await prisma.invoice.delete({ where: { id: invoice.id } });

  return new NextResponse(null, { status: 204 });
}
