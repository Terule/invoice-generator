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

function text(
	commands: string[],
	value: string,
	x: number,
	y: number,
	size = 10,
	bold = false,
	align: "left" | "right" = "left",
	color = navy,
) {
	const width = value.length * size * (bold ? 0.56 : 0.5);
	const originX = align === "right" ? x - width : x;
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

export function createInvoicePdf(data: InvoicePdfData) {
	const commands: string[] = [];
	const companyName = asString(data.company.tradingName) || asString(data.company.legalName) || "Your company";
	const legalName = asString(data.company.legalName) || companyName;
	const companyAddress = addressFromSnapshot(data.company);
	const recipientAddress = addressFromSnapshot(data.contractor);
	const taxId = asString(data.company.taxId);
	const companyId = asString(data.contractor.companyIdentifier);
	const recipientTaxId = asString(data.contractor.taxId);
	const paymentLines = [
		["Beneficiary", asString(data.company.paymentBeneficiary)],
		["Bank", asString(data.company.paymentBankName)],
		["Account", asString(data.company.paymentAccountNumber)],
		["IBAN", asString(data.company.paymentIban)],
		["SWIFT / BIC", asString(data.company.paymentSwiftBic)],
		["PIX", asString(data.company.paymentPixKey)],
	].filter(([, value]) => value);
	const items = data.items.length
		? data.items
		: [{ description: "Service item", quantity: 1, unitPriceCents: data.totalCents }];

	fillRect(commands, 0, pageHeight - 7, pageWidth, 7, teal);

	fillRoundedRect(commands, 32, 777, 28, 28, 7, teal);
	text(commands, "T", 42, 786, 13, true, "left", "1 1 1");
	text(commands, "INTERNATIONAL SERVICES", 68, 787, 8, true, "left", teal);
	wrapText(companyName, 24)
		.slice(0, 2)
		.forEach((value, index) => {
			text(commands, value, 32, 746 - index * 24, 17, true);
		});

	text(commands, "INVOICE", 563, 793, 9, true, "right", teal);
	text(commands, data.invoiceNumber, 563, 764, 19, true, "right");
	text(commands, "Issue date:", 490, 734, 9, true, "right", slate);
	text(commands, formatDate(data.issueDate), 563, 734, 9, false, "right", slate);
	text(commands, "Due date:", 490, 716, 9, true, "right", slate);
	text(commands, formatDate(data.dueDate), 563, 716, 9, false, "right", slate);

	fillRoundedRect(commands, 32, 536, 254, 154, 8, "1 1 1");
	strokeRoundedRect(commands, 32, 536, 254, 154, 8);
	fillRoundedRect(commands, 309, 536, 254, 154, 8, "1 1 1");
	strokeRoundedRect(commands, 309, 536, 254, 154, 8);
	text(commands, "BILL FROM - SELLER", 48, 662, 8, true, "left", teal);
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
	text(commands, "BILL TO - BUYER", 325, 662, 8, true, "left", teal);
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
	fillRoundedRect(commands, tableLeft, tableTop - 29, tableRight - tableLeft, 29, 7, paleBlue);
	text(commands, "DESCRIPTION OF SERVICES", 44, tableTop - 18, 8, true, "left", "0.09 0.27 0.35");
	text(commands, "QTY", 337, tableTop - 18, 8, true, "right", "0.09 0.27 0.35");
	text(commands, "RATE", 438, tableTop - 18, 8, true, "right", "0.09 0.27 0.35");
	text(commands, "AMOUNT", 551, tableTop - 18, 8, true, "right", "0.09 0.27 0.35");

	let rowY = tableTop - 29;
	for (const item of items) {
		const description = wrapText(item.description || "Service item", 48).slice(0, 2);
		const rowHeight = Math.max(40, description.length * 13 + 20);
		rowY -= rowHeight;
		strokeRect(commands, tableLeft, rowY, tableRight - tableLeft, rowHeight);
		description.forEach((value, index) => {
			text(commands, value, 44, rowY + rowHeight - 22 - index * 13, 9, index === 0);
		});
		text(commands, String(item.quantity), 337, rowY + rowHeight - 22, 9, false, "right", slate);
		text(commands, formatMoney(item.unitPriceCents, data.currency), 438, rowY + rowHeight - 22, 9, false, "right", slate);
		text(commands, formatMoney(item.quantity * item.unitPriceCents, data.currency), 551, rowY + rowHeight - 22, 9, true, "right");
	}

	const totalLeft = 338;
	const totalBottom = rowY - 76;
	fillRoundedRect(commands, totalLeft, totalBottom, 225, 51, 7, totalBlue);
	strokeRoundedRect(commands, totalLeft, totalBottom, 225, 51, 7, "0.73 0.83 0.87");
	fillRect(commands, totalLeft, totalBottom, 225, 26, teal);
	text(commands, "Subtotal", totalLeft + 12, totalBottom + 35, 9, false, "left", slate);
	text(commands, formatMoney(data.totalCents, data.currency), 551, totalBottom + 35, 9, false, "right", slate);
	text(commands, "Total due", totalLeft + 12, totalBottom + 10, 10, true, "left", "1 1 1");
	text(commands, formatMoney(data.totalCents, data.currency), 551, totalBottom + 10, 10, true, "right", "1 1 1");

	const paymentTop = totalBottom - 22;
	const paymentBottom = Math.max(84, paymentTop - 122);
	fillRoundedRect(commands, 32, paymentBottom, 531, paymentTop - paymentBottom, 8, "1 1 1");
	strokeRoundedRect(commands, 32, paymentBottom, 531, paymentTop - paymentBottom, 8);
	text(commands, "PAYMENT INSTRUCTIONS", 48, paymentTop - 20, 8, true, "left", teal);
	text(commands, `Please include ${data.invoiceNumber} as your payment reference. Payment is due by ${formatDate(data.dueDate)} in ${data.currency}.`, 48, paymentTop - 39, 8.5, false, "left", slate);
	paymentLines.slice(0, 5).forEach(([label, value], index) => {
		text(commands, `${label}:`, 48, paymentTop - 61 - index * 14, 8.5, true, "left", slate);
		text(commands, value, 103, paymentTop - 61 - index * 14, 8.5, false, "left", slate);
	});
	if (data.notes) {
		const notesBottom = 34;
		const notesTop = Math.max(notesBottom + 42, paymentBottom - 12);
		fillRect(commands, 32, notesBottom, 531, notesTop - notesBottom, "0.957 0.98 0.984");
		fillRect(commands, 32, notesBottom, 3, notesTop - notesBottom, teal);
		text(commands, "NOTES", 48, notesTop - 14, 8, true, "left", teal);
		wrapText(data.notes, 91)
			.slice(0, 1)
			.forEach((value, index) => {
				text(commands, value, 48, notesTop - 29 - index * 12, 8, false, "left", slate);
			});
	}

	text(commands, `${companyName} - ${data.invoiceNumber}`, pageWidth / 2, 20, 8, false, "left", "0.48 0.58 0.7");

	const content = commands.join("\n");
	const objects = [
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
		`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
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
