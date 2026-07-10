"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail, Search, UserRoundSearch, Users } from "lucide-react";
import { FormEvent, useState } from "react";

import { useDashboardData } from "@/components/shell/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  currencyOptions,
  createContractor,
  initialContractorForm,
  lookupCep,
  normalizeCompanyIdentifier,
  type Contractor,
  type ContractorDraft,
  updateContractor
} from "@/lib/dashboard";
import type { ContractorInput } from "@/lib/validations";

export function ContractorsPageContent() {
  const { bootstrap, refresh } = useDashboardData();
  const [form, setForm] = useState<ContractorDraft>(initialContractorForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cepPending, setCepPending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const createMutation = useMutation({
    mutationFn: createContractor,
    onSuccess: async () => {
      await refresh();
      setForm(initialContractorForm);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ContractorInput }) =>
      updateContractor(id, payload),
    onSuccess: async () => {
      await refresh();
      setEditingId(null);
      setForm(initialContractorForm);
    }
  });

  function updateForm(field: keyof ContractorDraft, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(contractor: Contractor) {
    setEditingId(contractor.id);
    setForm({
      legalName: contractor.legalName,
      tradingName: contractor.tradingName ?? "",
      companyIdentifier: contractor.companyIdentifier ?? "",
      contactEmail: contractor.contactEmail ?? "",
      taxId: contractor.taxId ?? "",
      cep: contractor.cep ?? "",
      street: contractor.street ?? "",
      number: contractor.number ?? "",
      neighborhood: contractor.neighborhood ?? "",
      city: contractor.city ?? "",
      state: contractor.state ?? "",
      country: contractor.country,
      defaultCurrency: contractor.defaultCurrency ?? "GBP",
      defaultRateCents: contractor.defaultRateCents ? String(contractor.defaultRateCents) : "",
      isActive: contractor.isActive
    });
  }

  async function handleCepLookup() {
    setCepPending(true);
    try {
      const payload = await lookupCep(form.cep);
      setForm((current) => ({
        ...current,
        cep: payload.cep,
        street: payload.logradouro,
        neighborhood: payload.bairro,
        city: payload.localidade,
        state: payload.uf,
        country: "Brazil"
      }));
    } finally {
      setCepPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    const payload: ContractorInput = {
      legalName: form.legalName,
      tradingName: form.tradingName || undefined,
      companyIdentifier: form.companyIdentifier || undefined,
      contactEmail: form.contactEmail,
      taxId: form.taxId || undefined,
      cep: form.cep || undefined,
      street: form.street || undefined,
      number: form.number || undefined,
      neighborhood: form.neighborhood || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      country: form.country,
      defaultCurrency: form.defaultCurrency,
      defaultRateCents: form.defaultRateCents ? Number(form.defaultRateCents) : undefined,
      isActive: form.isActive
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
        return;
      }

      await createMutation.mutateAsync(payload);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save contractor.");
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="animate-fade-in-up">
        <div className="mb-6">
          <SectionHeader
            description="Disable one to remove it from future dropdowns."
            icon={Users}
            title="Contractors"
          />
        </div>

        <div className="space-y-3">
          {bootstrap.contractors.length ? (
            bootstrap.contractors.map((contractor) => (
              <div className="rounded-3xl border border-border bg-secondary/70 p-4" key={contractor.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{contractor.legalName}</h3>
                    {contractor.companyIdentifier ? (
                      <p className="text-sm text-foreground/58">
                        ID: {contractor.companyIdentifier}
                      </p>
                    ) : null}
                    <p className="mt-1 flex items-center gap-2 text-sm text-foreground/65">
                      <Mail className="h-3.5 w-3.5" />
                      {contractor.contactEmail || "No billing email"}
                    </p>
                    <p className="text-sm text-foreground/65">
                      {contractor.isActive ? "Active" : "Disabled"} · {contractor.defaultCurrency || "GBP"}
                    </p>
                  </div>
                  <Button onClick={() => startEdit(contractor)} type="button" variant="outline">
                    <UserRoundSearch className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-foreground/68">No saved contractors yet.</p>
          )}
        </div>
      </Card>

      <Card className="animate-fade-in-up stagger-1">
        <div className="mb-6">
          <SectionHeader
            description="Keep the details you reuse often."
            icon={UserRoundSearch}
            title={editingId ? "Edit contractor" : "New contractor"}
          />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Legal name</Label>
              <Input required value={form.legalName} onChange={(event) => updateForm("legalName", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Trading name</Label>
              <Input value={form.tradingName} onChange={(event) => updateForm("tradingName", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input required type="email" value={form.contactEmail} onChange={(event) => updateForm("contactEmail", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company identifier</Label>
              <Input
                placeholder="ACME"
                value={form.companyIdentifier}
                onChange={(event) =>
                  updateForm("companyIdentifier", normalizeCompanyIdentifier(event.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tax ID / CNPJ</Label>
              <Input value={form.taxId} onChange={(event) => updateForm("taxId", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <div className="flex gap-2">
                <Input value={form.cep} onChange={(event) => updateForm("cep", event.target.value)} />
                <Button onClick={handleCepLookup} type="button" variant="outline">
                  {cepPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Number</Label>
              <Input value={form.number} onChange={(event) => updateForm("number", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Street</Label>
              <Input value={form.street} onChange={(event) => updateForm("street", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Neighborhood</Label>
              <Input value={form.neighborhood} onChange={(event) => updateForm("neighborhood", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(event) => updateForm("city", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={(event) => updateForm("state", event.target.value.toUpperCase())} />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <select
                className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground"
                value={form.defaultCurrency}
                onChange={(event) => updateForm("defaultCurrency", event.target.value)}
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.symbol} {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Rate</Label>
              <Input value={form.defaultRateCents} onChange={(event) => updateForm("defaultRateCents", event.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-foreground/75">
            <input checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} type="checkbox" />
            Active
          </label>

          <div className="flex gap-3">
            <Button disabled={createMutation.isPending || updateMutation.isPending} type="submit">
              {editingId ? "Update" : "Save"}
            </Button>
            {editingId ? (
              <Button onClick={() => { setEditingId(null); setForm(initialContractorForm); }} type="button" variant="outline">
                Cancel
              </Button>
            ) : null}
          </div>
          {submitError ? <p className="text-sm text-rose-300" role="alert">{submitError}</p> : null}
        </form>
      </Card>
    </section>
  );
}
