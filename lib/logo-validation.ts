import "server-only";

import sharp from "sharp";

import { MAX_LOGO_DIMENSION_PX } from "@/lib/branding";

export async function hasAcceptedLogoDimensions(file: File) {
  try {
    const metadata = await sharp(Buffer.from(await file.arrayBuffer())).metadata();

    return Boolean(
      metadata.width &&
        metadata.height &&
        metadata.width === metadata.height &&
        metadata.width <= MAX_LOGO_DIMENSION_PX
    );
  } catch {
    return false;
  }
}
