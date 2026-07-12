"use client";

import { CalendarDays, Download, FileText, Grid3X3, List, Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { SectionHeader } from "@/components/shared/section-header";
import { useDashboardData } from "@/components/shell/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";

type EditableInvoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  notes: string | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
  }>;
};

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
  const [editingInvoice, setEditingInvoice] = useState<EditableInvoice | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setView("list");
    }
  }, []);

  async function handleEdit(invoiceId: string) {
    setActionError("");
    const response = await fetch(`/api/invoices/${invoiceId}`);

    if (!response.ok) {
      setActionError("Unable to load this invoice for editing.");
      return;
    }

    setEditingInvoice(await response.json());
  }

  async function handleDelete(invoiceId: string, invoiceNumber: string) {
    if (!window.confirm(`Delete ${invoiceNumber}? This cannot be undone.`)) {
      return;
    }

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
                  <InvoiceActions invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} onDelete={handleDelete} onEdit={handleEdit} />
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
                <InvoiceActions invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} onDelete={handleDelete} onEdit={handleEdit} />
              </article>
            )
          ))
        ) : (
          <p className="text-sm text-foreground/68">No invoices yet.</p>
        )}
      </div>
      {actionError ? <p className="mt-4 text-sm text-rose-300" role="alert">{actionError}</p> : null}
      {editingInvoice ? <InvoiceEditModal invoice={editingInvoice} onClose={() => setEditingInvoice(null)} onSaved={async () => { await refresh(); setEditingInvoice(null); }} /> : null}
    </Card>
  );
}

function InvoiceActions({ invoiceId, invoiceNumber, onEdit, onDelete }: { invoiceId: string; invoiceNumber: string; onEdit: (invoiceId: string) => void; onDelete: (invoiceId: string, invoiceNumber: string) => void }) {
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
      <Button
        aria-label={`Edit ${invoiceNumber}`}
        className="h-8 w-8 px-0 text-foreground/78"
        onClick={() => onEdit(invoiceId)}
        title="Edit invoice"
        type="button"
        variant="ghost"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        aria-label={`Delete ${invoiceNumber}`}
        className="h-8 w-8 px-0 text-rose-300 hover:text-rose-200"
        onClick={() => onDelete(invoiceId, invoiceNumber)}
        title="Delete invoice"
        type="button"
        variant="ghost"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function InvoiceEditModal({ invoice, onClose, onSaved }: { invoice: EditableInvoice; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState(() => ({
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    currency: invoice.currency,
    issueDate: invoice.issueDate.slice(0, 10),
    dueDate: invoice.dueDate.slice(0, 10),
    notes: invoice.notes ?? "",
    items: invoice.items
  }));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateItem(index: number, field: "description" | "quantity" | "unitPriceCents", value: string) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === "description" ? value : Number(value) } : item)
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "Unable to save invoice changes.");
      }

      await onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save invoice changes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-2xl">
        <Card className="animate-fade-in border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{invoice.invoiceNumber}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">Edit invoice</h2>
            </div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Client"><Input required value={form.clientName} onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))} /></Field>
              <Field label="Email"><Input required type="email" value={form.clientEmail} onChange={(event) => setForm((current) => ({ ...current, clientEmail: event.target.value }))} /></Field>
              <Field label="Issue date"><Input required type="date" value={form.issueDate} onChange={(event) => setForm((current) => ({ ...current, issueDate: event.target.value }))} /></Field>
              <Field label="Due date"><Input required type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} /></Field>
            </div>
            <div className="space-y-3">
              <Label>Line items</Label>
              {form.items.map((item, index) => (
                <div className="grid gap-3 rounded-2xl border border-border bg-secondary/45 p-3 sm:grid-cols-[minmax(0,1fr)_72px_120px]" key={item.id}>
                  <Input required value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} />
                  <Input min="1" required type="number" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
                  <Input min="1" required type="number" value={item.unitPriceCents} onChange={(event) => updateItem(index, "unitPriceCents", event.target.value)} />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea className="min-h-24 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save changes"}</Button>
              <Button disabled={isSaving} onClick={onClose} type="button" variant="ghost">Cancel</Button>
            </div>
            {error ? <p className="text-sm text-rose-300" role="alert">{error}</p> : null}
          </form>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
