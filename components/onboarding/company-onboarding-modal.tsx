"use client";

import { useMutation } from "@tanstack/react-query";
import { Building2, CircleHelp, Landmark, LoaderCircle, ScanSearch } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidCnpj, normalizeCnpj } from "@/lib/cnpj";
import {
  createCompanyProfile,
  formatCep,
  formatCnpj,
  initialCompanyForm,
  limitDigits,
  lookupCep,
  lookupCnpj,
  normalizeDigits
} from "@/lib/dashboard";
import type { CompanyProfileInput } from "@/lib/validations";

export function CompanyOnboardingModal({
  onComplete
}: {
  onComplete: () => Promise<unknown>;
}) {
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [companyLookupPending, setCompanyLookupPending] = useState(false);
  const [companyLookupError, setCompanyLookupError] = useState("");
  const [showManualCompanyForm, setShowManualCompanyForm] = useState(false);
  const [cepLookupPending, setCepLookupPending] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"company" | "payment">("company");
  const [paymentError, setPaymentError] = useState("");
  const normalizedCnpj = normalizeCnpj(companyForm.taxId);
  const isCnpjValid = isValidCnpj(normalizedCnpj);

  const createCompanyMutation = useMutation({
    mutationFn: createCompanyProfile,
    onSuccess: async () => {
      await onComplete();
    }
  });

  function updateCompanyForm(field: keyof CompanyProfileInput, value: string) {
    setCompanyForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCompanyCepLookup() {
    setCepLookupPending(true);

    try {
      const payload = await lookupCep(companyForm.cep);
      setCompanyForm((current) => ({
        ...current,
        cep: normalizeDigits(payload.cep),
        street: payload.logradouro,
        neighborhood: payload.bairro,
        city: payload.localidade,
        state: payload.uf,
        country: "Brazil"
      }));
    } finally {
      setCepLookupPending(false);
    }
  }

  async function handleCompanyCnpjLookup() {
    if (!isCnpjValid) {
      return;
    }

    setCompanyLookupPending(true);
    setCompanyLookupError("");

    try {
      const payload = await lookupCnpj(companyForm.taxId);
      setCompanyForm((current) => ({
        ...current,
        legalName: payload.legalName ?? current.legalName,
        tradingName: payload.tradingName ?? current.tradingName,
        taxId: normalizeCnpj(payload.taxId ?? current.taxId),
        cep: normalizeDigits(payload.cep ?? current.cep),
        street: payload.street ?? current.street,
        number: payload.number ?? current.number,
        neighborhood: payload.neighborhood ?? current.neighborhood,
        city: payload.city ?? current.city,
        state: payload.state ?? current.state,
        country: payload.country ?? current.country,
        setupSource: "CNPJ_LOOKUP"
      }));
      setShowManualCompanyForm(true);
    } catch {
      setCompanyLookupError(
        "We could not find this CNPJ. Continue by filling the company details manually."
      );
      setShowManualCompanyForm(true);
    } finally {
      setCompanyLookupPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentError("");

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    const hasPix = Boolean(companyForm.paymentPixKey?.trim());
    const hasBankPayment = Boolean(
      companyForm.paymentBankName?.trim() && companyForm.paymentAccountNumber?.trim()
    );

    if (!hasPix && !hasBankPayment) {
      setPaymentError("Add a PIX key or complete both bank name and account number.");
      return;
    }

    try {
      await createCompanyMutation.mutateAsync({
        ...companyForm,
        tradingName: companyForm.tradingName || companyForm.legalName
      });
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to save company setup.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        <Card className="animate-fade-in glass-panel border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="animate-gentle-float rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Building2 className="h-5 w-5 text-accent" />
                </div>
                <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">
                  Welcome setup
                </p>
              </div>
              <h2 className="font-display text-3xl font-semibold">
                {onboardingStep === "company" ? "Start with your CNPJ." : "Add your payment details."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/72">
                {onboardingStep === "company"
                  ? "We fetch your company first. If the CNPJ is not found, manual entry opens and CEP can complete the address."
                  : "Add the payment details your clients need to pay you."}
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-foreground/55">
                Step {onboardingStep === "company" ? "1 of 2: Company details" : "2 of 2: Payment details"}
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {onboardingStep === "company" ? (
              <>
            <div className="space-y-3">
              <Label>Tax ID / CNPJ</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  value={formatCnpj(companyForm.taxId)}
                  onChange={(event) =>
                    updateCompanyForm("taxId", normalizeCnpj(event.target.value))
                  }
                />
                <Button
                  aria-label="Look up CNPJ"
                  className={`h-10 shrink-0 overflow-hidden transition-[width,padding] duration-300 ${companyLookupPending ? "w-10 px-0" : "w-full sm:w-28"}`}
                  disabled={companyLookupPending || !isCnpjValid}
                  onClick={handleCompanyCnpjLookup}
                  type="button"
                  variant="outline"
                >
                  {companyLookupPending ? (
                    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ScanSearch aria-hidden="true" className="mr-2 h-4 w-4" />
                      Lookup
                    </>
                  )}
                </Button>
              </div>
              {companyLookupError ? (
                <p className="text-sm text-amber-300">{companyLookupError}</p>
              ) : (normalizedCnpj.length === 14 && !isCnpjValid) ? (
                <p className="text-sm text-rose-300">The CNPJ check digits are invalid.</p>
              ) : (
                <p className="flex items-center gap-2 text-xs text-foreground/60">
                  <CircleHelp className="h-3.5 w-3.5" />
                  Manual fields only appear if you need them.
                </p>
              )}
            </div>

            {showManualCompanyForm ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Razão social</Label>
                    <Input value={companyForm.legalName} onChange={(event) => updateCompanyForm("legalName", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome fantasia</Label>
                    <Input value={companyForm.tradingName} onChange={(event) => updateCompanyForm("tradingName", event.target.value)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>CEP</Label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={formatCep(companyForm.cep)}
                      onChange={(event) =>
                        updateCompanyForm("cep", limitDigits(event.target.value, 8))
                      }
                    />
                    <Button
                      aria-label="Look up CEP"
                      className={`h-10 shrink-0 overflow-hidden transition-[width,padding] duration-300 ${cepLookupPending ? "w-10 px-0" : "w-full sm:w-28"}`}
                      disabled={cepLookupPending}
                      onClick={handleCompanyCepLookup}
                      type="button"
                      variant="outline"
                    >
                      {cepLookupPending ? (
                        <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ScanSearch aria-hidden="true" className="mr-2 h-4 w-4" />
                          Lookup
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Street</Label>
                    <Input value={companyForm.street} onChange={(event) => updateCompanyForm("street", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Number</Label>
                    <Input value={companyForm.number} onChange={(event) => updateCompanyForm("number", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Neighborhood</Label>
                    <Input value={companyForm.neighborhood} onChange={(event) => updateCompanyForm("neighborhood", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={companyForm.city} onChange={(event) => updateCompanyForm("city", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input maxLength={2} value={companyForm.state} onChange={(event) => updateCompanyForm("state", event.target.value.toUpperCase())} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={companyForm.country} onChange={(event) => updateCompanyForm("country", event.target.value)} />
                  </div>
                </div>

                <Button onClick={() => setOnboardingStep("payment")} type="button">
                  Continue to payment details
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" onClick={() => setShowManualCompanyForm(true)}>
                <Building2 className="mr-2 h-4 w-4" />
                Enter manually
              </Button>
            )}
              </>
            ) : (
              <div className="animate-fade-in rounded-2xl border border-white/10 bg-secondary/35 p-4">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-accent" />
                  <Label>Payment details</Label>
                </div>
                <p className="mt-1 text-xs text-foreground/60">
                  Add the details clients need to pay you. You can change these later in My Company.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Beneficiary name</Label>
                    <Input required value={companyForm.paymentBeneficiary} onChange={(event) => updateCompanyForm("paymentBeneficiary", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank name</Label>
                    <Input value={companyForm.paymentBankName} onChange={(event) => updateCompanyForm("paymentBankName", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account number</Label>
                    <Input value={companyForm.paymentAccountNumber} onChange={(event) => updateCompanyForm("paymentAccountNumber", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <Input value={companyForm.paymentIban} onChange={(event) => updateCompanyForm("paymentIban", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>SWIFT / BIC</Label>
                    <Input value={companyForm.paymentSwiftBic} onChange={(event) => updateCompanyForm("paymentSwiftBic", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>PIX key</Label>
                    <Input value={companyForm.paymentPixKey} onChange={(event) => updateCompanyForm("paymentPixKey", event.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Additional payment instructions</Label>
                    <textarea
                      className="min-h-20 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                      value={companyForm.paymentInstructions}
                      onChange={(event) => updateCompanyForm("paymentInstructions", event.target.value)}
                    />
                  </div>
                </div>
                {paymentError ? <p className="mt-4 text-sm text-rose-300" role="alert">{paymentError}</p> : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => setOnboardingStep("company")} type="button" variant="outline">
                    Back to company details
                  </Button>
                  <Button disabled={createCompanyMutation.isPending} type="submit">
                    {createCompanyMutation.isPending ? "Saving..." : "Finish setup"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
