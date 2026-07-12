export const DEFAULT_INVOICE_COLOR = "#0b6281";
export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_LOGO_SIZE_LABEL = "2 MB";

export function isValidInvoiceColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function isAcceptedLogo(file: File) {
  return /^image\/(jpeg|png|webp)$/.test(file.type) && file.size <= MAX_LOGO_SIZE_BYTES;
}
