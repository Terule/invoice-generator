import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAcceptedLogo, MAX_LOGO_SIZE_LABEL } from "@/lib/branding";
import { prisma } from "@/lib/db/prisma";
import { getSeaweedFsUrl } from "@/lib/seaweedfs";

function extensionFor(file: File) {
  return file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
}

async function getCurrentProfile(userId: string) {
  return prisma.companyProfile.findUnique({ where: { userId } });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCurrentProfile(session.user.id);

  if (!profile?.logoPath) {
    return NextResponse.json({ message: "Logo not found" }, { status: 404 });
  }

  const response = await fetch(getSeaweedFsUrl(profile.logoPath), { cache: "no-store" });

  if (!response.ok || !response.body) {
    return NextResponse.json({ message: "Logo not found" }, { status: 404 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream"
    }
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const file = data.get("logo");

  if (!(file instanceof File) || !isAcceptedLogo(file)) {
    return NextResponse.json(
      { message: `Choose a PNG, JPEG, or WebP logo up to ${MAX_LOGO_SIZE_LABEL}.` },
      { status: 400 }
    );
  }

  const profile = await getCurrentProfile(session.user.id);

  if (!profile) {
    return NextResponse.json({ message: "Company profile not found." }, { status: 404 });
  }

  const logoPath = `/company-logos/${session.user.id}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const upload = new FormData();
  upload.set("file", file, file.name);
  const uploaded = await fetch(getSeaweedFsUrl(logoPath), {
    method: "POST",
    body: upload
  });

  if (!uploaded.ok) {
    return NextResponse.json({ message: "Unable to upload logo." }, { status: 502 });
  }

  await prisma.companyProfile.update({
    where: { userId: session.user.id },
    data: { logoPath }
  });

  if (profile.logoPath) {
    await fetch(getSeaweedFsUrl(profile.logoPath), { method: "DELETE" }).catch(() => undefined);
  }

  return NextResponse.json({ logoPath });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCurrentProfile(session.user.id);

  if (profile?.logoPath) {
    await fetch(getSeaweedFsUrl(profile.logoPath), { method: "DELETE" }).catch(() => undefined);
  }

  await prisma.companyProfile.update({
    where: { userId: session.user.id },
    data: { logoPath: null }
  });

  return new NextResponse(null, { status: 204 });
}
