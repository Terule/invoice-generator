import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { companyBrandingSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = companyBrandingSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid branding settings." },
      { status: 400 }
    );
  }

  const profile = await prisma.companyProfile.update({
    where: { userId: session.user.id },
    data: parsed.data
  });

  return NextResponse.json(profile);
}
