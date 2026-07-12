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
const teal = "0.043 0.384 0.506";
const navy = "0.06 0.09 0.16";
const slate = "0.28 0.36 0.48";
const border = "0.88 0.91 0.94";
const paleBlue = "0.86 0.93 0.95";
const totalBlue = "0.945 0.973 0.98";

function asString(value: unknown) {
	return typeof value === "string" ? value : "";
}

function pdfColorFromHex(value: string) {
	if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
		return teal;
	}

	const red = Number.parseInt(value.slice(1, 3), 16) / 255;
	const green = Number.parseInt(value.slice(3, 5), 16) / 255;
	const blue = Number.parseInt(value.slice(5, 7), 16) / 255;

	return `${red.toFixed(3)} ${green.toFixed(3)} ${blue.toFixed(3)}`;
}

function escapePdfText(value: string) {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/\(/g, "\\(")
		.replace(/\)/g, "\\)")
		.replace(/[^\x20-\xFF]/g, "?");
}

function formatMoney(cents: number, currency: string) {
	const symbol =
		currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
	const amount = (cents / 100).toLocaleString("en-GB", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	return `${symbol}${amount}`;
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

function wrapText(value: string, maxCharacters: number) {
	const words = value.trim().split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let line = "";

	for (const word of words) {
		if (word.length > maxCharacters) {
			if (line) {
				lines.push(line);
				line = "";
			}

			for (let start = 0; start < word.length; start += maxCharacters) {
				const segment = word.slice(start, start + maxCharacters);
				if (segment.length === maxCharacters) {
					lines.push(segment);
				} else {
					line = segment;
				}
			}

			continue;
		}

		const nextLine = line ? `${line} ${word}` : word;

		if (nextLine.length <= maxCharacters) {
			line = nextLine;
			continue;
		}

		if (line) {
			lines.push(line);
		}

		line = word;
	}

	if (line) {
		lines.push(line);
	}

	return lines.length ? lines : [""];
}

function wrapTextPreservingLineBreaks(value: string, maxCharacters: number) {
	return value.split(/\r?\n/).flatMap((paragraph) => {
		return paragraph.trim() ? wrapText(paragraph, maxCharacters) : [""];
	});
}

function text(
	commands: string[],
	value: string,
	x: number,
	y: number,
	size = 10,
	bold = false,
	align: "left" | "center" | "right" = "left",
	color = navy,
) {
	const width = value.length * size * (bold ? 0.56 : 0.5);
	const originX = align === "right" ? x - width : align === "center" ? x - width / 2 : x;
	commands.push(
		`${color} rg BT /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${originX.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(value)}) Tj ET`,
	);
}

function fillRect(commands: string[], x: number, y: number, width: number, height: number, color: string) {
	commands.push(`${color} rg ${x} ${y} ${width} ${height} re f`);
}

function strokeRect(commands: string[], x: number, y: number, width: number, height: number, color = border) {
	commands.push(`${color} RG 0.8 w ${x} ${y} ${width} ${height} re S`);
}

function roundedRectPath(commands: string[], x: number, y: number, width: number, height: number, radius: number) {
	const corner = radius * 0.55228475;
	commands.push(
		`${x + radius} ${y} m ${x + width - radius} ${y} l ${x + width - radius + corner} ${y} ${x + width} ${y + radius - corner} ${x + width} ${y + radius} c ${x + width} ${y + height - radius} l ${x + width} ${y + height - radius + corner} ${x + width - radius + corner} ${y + height} ${x + width - radius} ${y + height} c ${x + radius} ${y + height} l ${x + radius - corner} ${y + height} ${x} ${y + height - radius + corner} ${x} ${y + height - radius} c ${x} ${y + radius} l ${x} ${y + radius - corner} ${x + radius - corner} ${y} ${x + radius} ${y} c h`,
	);
}

function fillRoundedRect(commands: string[], x: number, y: number, width: number, height: number, radius: number, color: string) {
	roundedRectPath(commands, x, y, width, height, radius);
	commands.push(`${color} rg f`);
}

function strokeRoundedRect(commands: string[], x: number, y: number, width: number, height: number, radius: number, color = border) {
	roundedRectPath(commands, x, y, width, height, radius);
	commands.push(`${color} RG 0.8 w S`);
}

function roundedTopRectPath(commands: string[], x: number, y: number, width: number, height: number, radius: number) {
	const corner = radius * 0.55228475;
	commands.push(
		`${x} ${y} m ${x + width} ${y} l ${x + width} ${y + height - radius} l ${x + width} ${y + height - radius + corner} ${x + width - radius + corner} ${y + height} ${x + width - radius} ${y + height} c ${x + radius} ${y + height} l ${x + radius - corner} ${y + height} ${x} ${y + height - radius + corner} ${x} ${y + height - radius} c h`,
	);
}

function fillRoundedTopRect(commands: string[], x: number, y: number, width: number, height: number, radius: number, color: string) {
	roundedTopRectPath(commands, x, y, width, height, radius);
	commands.push(`${color} rg f`);
}

function roundedBottomRectPath(commands: string[], x: number, y: number, width: number, height: number, radius: number) {
	const corner = radius * 0.55228475;
	commands.push(
		`${x} ${y + height} m ${x + width} ${y + height} l ${x + width} ${y + radius} l ${x + width} ${y + radius - corner} ${x + width - radius + corner} ${y} ${x + width - radius} ${y} c ${x + radius} ${y} l ${x + radius - corner} ${y} ${x} ${y + radius - corner} ${x} ${y + radius} c h`,
	);
}

function fillRoundedBottomRect(commands: string[], x: number, y: number, width: number, height: number, radius: number, color: string) {
	roundedBottomRectPath(commands, x, y, width, height, radius);
	commands.push(`${color} rg f`);
}

function strokeRoundedBottomRect(commands: string[], x: number, y: number, width: number, height: number, radius: number, color = border) {
	roundedBottomRectPath(commands, x, y, width, height, radius);
	commands.push(`${color} RG 0.8 w S`);
}

function addressFromSnapshot(snapshot: Record<string, unknown>) {
	return [
		asString(snapshot.street),
		asString(snapshot.number),
		asString(snapshot.neighborhood),
		asString(snapshot.city),
		asString(snapshot.state),
		asString(snapshot.cep),
		asString(snapshot.country),
	]
		.filter(Boolean)
		.join(", ");
}

async function loadCompanyLogo(company: Record<string, unknown>) {
	const logoPath = asString(company.logoPath);

	if (!logoPath) {
		return null;
	}

	try {
		const response = await fetchSeaweedFs(logoPath, { cache: "no-store" });

		if (!response.ok) {
			return null;
		}

		const logo = await sharp(Buffer.from(await response.arrayBuffer()))
			.flatten({ background: "#ffffff" })
			.resize(96, 96, { fit: "inside", withoutEnlargement: true })
			.jpeg({ quality: 90 })
			.toBuffer({ resolveWithObject: true });

		return { data: logo.data, height: logo.info.height, width: logo.info.width };
	} catch {
		return null;
	}
}

export async function createInvoicePdf(data: InvoicePdfData) {
	const commands: string[] = [];
	const companyName = asString(data.company.tradingName) || asString(data.company.legalName) || "Your company";
	const companyNameLines = wrapText(companyName, 24).slice(0, 2);
	const legalName = asString(data.company.legalName) || companyName;
	const companyAddress = addressFromSnapshot(data.company);
	const recipientAddress = addressFromSnapshot(data.contractor);
	const taxId = asString(data.company.taxId);
	const companyId = asString(data.contractor.companyIdentifier);
	const recipientTaxId = asString(data.contractor.taxId);
	const accent = pdfColorFromHex(asString(data.company.invoiceColor));
	const paymentLines = [
		["Beneficiary", asString(data.company.paymentBeneficiary)],
		["Bank", asString(data.company.paymentBankName)],
		["Account", asString(data.company.paymentAccountNumber)],
		["Sort code", asString(data.company.paymentSortCode)],
		["IBAN", asString(data.company.paymentIban)],
		["SWIFT / BIC", asString(data.company.paymentSwiftBic)],
		["PIX", asString(data.company.paymentPixKey)],
	].filter(([, value]) => value);
	const items = data.items.length
		? data.items
		: [{ description: "Service item", quantity: 1, unitPriceCents: data.totalCents }];
	const logo = await loadCompanyLogo(data.company);
	const logoSize = companyNameLines.length > 1 ? 44 : 20;
	const companyNameX = logo ? 32 + logoSize + 10 : 32;

	fillRect(commands, 0, pageHeight - 7, pageWidth, 7, accent);

	if (logo) {
		commands.push(`q ${logoSize} 0 0 ${logoSize} 32 ${companyNameLines.length > 1 ? 728 : 748} cm /Logo Do Q`);
	}

	companyNameLines.forEach((value, index) => {
			text(commands, value, companyNameX, 764 - index * 24, 17, true);
		});

	text(commands, "INVOICE", 563, 793, 9, true, "right", accent);
	text(commands, data.invoiceNumber, 563, 764, 19, true, "right");
	text(commands, "Issue date:", 490, 734, 9, true, "right", slate);
	text(commands, formatDate(data.issueDate), 563, 734, 9, false, "right", slate);
	text(commands, "Due date:", 490, 716, 9, true, "right", slate);
	text(commands, formatDate(data.dueDate), 563, 716, 9, false, "right", slate);

	fillRoundedRect(commands, 32, 536, 254, 154, 8, "1 1 1");
	strokeRoundedRect(commands, 32, 536, 254, 154, 8);
	fillRoundedRect(commands, 309, 536, 254, 154, 8, "1 1 1");
	strokeRoundedRect(commands, 309, 536, 254, 154, 8);
	text(commands, "BILL FROM - SELLER", 48, 662, 8, true, "left", accent);
	wrapText(legalName, 29)
		.slice(0, 2)
		.forEach((value, index) => {
			text(commands, value, 48, 636 - index * 17, 12, true);
		});
	wrapText(companyAddress, 42)
		.slice(0, 3)
		.forEach((value, index) => {
			text(commands, value, 48, 591 - index * 13, 9, false, "left", slate);
		});
	if (taxId) {
		text(commands, `Tax ID (CNPJ): ${taxId}`, 48, 549, 9, false, "left", slate);
	}
	text(commands, "BILL TO - BUYER", 325, 662, 8, true, "left", accent);
	wrapText(data.clientName || "Contractor name", 29)
		.slice(0, 2)
		.forEach((value, index) => {
			text(commands, value, 325, 636 - index * 17, 12, true);
		});
	wrapText(recipientAddress, 42)
		.slice(0, 2)
		.forEach((value, index) => {
			text(commands, value, 325, 591 - index * 13, 9, false, "left", slate);
		});
	if (data.clientEmail) {
		text(commands, data.clientEmail, 325, 562, 9, false, "left", slate);
	}
	if (companyId) {
		text(commands, `Company ID: ${companyId}`, 325, 549, 9, false, "left", slate);
	} else if (recipientTaxId) {
		text(commands, `Tax ID: ${recipientTaxId}`, 325, 549, 9, false, "left", slate);
	}

	const tableLeft = 32;
	const tableRight = 563;
	const tableTop = 516;
	fillRoundedTopRect(commands, tableLeft, tableTop - 29, tableRight - tableLeft, 29, 7, paleBlue);
	text(commands, "DESCRIPTION OF SERVICES", 44, tableTop - 18, 8, true, "left", "0.09 0.27 0.35");
	text(commands, "QTY", 319, tableTop - 18, 8, true, "center", "0.09 0.27 0.35");
	text(commands, "RATE", 392, tableTop - 18, 8, true, "center", "0.09 0.27 0.35");
	text(commands, "AMOUNT", 498, tableTop - 18, 8, true, "center", "0.09 0.27 0.35");

	let rowY = tableTop - 29;
	items.forEach((item, index) => {
		const description = wrapText(item.description || "Service item", 48);
		const rowHeight = Math.max(40, description.length * 13 + 20);
		rowY -= rowHeight;
		if (index === items.length - 1) {
			strokeRoundedBottomRect(commands, tableLeft, rowY, tableRight - tableLeft, rowHeight, 7);
		} else {
			strokeRect(commands, tableLeft, rowY, tableRight - tableLeft, rowHeight);
		}
		description.forEach((value, index) => {
			text(commands, value, 44, rowY + rowHeight - 22 - index * 13, 9, index === 0);
		});
		text(commands, String(item.quantity), 319, rowY + rowHeight - 22, 9, false, "center", slate);
		text(commands, formatMoney(item.unitPriceCents, data.currency), 392, rowY + rowHeight - 22, 9, false, "center", slate);
		text(commands, formatMoney(item.quantity * item.unitPriceCents, data.currency), 498, rowY + rowHeight - 22, 9, true, "center");
	});

	const totalLeft = 338;
	const totalBottom = rowY - 76;
	fillRoundedRect(commands, totalLeft, totalBottom, 225, 51, 7, totalBlue);
	strokeRoundedRect(commands, totalLeft, totalBottom, 225, 51, 7, "0.73 0.83 0.87");
	fillRoundedBottomRect(commands, totalLeft, totalBottom, 225, 26, 7, accent);
	text(commands, "Subtotal", totalLeft + 12, totalBottom + 35, 9, false, "left", slate);
	text(commands, formatMoney(data.totalCents, data.currency), 551, totalBottom + 35, 9, false, "right", slate);
	text(commands, "Total due", totalLeft + 12, totalBottom + 10, 10, true, "left", "1 1 1");
	text(commands, formatMoney(data.totalCents, data.currency), 551, totalBottom + 10, 10, true, "right", "1 1 1");

	const paymentTop = totalBottom - 22;
	const paymentBottom = Math.max(84, paymentTop - 122);
	fillRoundedRect(commands, 32, paymentBottom, 531, paymentTop - paymentBottom, 8, "1 1 1");
	strokeRoundedRect(commands, 32, paymentBottom, 531, paymentTop - paymentBottom, 8);
	text(commands, "PAYMENT INSTRUCTIONS", 48, paymentTop - 20, 8, true, "left", accent);
	text(commands, `Please include ${data.invoiceNumber} as your payment reference. Payment is due by ${formatDate(data.dueDate)} in ${data.currency}.`, 48, paymentTop - 39, 8.5, false, "left", slate);
	paymentLines.slice(0, 5).forEach(([label, value], index) => {
		text(commands, `${label}:`, 48, paymentTop - 61 - index * 14, 8.5, true, "left", slate);
		text(commands, value, 103, paymentTop - 61 - index * 14, 8.5, false, "left", slate);
	});
	if (data.notes) {
		const noteLines = wrapTextPreservingLineBreaks(data.notes, 91);
		const notesHeight = 30 + noteLines.length * 12;
		const notesTop = paymentBottom - 14;
		const notesBottom = notesTop - notesHeight;
		fillRect(commands, 32, notesBottom, 531, notesTop - notesBottom, "0.957 0.98 0.984");
		fillRect(commands, 32, notesBottom, 3, notesTop - notesBottom, accent);
		text(commands, "NOTES", 48, notesTop - 14, 8, true, "left", accent);
		noteLines.forEach((value, index) => {
			text(commands, value, 48, notesTop - 29 - index * 12, 8, false, "left", slate);
		});
	}

	text(commands, `${companyName} - ${data.invoiceNumber}`, pageWidth / 2, 20, 8, false, "center", "0.48 0.58 0.7");

	const content = commands.join("\n");
	const logoObject = logo
		? `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.data.length} >>\nstream\n${logo.data.toString("latin1")}\nendstream`
		: null;
	const objects = [
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>${logo ? " /XObject << /Logo 7 0 R >>" : ""} >> /Contents 6 0 R >>`,
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
		`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
		...(logoObject ? [logoObject] : []),
	];
	let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
	const offsets = [0];

	objects.forEach((object, index) => {
		offsets.push(Buffer.byteLength(pdf, "latin1"));
		pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
	});

	const xrefOffset = Buffer.byteLength(pdf, "latin1");
	pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	pdf += offsets
		.slice(1)
		.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
		.join("");
	pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

	return Buffer.from(pdf, "latin1");
}

import sharp from "sharp";

import { fetchSeaweedFs } from "@/lib/seaweedfs";
