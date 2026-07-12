import Image from "next/image";

import { formatCurrency } from "@/lib/formatters";

type InvoicePaperProps = {
  invoiceNumber: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  sender: {
    legalName: string;
    tradingName?: string | null;
    taxId?: string | null;
    address?: string | null;
    logoUrl?: string | null;
    invoiceColor?: string | null;
    paymentBeneficiary?: string | null;
    paymentBankName?: string | null;
    paymentAccountNumber?: string | null;
    paymentSortCode?: string | null;
    paymentIban?: string | null;
    paymentSwiftBic?: string | null;
    paymentPixKey?: string | null;
    paymentInstructions?: string | null;
  } | null;
  recipient: {
    name: string;
    email?: string | null;
    companyIdentifier?: string | null;
    taxId?: string | null;
    address?: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  totalCents: number;
  notes?: string | null;
};

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(date);
}

function Address({ children }: { children?: string | null }) {
  return children ? <p className="mt-2 break-words text-[10px] leading-4 text-slate-600">{children}</p> : null;
}

export function InvoicePaper({
  invoiceNumber,
  currency,
  issueDate,
  dueDate,
  sender,
  recipient,
  items,
  totalCents,
  notes
}: InvoicePaperProps) {
  const invoiceColor = sender?.invoiceColor || "#0b6281";
  const companyName = sender?.tradingName || sender?.legalName || "Your company";
  const isTwoLineCompanyName = companyName.length > 24;

  return (
    <article className="invoice-paper flex min-h-[842px] w-[595px] shrink-0 flex-col overflow-hidden border-t-[7px] bg-[#fffefd] text-slate-900 shadow-[0_24px_70px_rgba(0,0,0,0.28)]" style={{ borderTopColor: invoiceColor }}>
      <header className="flex items-start justify-between gap-6 px-8 pb-5 pt-6">
        <div className="min-w-0 max-w-[60%]">
          <div className="flex items-stretch gap-2 pt-4">
            {sender?.logoUrl ? (
              <div className={`relative shrink-0 overflow-hidden rounded-lg bg-slate-100 ${isTwoLineCompanyName ? "h-12 w-12" : "h-6 w-6"}`}>
                <Image alt="Company logo" className="object-contain" fill sizes={isTwoLineCompanyName ? "48px" : "24px"} src={sender.logoUrl} unoptimized />
              </div>
            ) : null}
            <h2 className="line-clamp-2 min-w-0 break-normal font-display text-xl font-semibold leading-tight text-slate-950">
              {companyName}
            </h2>
          </div>
          {sender?.tradingName && sender.tradingName !== sender.legalName ? (
            <p className="mt-2 break-normal text-[10px] text-slate-500">{sender.legalName}</p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: invoiceColor }}>Invoice</p>
          <p className="mt-1 font-display text-xl font-semibold text-slate-950">{invoiceNumber}</p>
          <div className="mt-3 space-y-1 text-[10px] text-slate-500">
            <p><span className="font-semibold text-slate-700">Issue date:</span> {formatDate(issueDate)}</p>
            <p><span className="font-semibold text-slate-700">Due date:</span> {formatDate(dueDate)}</p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 px-8 pb-5 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_3px_10px_rgba(15,23,42,0.07)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: invoiceColor }}>Bill from - seller</p>
          <p className="mt-2 break-words text-sm font-semibold text-slate-950">{sender?.legalName || "Your company"}</p>
          <Address>{sender?.address}</Address>
          {sender?.taxId ? <p className="mt-1 text-[10px] text-slate-600">Tax ID (CNPJ): {sender.taxId}</p> : null}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_3px_10px_rgba(15,23,42,0.07)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: invoiceColor }}>Bill to - buyer</p>
          <p className="mt-2 break-words text-sm font-semibold text-slate-950">{recipient.name || "Contractor name"}</p>
          <Address>{recipient.address}</Address>
          {recipient.email ? <p className="mt-1 break-all text-[10px] text-slate-600">{recipient.email}</p> : null}
          {recipient.companyIdentifier ? <p className="mt-1 text-[10px] text-slate-600">Company ID: {recipient.companyIdentifier}</p> : null}
          {recipient.taxId ? <p className="mt-1 text-[10px] text-slate-600">Tax ID: {recipient.taxId}</p> : null}
        </div>
      </section>

      <section className="px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_38px_92px_106px] gap-2 rounded-t-lg bg-[#dcecf2] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.09em] text-[#17445a]">
          <span>Description of services</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="overflow-hidden rounded-b-lg border border-t-0 border-slate-200">
          {items.map((item, index) => {
            const itemTotal = item.quantity * item.unitPriceCents;

            return (
              <div
                className="grid grid-cols-[minmax(0,1fr)_38px_92px_106px] gap-2 border-b border-slate-200 px-3 py-3 text-[10px] last:border-b-0"
                key={item.id}
              >
                <p className="break-words font-medium leading-4 text-slate-800">{item.description || `Service item ${index + 1}`}</p>
                <p className="text-right text-slate-600">{item.quantity || 1}</p>
                <p className="text-right text-slate-600">{formatCurrency(item.unitPriceCents, currency)}</p>
                <p className="text-right font-semibold text-slate-900">{formatCurrency(itemTotal, currency)}</p>
              </div>
            );
          })}
        </div>

        <div className="ml-auto mt-3 w-[225px] overflow-hidden rounded-lg border border-[#b9d4de]">
          <div className="flex items-center justify-between bg-[#f1f8fa] px-3 py-2 text-[10px] text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totalCents, currency)}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold text-white" style={{ backgroundColor: invoiceColor }}>
            <span>Total due</span>
            <span>{formatCurrency(totalCents, currency)}</span>
          </div>
        </div>
      </section>

      <section className="mx-8 mt-5 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_10px_rgba(15,23,42,0.05)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: invoiceColor }}>Payment instructions</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-600">
          Please include <span className="font-semibold text-slate-800">{invoiceNumber}</span> as your payment reference. Payment is due by {formatDate(dueDate)} in {currency}.
        </p>
        {sender?.paymentBeneficiary ? <p className="mt-2 text-[10px] text-slate-600"><span className="font-semibold text-slate-800">Beneficiary:</span> {sender.paymentBeneficiary}</p> : null}
        {sender?.paymentBankName ? <p className="mt-1 text-[10px] text-slate-600"><span className="font-semibold text-slate-800">Bank:</span> {sender.paymentBankName}</p> : null}
        {sender?.paymentAccountNumber ? <p className="mt-1 text-[10px] text-slate-600"><span className="font-semibold text-slate-800">Account:</span> {sender.paymentAccountNumber}</p> : null}
        {sender?.paymentSortCode ? <p className="mt-1 text-[10px] text-slate-600"><span className="font-semibold text-slate-800">Sort code:</span> {sender.paymentSortCode}</p> : null}
        {sender?.paymentIban ? <p className="mt-1 text-[10px] text-slate-600"><span className="font-semibold text-slate-800">IBAN:</span> {sender.paymentIban}</p> : null}
        {sender?.paymentSwiftBic ? <p className="mt-1 text-[10px] text-slate-600"><span className="font-semibold text-slate-800">SWIFT / BIC:</span> {sender.paymentSwiftBic}</p> : null}
        {sender?.paymentPixKey ? <p className="mt-1 text-[10px] text-slate-600"><span className="font-semibold text-slate-800">PIX:</span> {sender.paymentPixKey}</p> : null}
        {sender?.paymentInstructions ? <p className="mt-2 whitespace-pre-wrap text-[10px] leading-4 text-slate-600">{sender.paymentInstructions}</p> : null}
      </section>

      {notes ? (
        <section className="mx-8 mt-4 border-l-2 bg-[#f4fafb] px-3 py-2" style={{ borderLeftColor: invoiceColor }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: invoiceColor }}>Notes</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-[10px] leading-4 text-slate-600">{notes}</p>
        </section>
      ) : null}

      <footer className="mt-auto px-8 py-4 text-center text-[9px] text-slate-400">
        {sender?.tradingName || sender?.legalName || "Your company"} - {invoiceNumber}
      </footer>
    </article>
  );
}
