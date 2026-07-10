"use client";

import { Download, FileText } from "lucide-react";

import { useDashboardData } from "@/components/shell/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
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

      <div className="space-y-3">
        {bootstrap.invoices.length ? (
          bootstrap.invoices.map((invoice) => (
            <div className="rounded-3xl border border-border bg-secondary/70 p-4" key={invoice.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/58">{invoice.invoiceNumber}</p>
                  <h3 className="text-lg font-semibold">{invoice.clientName}</h3>
                  <p className="text-sm text-foreground/65">{invoice.clientEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground/58">{invoice.status}</p>
                  <p className="mt-1 text-xl font-semibold">{formatCurrency(invoice.totalCents, invoice.currency)}</p>
                </div>
              </div>
              <a
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground/78 transition hover:bg-card hover:text-foreground"
                href={`/api/invoices/${invoice.id}/pdf`}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </div>
          ))
        ) : (
          <p className="text-sm text-foreground/68">No invoices yet.</p>
        )}
      </div>
    </Card>
  );
}
