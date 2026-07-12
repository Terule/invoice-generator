"use client";

import { useMutation } from "@tanstack/react-query";
import { Building2, ImageUp, Landmark, MapPinned, Palette, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { SectionHeader } from "@/components/shared/section-header";
import { useDashboardData } from "@/components/shell/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_INVOICE_COLOR,
  isAcceptedLogo,
  MAX_LOGO_DIMENSION_PX,
  MAX_LOGO_DIMENSIONS_LABEL,
  MAX_LOGO_SIZE_LABEL
} from "@/lib/branding";
import { formatCnpj, removeCompanyLogo, updateCompanyBranding, updatePaymentDetails, uploadCompanyLogo } from "@/lib/dashboard";
import type { PaymentDetailsInput } from "@/lib/validations";

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

function brandingFormFromCompany(company: ReturnType<typeof useDashboardData>["bootstrap"]["companyProfile"]) {
  return {
    invoiceColor: company?.invoiceColor ?? DEFAULT_INVOICE_COLOR,
    logoPath: company?.logoPath ?? null
  };
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
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentDetailsInput>(() => paymentFormFromCompany(company));
  const [paymentError, setPaymentError] = useState("");
  const [brandingForm, setBrandingForm] = useState(() => brandingFormFromCompany(company));
  const [brandingError, setBrandingError] = useState("");
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

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
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

  async function handleBrandingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBrandingError("");

    try {
      await updateBrandingMutation.mutateAsync(brandingForm);
    } catch (error) {
      setBrandingError(error instanceof Error ? error.message : "Unable to save invoice branding.");
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <Card className="animate-fade-in-up">
        <SectionHeader
          description="Used for future invoices after the first setup."
          icon={Building2}
          title="My Company"
        />

        {company ? (
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Razão social</p>
              <p className="mt-2 text-xl font-semibold">{company.legalName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Nome fantasia</p>
              <p className="mt-2 text-xl font-semibold">{company.tradingName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">Tax ID / CNPJ</p>
              <p className="mt-2 text-xl font-semibold">{formatCnpj(company.taxId)}</p>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="animate-fade-in-up stagger-1">
        <SectionHeader
          description="Used on future invoice previews and PDFs."
          icon={Palette}
          title="Invoice Branding"
        />

        {company ? (
          <form className="mt-6 space-y-5" onSubmit={handleBrandingSubmit}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-secondary/60">
                {brandingForm.logoPath ? (
                  <Image alt="Company logo preview" className="h-full w-full object-contain" height={64} src={`/api/company-profile/logo?path=${encodeURIComponent(brandingForm.logoPath)}`} unoptimized width={64} />
                ) : (
                  <ImageUp className="h-6 w-6 text-foreground/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Label htmlFor="company-logo">Company logo</Label>
                <Input accept="image/png,image/jpeg,image/webp" className="mt-2" disabled={uploadLogoMutation.isPending} id="company-logo" onChange={handleLogoChange} type="file" />
                <p className="mt-2 text-xs leading-relaxed text-foreground/60">
                  PNG, JPEG, or WebP only. Maximum file size: {MAX_LOGO_SIZE_LABEL}. Use a square 1:1 image, up to {MAX_LOGO_DIMENSIONS_LABEL}.
                </p>
              </div>
              {brandingForm.logoPath ? (
                <Button aria-label="Remove company logo" className="h-10 w-10 shrink-0 px-0" disabled={removeLogoMutation.isPending} onClick={handleLogoRemove} type="button" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-color">Invoice color</Label>
                <input
                  aria-label="Invoice color"
                  className="block h-11 w-16 cursor-pointer rounded-xl border border-border bg-secondary p-1"
                  id="invoice-color"
                  onChange={(event) => setBrandingForm((current) => ({ ...current, invoiceColor: event.target.value }))}
                  type="color"
                  value={brandingForm.invoiceColor}
                />
              </div>
              <p className="pb-2 text-sm text-foreground/65">{brandingForm.invoiceColor.toUpperCase()}</p>
            </div>

            <Button disabled={updateBrandingMutation.isPending} type="submit">
              {updateBrandingMutation.isPending ? "Saving..." : "Save invoice branding"}
            </Button>
            {brandingError ? <p className="text-sm text-rose-300" role="alert">{brandingError}</p> : null}
          </form>
        ) : null}
      </Card>

      <Card className="animate-fade-in-up stagger-2 xl:order-4">
        <SectionHeader
          description="Your fixed business address for future invoices."
          icon={MapPinned}
          title="Address"
        />

        {company ? (
          <div className="mt-6 rounded-[28px] border border-white/10 bg-secondary/60 p-6">
            <p className="text-xl font-semibold">
              {company.street}, {company.number}
            </p>
            <p className="mt-2 text-base text-foreground/72">
              {company.neighborhood}, {company.city} - {company.state}
            </p>
            <p className="text-base text-foreground/72">
              {company.cep} · {company.country}
            </p>
          </div>
        ) : null}
      </Card>

      <Card className="animate-fade-in-up stagger-3 xl:order-3">
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
    </section>
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
            <dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      {company.paymentInstructions ? <p className="mt-5 whitespace-pre-wrap border-t border-white/10 pt-5 text-sm leading-6 text-foreground/72">{company.paymentInstructions}</p> : null}
    </div>
  );
}
