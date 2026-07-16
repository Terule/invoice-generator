"use client";

import { useMutation } from "@tanstack/react-query";
import { Building2, ImageUp, Landmark, Palette, Pencil, X } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type ComponentProps, useState } from "react";

import { SectionHeader } from "@/components/shared/section-header";
import { useDashboardData } from "@/components/shell/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_INVOICE_COLOR,
  isAcceptedLogo,
  isValidInvoiceColor,
  MAX_LOGO_DIMENSION_PX,
  MAX_LOGO_DIMENSIONS_LABEL,
  MAX_LOGO_SIZE_LABEL
} from "@/lib/branding";
import { formatCep, formatCnpj, removeCompanyLogo, updateCompanyBranding, updateCompanyInfo, updatePaymentDetails, uploadCompanyLogo } from "@/lib/dashboard";
import type { CompanyInfoInput, PaymentDetailsInput } from "@/lib/validations";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

function paymentFormFromCompany(company: ReturnType<typeof useDashboardData>["bootstrap"]["companyProfile"]) {
  return {
    paymentBeneficiary: company?.paymentBeneficiary ?? "",
    paymentBankName: company?.paymentBankName ?? "",
    paymentAccountNumber: company?.paymentAccountNumber ?? "",
    paymentSortCode: company?.paymentSortCode ?? "",
    paymentIban: company?.paymentIban ?? "",
    paymentSwiftBic: company?.paymentSwiftBic ?? "",
    paymentPixKey: company?.paymentPixKey ?? "",
    paymentInstructions: company?.paymentInstructions ?? ""
  };
}

function companyInfoFormFromCompany(company: ReturnType<typeof useDashboardData>["bootstrap"]["companyProfile"]): CompanyInfoInput {
  return {
    taxId: company?.taxId ?? "",
    legalName: company?.legalName ?? "",
    tradingName: company?.tradingName ?? "",
    cep: company?.cep ?? "",
    street: company?.street ?? "",
    number: company?.number ?? "",
    neighborhood: company?.neighborhood ?? "",
    city: company?.city ?? "",
    state: company?.state ?? "",
    country: company?.country ?? "Brazil"
  };
}

function brandingFormFromCompany(company: ReturnType<typeof useDashboardData>["bootstrap"]["companyProfile"]) {
  return {
    invoiceColor: company?.invoiceColor ?? DEFAULT_INVOICE_COLOR,
    logoPath: company?.logoPath ?? null
  };
}

const INVOICE_COLOR_PRESETS = [
  DEFAULT_INVOICE_COLOR,
  "#0F766E",
  "#1D4ED8",
  "#B45309",
  "#BE123C",
  "#6D28D9"
];

function normalizeInvoiceColor(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "#";
  }

  const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return normalized.slice(0, 7).toUpperCase();
}

async function isSquareLogo(file: File) {
  const image = await createImageBitmap(file);
  const isValid =
    image.width === image.height &&
    image.width <= MAX_LOGO_DIMENSION_PX &&
    image.height <= MAX_LOGO_DIMENSION_PX;

  image.close();
  return isValid;
}

