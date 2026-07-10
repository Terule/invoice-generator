import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { paymentDetailsSchema } from "@/lib/validations";

function optionalValue(value?: string) {
  return value?.trim() || null;
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = paymentDetailsSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payment details." }, { status: 400 });
  }

  const profile = await prisma.companyProfile.update({
    where: {
      userId: session.user.id
    },
    data: {
      paymentBeneficiary: optionalValue(parsed.data.paymentBeneficiary),
      paymentBankName: optionalValue(parsed.data.paymentBankName),
      paymentAccountNumber: optionalValue(parsed.data.paymentAccountNumber),
      paymentIban: optionalValue(parsed.data.paymentIban),
      paymentSwiftBic: optionalValue(parsed.data.paymentSwiftBic),
      paymentPixKey: optionalValue(parsed.data.paymentPixKey),
      paymentInstructions: optionalValue(parsed.data.paymentInstructions)
    }
  });

  return NextResponse.json(profile);
}
