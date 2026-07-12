import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAcceptedLogo, MAX_LOGO_SIZE_LABEL } from "@/lib/branding";
import { prisma } from "@/lib/db/prisma";
import { hasAcceptedLogoDimensions } from "@/lib/logo-validation";
import { fetchSeaweedFs } from "@/lib/seaweedfs";

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

  let response: Response;

  try {
    response = await fetchSeaweedFs(profile.logoPath, { cache: "no-store" });
  } catch {
    return NextResponse.json(
      { message: "Logo storage is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

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

  if (!(await hasAcceptedLogoDimensions(file))) {
    return NextResponse.json(
      { message: "Choose a square logo no larger than 2,000 x 2,000 px." },
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
  let uploaded: Response;

  try {
    uploaded = await fetchSeaweedFs(logoPath, {
      method: "POST",
      body: upload
    });
  } catch {
    return NextResponse.json(
      { message: "Logo storage is starting. Please try again in a moment." },
      { status: 503 }
    );
  }

  if (!uploaded.ok) {
    return NextResponse.json({ message: "Unable to upload logo." }, { status: 502 });
  }

  await prisma.companyProfile.update({
    where: { userId: session.user.id },
    data: { logoPath }
  });

  if (profile.logoPath) {
    await fetchSeaweedFs(profile.logoPath, { method: "DELETE" }).catch(() => undefined);
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
    await fetchSeaweedFs(profile.logoPath, { method: "DELETE" }).catch(() => undefined);
  }

  await prisma.companyProfile.update({
    where: { userId: session.user.id },
    data: { logoPath: null }
  });

  return new NextResponse(null, { status: 204 });
}