export function CompanyPageContent() {
  const { bootstrap, refresh } = useDashboardData();
  const company = bootstrap.companyProfile;
  const [isEditingCompanyInfo, setIsEditingCompanyInfo] = useState(false);
  const [companyInfoForm, setCompanyInfoForm] = useState<CompanyInfoInput>(() => companyInfoFormFromCompany(company));
  const [companyInfoError, setCompanyInfoError] = useState("");
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentDetailsInput>(() => paymentFormFromCompany(company));
  const [paymentError, setPaymentError] = useState("");
  const [brandingForm, setBrandingForm] = useState(() => brandingFormFromCompany(company));
  const [brandingError, setBrandingError] = useState("");
  const updateCompanyInfoMutation = useMutation({
    mutationFn: updateCompanyInfo,
    onSuccess: async () => {
      await refresh();
      setIsEditingCompanyInfo(false);
      setCompanyInfoError("");
    }
  });
  const updatePaymentMutation = useMutation({
    mutationFn: updatePaymentDetails,
    onSuccess: async () => {
      await refresh();
      setIsEditingPayment(false);
    }
  });
  const updateBrandingMutation = useMutation({
    mutationFn: updateCompanyBranding,
    onSuccess: async () => {
      await refresh();
      setBrandingError("");
    }
  });
  const uploadLogoMutation = useMutation({
    mutationFn: uploadCompanyLogo,
    onSuccess: async ({ logoPath }) => {
      setBrandingForm((current) => ({ ...current, logoPath }));
      setBrandingError("");
      await refresh();
    }
  });
  const removeLogoMutation = useMutation({
    mutationFn: removeCompanyLogo,
    onSuccess: async () => {
      setBrandingForm((current) => ({ ...current, logoPath: null }));
      setBrandingError("");
      await refresh();
    }
  });

  function updatePaymentField(field: keyof PaymentDetailsInput, value: string) {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  }

  function updateCompanyInfoField(field: keyof CompanyInfoInput, value: string) {
    setCompanyInfoForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCompanyInfoSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    setCompanyInfoError("");

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    try {
      await updateCompanyInfoMutation.mutateAsync(companyInfoForm);
    } catch (error) {
      setCompanyInfoError(error instanceof Error ? error.message : "Unable to save company information.");
    }
  }

  function cancelCompanyInfoEdit() {
    setCompanyInfoForm(companyInfoFormFromCompany(company));
    setIsEditingCompanyInfo(false);
    setCompanyInfoError("");
  }

  async function handlePaymentSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    setPaymentError("");

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    const hasPix = Boolean(paymentForm.paymentPixKey?.trim());
    const hasBankPayment = Boolean(
      paymentForm.paymentBankName?.trim() && paymentForm.paymentAccountNumber?.trim()
    );

    if (!hasPix && !hasBankPayment) {
      setPaymentError("Add a PIX key or complete both bank name and account number.");
      return;
    }

    try {
      await updatePaymentMutation.mutateAsync(paymentForm);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to save payment details.");
    }
  }

  function cancelPaymentEdit() {
    setPaymentForm(paymentFormFromCompany(company));
    setIsEditingPayment(false);
    setPaymentError("");
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isAcceptedLogo(file)) {
      setBrandingError(`Choose a PNG, JPEG, or WebP logo up to ${MAX_LOGO_SIZE_LABEL}.`);
      event.target.value = "";
      return;
    }

    try {
      if (!(await isSquareLogo(file))) {
        setBrandingError(`Choose a square logo no larger than ${MAX_LOGO_DIMENSIONS_LABEL}.`);
        event.target.value = "";
        return;
      }
    } catch {
      setBrandingError("We could not read that image. Choose a PNG, JPEG, or WebP logo.");
      event.target.value = "";
      return;
    }

    try {
      await uploadLogoMutation.mutateAsync(file);
    } catch (error) {
      setBrandingError(error instanceof Error ? error.message : "Unable to upload logo.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleLogoRemove() {
    try {
      await removeLogoMutation.mutateAsync();
    } catch (error) {
      setBrandingError(error instanceof Error ? error.message : "Unable to remove logo.");
    }
  }

  async function handleBrandingSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    setBrandingError("");

    if (!isValidInvoiceColor(brandingForm.invoiceColor)) {
      setBrandingError("Use a valid HEX color in the format #RRGGBB.");
      return;
    }

    try {
      await updateBrandingMutation.mutateAsync(brandingForm);
    } catch (error) {
      setBrandingError(error instanceof Error ? error.message : "Unable to save invoice branding.");
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <Card className="animate-fade-in-up xl:row-span-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            description="Used for future invoices. Issued invoices remain immutable snapshots."
            icon={Building2}
            title="My Company"
          />
          {!isEditingCompanyInfo ? (
            <Button className="gap-2" onClick={() => setIsEditingCompanyInfo(true)} variant="outline">
              <Pencil className="h-4 w-4" />
              Edit company info
            </Button>
          ) : null}
        </div>

        {company ? (
          isEditingCompanyInfo ? (
            <form className="mt-6 space-y-4" onSubmit={handleCompanyInfoSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <CompanyInfoInputField required label="Tax ID / CNPJ" value={formatCnpj(companyInfoForm.taxId)} onChange={(value) => updateCompanyInfoField("taxId", value)} />
                <CompanyInfoInputField required label="Legal name" value={companyInfoForm.legalName} onChange={(value) => updateCompanyInfoField("legalName", value)} />
                <CompanyInfoInputField label="Trading name" value={companyInfoForm.tradingName} onChange={(value) => updateCompanyInfoField("tradingName", value)} />
                <CompanyInfoInputField required label="CEP" value={formatCep(companyInfoForm.cep)} onChange={(value) => updateCompanyInfoField("cep", value)} />
                <CompanyInfoInputField required label="Street" value={companyInfoForm.street} onChange={(value) => updateCompanyInfoField("street", value)} />
                <CompanyInfoInputField required label="Number" value={companyInfoForm.number} onChange={(value) => updateCompanyInfoField("number", value)} />
                <CompanyInfoInputField required label="Neighborhood" value={companyInfoForm.neighborhood} onChange={(value) => updateCompanyInfoField("neighborhood", value)} />
                <CompanyInfoInputField required label="City" value={companyInfoForm.city} onChange={(value) => updateCompanyInfoField("city", value)} />
                <CompanyInfoInputField required label="State" maxLength={2} value={companyInfoForm.state.toUpperCase()} onChange={(value) => updateCompanyInfoField("state", value.toUpperCase())} />
                <CompanyInfoInputField required label="Country" value={companyInfoForm.country} onChange={(value) => updateCompanyInfoField("country", value)} />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button disabled={updateCompanyInfoMutation.isPending} type="submit">
                  {updateCompanyInfoMutation.isPending ? "Saving..." : "Save company info"}
                </Button>
                <Button onClick={cancelCompanyInfoEdit} type="button" variant="ghost">Cancel</Button>
              </div>
              {companyInfoError ? <p className="text-sm text-rose-300" role="alert">{companyInfoError}</p> : null}
            </form>
          ) : (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Tax ID / CNPJ</p>
                <p className="mt-2 text-xl font-semibold">{formatCnpj(company.taxId)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Legal name</p>
                <p className="mt-2 text-xl font-semibold">{company.legalName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Trading name</p>
                <p className="mt-2 text-xl font-semibold">{company.tradingName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Street / Number</p>
                <p className="mt-2 text-xl font-semibold">{company.street}, {company.number}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Neighborhood / City / State</p>
                <p className="mt-2 text-xl font-semibold">{company.neighborhood}, {company.city} - {company.state}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">CEP / Country</p>
                <p className="mt-2 text-xl font-semibold">{formatCep(company.cep)} · {company.country}</p>
              </div>
            </div>
          )
        ) : null}
      </Card>

      <Card className="animate-fade-in-up stagger-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            description="Shown on future invoices. Issued invoices keep their original payment details."
            icon={Landmark}
            title="Payment Details"
          />
          {!isEditingPayment ? (
            <Button className="gap-2" onClick={() => setIsEditingPayment(true)} variant="outline">
              <Pencil className="h-4 w-4" />
              Edit payment details
            </Button>
          ) : null}
        </div>

        {isEditingPayment ? (
          <form className="mt-6 space-y-4" onSubmit={handlePaymentSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <PaymentInput required label="Beneficiary name" value={paymentForm.paymentBeneficiary} onChange={(value) => updatePaymentField("paymentBeneficiary", value)} />
              <PaymentInput label="Bank name" value={paymentForm.paymentBankName} onChange={(value) => updatePaymentField("paymentBankName", value)} />
              <PaymentInput label="Account number" value={paymentForm.paymentAccountNumber} onChange={(value) => updatePaymentField("paymentAccountNumber", value)} />
              <PaymentInput label="Sort code" value={paymentForm.paymentSortCode} onChange={(value) => updatePaymentField("paymentSortCode", value)} />
              <PaymentInput label="IBAN" value={paymentForm.paymentIban} onChange={(value) => updatePaymentField("paymentIban", value)} />
              <PaymentInput label="SWIFT / BIC" value={paymentForm.paymentSwiftBic} onChange={(value) => updatePaymentField("paymentSwiftBic", value)} />
              <PaymentInput label="PIX key" value={paymentForm.paymentPixKey} onChange={(value) => updatePaymentField("paymentPixKey", value)} />
            </div>
            <div className="space-y-2">
              <Label>Additional payment instructions</Label>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                value={paymentForm.paymentInstructions}
                onChange={(event) => updatePaymentField("paymentInstructions", event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button disabled={updatePaymentMutation.isPending} type="submit">
                {updatePaymentMutation.isPending ? "Saving..." : "Save payment details"}
              </Button>
              <Button onClick={cancelPaymentEdit} type="button" variant="ghost">Cancel</Button>
            </div>
            {paymentError ? <p className="text-sm text-rose-300" role="alert">{paymentError}</p> : null}
          </form>
        ) : company ? (
          <PaymentDetailsSummary company={company} />
        ) : null}
      </Card>

      <Card className="animate-fade-in-up stagger-2">
        <SectionHeader
          description="Used on future invoice previews and PDFs."
          icon={Palette}
          title="Invoice Branding"
        />

        {company ? (
          <form className="mt-6 space-y-5" onSubmit={handleBrandingSubmit}>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-secondary/60">
                  {brandingForm.logoPath ? (
                    <Image alt="Company logo preview" className="h-full w-full object-contain" height={64} src={`/api/company-profile/logo?v=${encodeURIComponent(brandingForm.logoPath)}`} unoptimized width={64} />
                  ) : (
                    <ImageUp className="h-6 w-6 text-foreground/40" />
                  )}
                </div>
                {brandingForm.logoPath ? (
                  <Button
                    aria-label="Remove company logo"
                    className="absolute -right-2 -top-2 h-7 w-7 rounded-full border border-rose-300/50 bg-rose-500 p-0 text-white shadow-lg hover:bg-rose-400"
                    disabled={removeLogoMutation.isPending}
                    onClick={handleLogoRemove}
                    type="button"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </Button>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Label htmlFor="company-logo">Company logo</Label>
                <Input accept="image/png,image/jpeg,image/webp" className="mt-2" disabled={uploadLogoMutation.isPending} id="company-logo" onChange={handleLogoChange} type="file" />
                <p className="mt-2 text-xs leading-relaxed text-foreground/60">
                  PNG, JPEG, or WebP only. Maximum file size: {MAX_LOGO_SIZE_LABEL}. Use a square 1:1 image, up to {MAX_LOGO_DIMENSIONS_LABEL}.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="invoice-color">Invoice color</Label>
              <div className="flex flex-wrap items-end gap-4">
                <div
                  aria-hidden="true"
                  className="h-11 w-16 rounded-xl border border-border shadow-soft"
                  style={{ backgroundColor: isValidInvoiceColor(brandingForm.invoiceColor) ? brandingForm.invoiceColor : DEFAULT_INVOICE_COLOR }}
                />
                <div className="min-w-36 space-y-2">
                  <Input
                    autoCapitalize="characters"
                    autoCorrect="off"
                    id="invoice-color"
                    inputMode="text"
                    maxLength={7}
                    onChange={(event) =>
                      setBrandingForm((current) => ({
                        ...current,
                        invoiceColor: normalizeInvoiceColor(event.target.value)
                      }))
                    }
                    placeholder="#0B6281"
                    spellCheck={false}
                    value={brandingForm.invoiceColor.toUpperCase()}
                  />
                  <p className="text-xs text-foreground/60">Use a HEX color like #0B6281.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {INVOICE_COLOR_PRESETS.map((color) => {
                  const isSelected = brandingForm.invoiceColor.toUpperCase() === color.toUpperCase();

                  return (
                    <button
                      aria-label={`Select invoice color ${color}`}
                      className={`h-8 w-8 rounded-full border transition hover:scale-105 ${isSelected ? "border-white ring-2 ring-white/70 ring-offset-2 ring-offset-background" : "border-white/15"}`}
                      key={color}
                      onClick={() => {
                        setBrandingError("");
                        setBrandingForm((current) => ({ ...current, invoiceColor: color.toUpperCase() }));
                      }}
                      style={{ backgroundColor: color }}
                      type="button"
                    />
                  );
                })}
              </div>
            </div>

            <Button disabled={updateBrandingMutation.isPending} type="submit">
              {updateBrandingMutation.isPending ? "Saving..." : "Save invoice branding"}
            </Button>
            {brandingError ? <p className="text-sm text-rose-300" role="alert">{brandingError}</p> : null}
          </form>
        ) : null}
      </Card>
    </section>
  );
}

function CompanyInfoInputField({
  label,
  value,
  onChange,
  required = false,
  maxLength
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input maxLength={maxLength} required={required} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function PaymentInput({ label, value, onChange, required = false }: { label: string; value?: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input required={required} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function PaymentDetailsSummary({ company }: { company: NonNullable<ReturnType<typeof useDashboardData>["bootstrap"]["companyProfile"]> }) {
  const details = [
    ["Beneficiary", company.paymentBeneficiary],
    ["Bank", company.paymentBankName],
    ["Account", company.paymentAccountNumber],
    ["Sort code", company.paymentSortCode],
    ["IBAN", company.paymentIban],
    ["SWIFT / BIC", company.paymentSwiftBic],
    ["PIX", company.paymentPixKey]
  ].filter(([, value]) => Boolean(value));

  if (!details.length && !company.paymentInstructions) {
    return <p className="mt-6 text-sm text-foreground/65">No payment details yet. Add them before issuing your next invoice.</p>;
  }

  return (
    <div className="mt-6 rounded-[28px] border border-white/10 bg-secondary/60 p-6">
      <dl className="grid gap-4 md:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-[0.18em] text-foreground/55">{label}</dt>
            <dd className="mt-1 wrap-break-words text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      {company.paymentInstructions ? <p className="mt-5 whitespace-pre-wrap border-t border-white/10 pt-5 text-sm leading-6 text-foreground/72">{company.paymentInstructions}</p> : null}
    </div>
  );
}
