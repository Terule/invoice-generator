"use client";

import { CalendarDays, Download, FileText, Grid3X3, List } from "lucide-react";
import { useEffect, useState } from "react";

import { SectionHeader } from "@/components/shared/section-header";
import { useDashboardData } from "@/components/shell/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

export function InvoicesPageContent() {
  const { bootstrap } = useDashboardData();
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setView("list");
    }
  }, []);

  return (
    <Card className="animate-fade-in-up">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <SectionHeader
          description="Issued records stay immutable even if company or contractor data changes later."
          icon={FileText}
          title="Invoices"
        />
        <div className="flex rounded-full border border-border bg-secondary/60 p-1">
          <Button
            aria-label="Show invoice cards"
            className={`h-8 w-8 px-0 ${view === "grid" ? "bg-card text-foreground" : "text-foreground/55"}`}
            onClick={() => setView("grid")}
            type="button"
            variant="ghost"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Show invoice list"
            className={`h-8 w-8 px-0 ${view === "list" ? "bg-card text-foreground" : "text-foreground/55"}`}
            onClick={() => setView("list")}
            type="button"
            variant="ghost"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={view === "grid" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "space-y-2"}>
        {bootstrap.invoices.length ? (
          bootstrap.invoices.map((invoice) => (
            view === "grid" ? (
              <article className="rounded-2xl border border-border bg-secondary/55 p-3.5" key={invoice.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      {invoice.invoiceNumber}
                    </p>
                    <h3 className="mt-1 truncate text-base font-semibold">{invoice.clientName}</h3>
                    <p className="truncate text-sm text-foreground/60">{invoice.clientEmail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-semibold">{formatCurrency(invoice.totalCents, invoice.currency)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-foreground/50">{invoice.status}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <p className="inline-flex items-center gap-1.5 text-xs text-foreground/55">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Due {formatDueDate(invoice.dueDate)}
                  </p>
                  <DownloadLink invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
                </div>
              </article>
            ) : (
              <article className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/55 px-3 py-3" key={invoice.id}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{invoice.invoiceNumber}</p>
                    <h3 className="truncate text-sm font-semibold">{invoice.clientName}</h3>
                  </div>
                  <p className="mt-1 text-xs text-foreground/55">Due {formatDueDate(invoice.dueDate)} · {invoice.status}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatCurrency(invoice.totalCents, invoice.currency)}</p>
                <DownloadLink invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
              </article>
            )
          ))
        ) : (
          <p className="text-sm text-foreground/68">No invoices yet.</p>
        )}
      </div>
    </Card>
  );
}

function DownloadLink({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  return (
    <a
      aria-label={`Download ${invoiceNumber}`}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/78 transition hover:bg-card hover:text-foreground"
      href={`/api/invoices/${invoiceId}/pdf`}
    >
      <Download className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Download</span>
    </a>
  );
}
