"use client";

import { CalendarDays, Download, FileText, Grid3X3, List, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { SectionHeader } from "@/components/shared/section-header";
import { useDashboardData } from "@/components/shell/dashboard-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const { bootstrap, refresh } = useDashboardData();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setView("list");
    }
  }, []);

  async function handleDelete(invoiceId: string) {
    setActionError("");
    const response = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      setActionError(error?.message || "Unable to delete this invoice.");
      return;
    }

    await refresh();
  }

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
                  <InvoiceActions invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} onDelete={handleDelete} />
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
                <InvoiceActions invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} onDelete={handleDelete} />
              </article>
            )
          ))
        ) : (
          <p className="text-sm text-foreground/68">No invoices yet.</p>
        )}
      </div>
      {actionError ? <p className="mt-4 text-sm text-rose-300" role="alert">{actionError}</p> : null}
    </Card>
  );
}

function InvoiceActions({
  invoiceId,
  invoiceNumber,
  onDelete,
}: {
  invoiceId: string;
  invoiceNumber: string;
  onDelete: (invoiceId: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <a
        aria-label={`Download ${invoiceNumber}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground/78 transition hover:bg-card hover:text-foreground"
        href={`/api/invoices/${invoiceId}/pdf`}
        title="Download invoice"
      >
        <Download className="h-3.5 w-3.5" />
      </a>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            aria-label={`Delete ${invoiceNumber}`}
            className="h-8 w-8 px-0 text-rose-300 hover:text-rose-200"
            title="Delete invoice"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice {invoiceNumber}?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-foreground/70">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => onDelete(invoiceId)} type="button" variant="destructive">
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
