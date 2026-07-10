"use client";

import { CalendarDays, Download, FileText } from "lucide-react";

import { SectionHeader } from "@/components/shared/section-header";
import { useDashboardData } from "@/components/shell/dashboard-shell";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

export function InvoicesPageContent() {
  const { bootstrap } = useDashboardData();

  return (
    <Card className="animate-fade-in-up">
      <div className="mb-6">
        <SectionHeader
          description="Issued records stay immutable even if company or contractor data changes later."
          icon={FileText}
          title="Invoices"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {bootstrap.invoices.length ? (
          bootstrap.invoices.map((invoice) => (
            <article className="rounded-2xl border border-border bg-secondary/55 p-4" key={invoice.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {invoice.invoiceNumber}
                  </p>
                  <h3 className="mt-1 truncate text-base font-semibold">{invoice.clientName}</h3>
                  <p className="truncate text-sm text-foreground/60">{invoice.clientEmail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold">{formatCurrency(invoice.totalCents, invoice.currency)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-foreground/50">{invoice.status}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <p className="inline-flex items-center gap-1.5 text-xs text-foreground/55">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Due {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(invoice.dueDate))}
                </p>
                <a
                  aria-label={`Download ${invoice.invoiceNumber}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/78 transition hover:bg-card hover:text-foreground"
                  href={`/api/invoices/${invoice.id}/pdf`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm text-foreground/68">No invoices yet.</p>
        )}
      </div>
    </Card>
  );
}
