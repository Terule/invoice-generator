export const DEFAULT_INVOICE_COLOR = "#0b6281";
export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_LOGO_SIZE_LABEL = "2 MB";
export const MAX_LOGO_DIMENSION_PX = 2_000;
export const MAX_LOGO_DIMENSIONS_LABEL = "2,000 x 2,000 px";

const WHITE_RGB = { red: 255, green: 255, blue: 255 };
const SLATE_RGB = { red: 23, green: 68, blue: 90 };
const NAVY_RGB = { red: 15, green: 23, blue: 42 };

export function isValidInvoiceColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function isAcceptedLogo(file: File) {
  return /^image\/(jpeg|png|webp)$/.test(file.type) && file.size <= MAX_LOGO_SIZE_BYTES;
}

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHexColor(value: string): RgbColor | null {
  if (!isValidInvoiceColor(value)) {
    return null;
  }

  return {
    red: Number.parseInt(value.slice(1, 3), 16),
    green: Number.parseInt(value.slice(3, 5), 16),
    blue: Number.parseInt(value.slice(5, 7), 16)
  };
}

function rgbToHex({ red, green, blue }: RgbColor) {
  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
}

function mixRgb(base: RgbColor, target: RgbColor, ratio: number): RgbColor {
  return {
    red: clampChannel(base.red * (1 - ratio) + target.red * ratio),
    green: clampChannel(base.green * (1 - ratio) + target.green * ratio),
    blue: clampChannel(base.blue * (1 - ratio) + target.blue * ratio)
  };
}

export function getInvoiceBrandingTones(value: string) {
  const base = parseHexColor(value) ?? parseHexColor(DEFAULT_INVOICE_COLOR) ?? SLATE_RGB;

  return {
    accent: rgbToHex(base),
    tableHeaderBackground: rgbToHex(mixRgb(base, WHITE_RGB, 0.82)),
    tableHeaderText: rgbToHex(mixRgb(base, NAVY_RGB, 0.35)),
    subtotalBackground: rgbToHex(mixRgb(base, WHITE_RGB, 0.9)),
    subtotalBorder: rgbToHex(mixRgb(base, WHITE_RGB, 0.72)),
    subtotalText: rgbToHex(mixRgb(base, SLATE_RGB, 0.28))
  };
}
