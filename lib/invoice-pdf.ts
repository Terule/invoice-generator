type InvoicePdfItem = {
  description: string;
  quantity: number;
  unitPriceCents: number;
};

type InvoicePdfData = {
  invoiceNumber: string;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  clientName: string;
  clientEmail: string;
  notes: string | null;
  totalCents: number;
  company: Record<string, unknown>;
  contractor: Record<string, unknown>;
  items: InvoicePdfItem[];
};

const pageWidth = 595;
const pageHeight = 842;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\xFF]/g, "?");
}

function formatMoney(cents: number, currency: string) {
  const symbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  const amount = (cents / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${symbol}${amount}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function wrapText(value: string, maxCharacters: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;

    if (nextLine.length <= maxCharacters) {
      line = nextLine;
      continue;
    }

    if (line) {
      lines.push(line);
    }

    line = word.length > maxCharacters ? `${word.slice(0, maxCharacters - 3)}...` : word;
  }

  if (line) {
    lines.push(line);
  }

  return lines.length ? lines : [""];
}

function text(commands: string[], value: string, x: number, y: number, size = 10, bold = false, align: "left" | "right" = "left") {
  const width = value.length * size * (bold ? 0.56 : 0.5);
  const originX = align === "right" ? x - width : x;
  commands.push(`BT /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${originX.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(value)}) Tj ET`);
}

function line(commands: string[], x1: number, y1: number, x2: number, y2: number, color = "0.84 0.87 0.89", width = 1) {
  commands.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
}

export function createInvoicePdf(data: InvoicePdfData) {
  const commands = ["0.12 0.15 0.18 rg"];
  const companyName = asString(data.company.tradingName) || asString(data.company.legalName) || "Your company";
  const legalName = asString(data.company.legalName);
  const address = [
    asString(data.company.street),
    asString(data.company.number),
    asString(data.company.neighborhood),
    asString(data.company.city),
    asString(data.company.state),
    asString(data.company.country)
  ].filter(Boolean).join(", ");
  const taxId = asString(data.company.taxId);
  const companyId = asString(data.contractor.companyIdentifier);
  const paymentLines = [
    ["Beneficiary", asString(data.company.paymentBeneficiary)],
    ["Bank", asString(data.company.paymentBankName)],
    ["Account", asString(data.company.paymentAccountNumber)],
    ["IBAN", asString(data.company.paymentIban)],
    ["SWIFT / BIC", asString(data.company.paymentSwiftBic)],
    ["PIX", asString(data.company.paymentPixKey)]
  ].filter(([, value]) => value);
  const paymentInstructions = asString(data.company.paymentInstructions);
  const items = data.items.length
    ? data.items
    : [{ description: "Service line item", quantity: 1, unitPriceCents: data.totalCents }];
  let y = 790;

  text(commands, "FROM", 48, y, 8, true);
  text(commands, "INVOICE", 547, y, 8, true, "right");
  y -= 28;
  wrapText(companyName, 37).slice(0, 2).forEach((value) => {
    text(commands, value, 48, y, 20, true);
    y -= 24;
  });
  text(commands, data.invoiceNumber, 547, 762, 19, true, "right");
  text(commands, `Issued ${formatDate(data.issueDate)}`, 547, 738, 9, false, "right");
  text(commands, `Due ${formatDate(data.dueDate)}`, 547, 724, 9, false, "right");
  if (legalName && legalName !== companyName) {
    text(commands, legalName, 48, y - 2, 9);
    y -= 16;
  }
  wrapText(address, 66).slice(0, 2).forEach((value) => {
    text(commands, value, 48, y - 2, 9);
    y -= 13;
  });
  if (taxId) {
    text(commands, `Tax ID (CNPJ): ${taxId}`, 48, y - 2, 9);
  }

  line(commands, 48, 650, 547, 650);
  text(commands, "BILL TO", 48, 624, 8, true);
  wrapText(data.clientName, 45).slice(0, 2).forEach((value, index) => text(commands, value, 48, 600 - index * 18, 14, true));
  if (companyId) {
    text(commands, `Company ID: ${companyId}`, 48, 564, 9);
  }
  text(commands, data.clientEmail, 48, companyId ? 550 : 564, 9);

  line(commands, 48, 510, 547, 510);
  text(commands, "DESCRIPTION", 48, 490, 8, true);
  text(commands, "QTY", 355, 490, 8, true, "right");
  text(commands, "RATE", 445, 490, 8, true, "right");
  text(commands, "TOTAL", 547, 490, 8, true, "right");
  line(commands, 48, 478, 547, 478);

  let rowY = 454;

  items.forEach((item) => {
    const description = wrapText(item.description, 47).slice(0, 2);
    const itemTotal = item.quantity * item.unitPriceCents;
    description.forEach((value, index) => text(commands, value, 48, rowY - index * 15, 10, index === 0));
    text(commands, String(item.quantity), 355, rowY, 10, false, "right");
    text(commands, formatMoney(item.unitPriceCents, data.currency), 445, rowY, 10, false, "right");
    text(commands, formatMoney(itemTotal, data.currency), 547, rowY, 10, true, "right");
    rowY -= Math.max(28, description.length * 15 + 12);
  });

  const tableBottom = rowY;
  line(commands, 48, tableBottom, 547, tableBottom);

  const totalY = tableBottom - 46;
  text(commands, "TOTAL DUE", 408, totalY, 10, true, "right");
  text(commands, formatMoney(data.totalCents, data.currency), 547, totalY - 4, 22, true, "right");
  line(commands, 355, totalY + 12, 547, totalY + 12, "0.12 0.15 0.18", 1.5);

  let detailY = totalY - 48;
  if (paymentLines.length || paymentInstructions) {
    text(commands, "PAYMENT INSTRUCTIONS", 48, detailY, 8, true);
    detailY -= 16;
    text(commands, `Reference: ${data.invoiceNumber}`, 48, detailY, 9);
    detailY -= 14;
    paymentLines.slice(0, 4).forEach(([label, value]) => {
      text(commands, `${label}: ${value}`, 48, detailY, 9);
      detailY -= 14;
    });
    wrapText(paymentInstructions, 79).slice(0, 2).forEach((value) => {
      text(commands, value, 48, detailY, 9);
      detailY -= 14;
    });
  }

  if (data.notes) {
    const notes = wrapText(data.notes, 79).slice(0, 6);
    const notesY = paymentLines.length || paymentInstructions ? detailY - 12 : totalY - 84;
    text(commands, "NOTES", 48, notesY, 8, true);
    notes.forEach((value, index) => text(commands, value, 48, notesY - 18 - index * 14, 9));
  }

  line(commands, 48, 52, 547, 52);
  text(commands, `${data.currency} INVOICE - ${data.invoiceNumber}`, 48, 34, 8);

  const content = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`
  ];
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}
