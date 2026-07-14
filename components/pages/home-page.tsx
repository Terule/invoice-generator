"use client";

import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  Plus,
  Search,
  Trash2,
  UserCircle2
} from "lucide-react";
import { type ComponentProps, useState } from "react";

import { InvoicePaper } from "@/components/invoices/invoice-paper";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoiceBuilder } from "@/hooks/use-invoice-builder";
import type { InvoiceForm } from "@/lib/dashboard";
import {
  currencyOptions,
  formatCentsInput,
  formatCnpj,
  getCompanyIdentifier,
  getCurrencyOption,
  getNextInvoiceNumber,
  normalizeCentsInput
} from "@/lib/dashboard";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

export function HomePageContent() {
  const {
    bootstrap,
    form,
    setForm,
    totalCents,
    activeContractors,
    selectedContractor,
    createdInvoice,
    addLineItem,
    removeLineItem,
    updateLineItem,
    dismissCreatedInvoice,
    createInvoiceMutation
  } =
    useInvoiceBuilder();
  const [submitError, setSubmitError] = useState("");
  const selectedCurrency = getCurrencyOption(form.currency);
  const previewInvoiceNumber = getNextInvoiceNumber({
    invoiceCount: bootstrap.invoices.length,
    prefix: getCompanyIdentifier(undefined, undefined, bootstrap.companyProfile?.legalName)
  });
  const savedContractor = form.contractorMode === "saved" ? selectedContractor : null;
  const companyAddress = bootstrap.companyProfile
    ? [
        bootstrap.companyProfile.street,
        bootstrap.companyProfile.number,
        bootstrap.companyProfile.neighborhood,
        bootstrap.companyProfile.city,
        bootstrap.companyProfile.state,
        bootstrap.companyProfile.cep,
        bootstrap.companyProfile.country
      ]
        .filter(Boolean)
        .join(", ")
    : null;
  const contractorAddress = savedContractor
    ? [
        savedContractor.street,
        savedContractor.number,
        savedContractor.neighborhood,
        savedContractor.city,
        savedContractor.state,
        savedContractor.cep,
        savedContractor.country
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  async function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    setSubmitError("");

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    try {
      await createInvoiceMutation.mutateAsync({
        contractorId:
          form.contractorMode === "saved" && form.contractorId ? form.contractorId : undefined,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        currency: form.currency,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        notes: form.notes || undefined,
        items: form.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPriceCents: Number(item.unitPriceCents)
        }))
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create invoice.");
    }
  }

  return (
    <section className="grid items-stretch gap-6 xl:grid-cols-[1.2fr_1fr]">
      <Card className="animate-fade-in-up h-[calc(100svh-12rem)] min-h-115 overflow-auto xl:sticky xl:top-4">
        <div className="mb-6">
          <SectionHeader
            description="Fill the form and watch the preview update live."
            icon={FileText}
            title="New invoice"
          />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Source</Label>
              <select
                className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground"
                value={form.contractorMode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contractorMode: event.target.value as InvoiceForm["contractorMode"]
                  }))
                }
              >
                <option value="saved">Saved</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            {form.contractorMode === "saved" ? (
              <div className="space-y-2">
                <Label>Contractor</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                  <select
                    className="w-full rounded-2xl border border-border bg-secondary py-3 pl-11 pr-4 text-sm text-foreground"
                    required
                    value={form.contractorId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contractorId: event.target.value }))
                    }
                  >
                    <option value="">Choose</option>
                    {activeContractors.map((contractor) => (
                      <option key={contractor.id} value={contractor.id}>
                        {contractor.legalName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Client</Label>
              <div className="relative">
                <UserCircle2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                <Input required className="pl-11" value={form.clientName} onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                <Input required className="pl-11" type="email" value={form.clientEmail} onChange={(event) => setForm((current) => ({ ...current, clientEmail: event.target.value }))} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Currency</Label>
              <select
                className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground"
                required
                value={form.currency}
                onChange={(event) =>
                  setForm((current) => ({ ...current, currency: event.target.value }))
                }
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.symbol} {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Issue</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                <Input required className="pl-11" type="date" value={form.issueDate} onChange={(event) => setForm((current) => ({ ...current, issueDate: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                <Input required className="pl-11" type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </div>
            </div>
          </div>

          <fieldset className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <legend className="text-sm font-medium text-foreground">Line items</legend>
              <Button className="gap-2 px-3 py-1.5" onClick={addLineItem} type="button" variant="outline">
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </div>

            {form.items.map((item, index) => (
              <div className="grid gap-3 rounded-2xl border border-border bg-secondary/35 p-3 md:grid-cols-[minmax(0,1fr)_92px_150px_40px] md:items-end" key={item.id}>
                <div className="space-y-2">
                  <Label htmlFor={`${item.id}-description`}>{index === 0 ? "Description" : `Description ${index + 1}`}</Label>
                  <Input
                    id={`${item.id}-description`}
                    required
                    value={item.description}
                    onChange={(event) => updateLineItem(item.id, "description", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${item.id}-quantity`}>Qty</Label>
                  <Input
                    id={`${item.id}-quantity`}
                    min="1"
                    required
                    type="number"
                    value={item.quantity}
                    onChange={(event) => updateLineItem(item.id, "quantity", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${item.id}-rate`}>Rate</Label>
                  <Input
                    id={`${item.id}-rate`}
                    required
                    inputMode="decimal"
                    value={formatCentsInput(item.unitPriceCents)}
                    onChange={(event) =>
                      updateLineItem(item.id, "unitPriceCents", normalizeCentsInput(event.target.value))
                    }
                    onFocus={(event) => event.currentTarget.select()}
                  />
                </div>
                <Button
                  aria-label={`Remove item ${index + 1}`}
                  className="h-11 w-11 px-0"
                  disabled={form.items.length === 1}
                  onClick={() => removeLineItem(item.id)}
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </fieldset>

          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/35 focus:border-accent"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            />
          </div>

          <Button className="w-full" disabled={createInvoiceMutation.isPending} type="submit">
            {createInvoiceMutation.isPending ? "Saving..." : "Create invoice"}
          </Button>

          {submitError ? <p className="text-sm text-rose-300" role="alert">{submitError}</p> : null}

        </form>
      </Card>

      <Card className="animate-fade-in-up stagger-1 h-[calc(100svh-12rem)] min-h-115 overflow-hidden p-3 sm:p-4 xl:sticky xl:top-4">
        <div className="flex h-full overflow-auto rounded-3xl border border-white/10 bg-slate-950/35 p-2 sm:justify-center sm:p-4">
          <InvoicePaper
            currency={selectedCurrency.value}
            dueDate={form.dueDate}
            invoiceNumber={previewInvoiceNumber}
            issueDate={form.issueDate}
            items={form.items.map((item) => ({
              id: item.id,
              description: item.description,
              quantity: Number(item.quantity || 1),
              unitPriceCents: Number(item.unitPriceCents || 0)
            }))}
            notes={form.notes}
            recipient={{
              name: form.clientName,
              email: form.clientEmail,
              companyIdentifier: savedContractor?.companyIdentifier,
              taxId: savedContractor?.taxId,
              address: contractorAddress
            }}
            sender={
              bootstrap.companyProfile
                ? {
                    legalName: bootstrap.companyProfile.legalName,
                    tradingName: bootstrap.companyProfile.tradingName,
                    taxId: formatCnpj(bootstrap.companyProfile.taxId),
                    address: companyAddress,
                    logoUrl: bootstrap.companyProfile.logoPath ? `/api/company-profile/logo?v=${encodeURIComponent(bootstrap.companyProfile.logoPath)}` : null,
                    invoiceColor: bootstrap.companyProfile.invoiceColor,
                    paymentBeneficiary: bootstrap.companyProfile.paymentBeneficiary,
                    paymentBankName: bootstrap.companyProfile.paymentBankName,
                    paymentAccountNumber: bootstrap.companyProfile.paymentAccountNumber,
                    paymentSortCode: bootstrap.companyProfile.paymentSortCode,
                    paymentIban: bootstrap.companyProfile.paymentIban,
                    paymentSwiftBic: bootstrap.companyProfile.paymentSwiftBic,
                    paymentPixKey: bootstrap.companyProfile.paymentPixKey,
                    paymentInstructions: bootstrap.companyProfile.paymentInstructions
                  }
                : null
            }
            totalCents={totalCents}
          />
        </div>
      </Card>

      {createdInvoice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <Card className="animate-fade-in w-full max-w-md border-white/10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold">Invoice created</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/68">
              {createdInvoice.invoiceNumber} is ready to download and has been saved to your invoices.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-90"
                href={`/api/invoices/${createdInvoice.id}/pdf`}
              >
                <Download className="h-4 w-4" />
                Download invoice
              </a>
              <Button onClick={dismissCreatedInvoice} type="button" variant="outline">
                Close
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
