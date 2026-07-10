import type {
  CompanyProfileInput,
  ContractorInput,
  CreateInvoiceInput
} from "@/lib/validations";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  totalCents: number;
};

export type CompanyProfile = {
  legalName: string;
  tradingName: string;
  taxId: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  paymentBeneficiary?: string | null;
  paymentBankName?: string | null;
  paymentAccountNumber?: string | null;
  paymentIban?: string | null;
  paymentSwiftBic?: string | null;
  paymentPixKey?: string | null;
  paymentInstructions?: string | null;
};

export type Contractor = {
  id: string;
  legalName: string;
  tradingName?: string | null;
  companyIdentifier?: string | null;
  contactEmail?: string | null;
  taxId?: string | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  defaultCurrency?: string | null;
  defaultRateCents?: number | null;
  isActive: boolean;
};

export type BootstrapPayload = {
  companyProfile: CompanyProfile | null;
  contractors: Contractor[];
  invoices: Invoice[];
};

export type InvoiceForm = {
  contractorMode: "saved" | "manual";
  contractorId: string;
  clientName: string;
  clientEmail: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  items: InvoiceLineItemDraft[];
};

export type InvoiceLineItemDraft = {
  id: string;
  description: string;
  quantity: string;
  unitPriceCents: string;
};

export type ContractorDraft = {
  legalName: string;
  tradingName: string;
  companyIdentifier: string;
  contactEmail: string;
  taxId: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  defaultCurrency: string;
  defaultRateCents: string;
  isActive: boolean;
};

export const currencyOptions = [
  { value: "GBP", label: "British pound", symbol: "£" },
  { value: "USD", label: "US dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" }
] as const;

export const initialInvoiceForm: InvoiceForm = {
  contractorMode: "saved",
  contractorId: "",
  clientName: "",
  clientEmail: "",
  currency: "GBP",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  notes: "",
  items: [
    {
      id: "line-1",
      description: "",
      quantity: "1",
      unitPriceCents: ""
    }
  ]
};

let nextLineItemId = 2;

export function createInvoiceLineItem(): InvoiceLineItemDraft {
  const item = {
    id: `line-${nextLineItemId}`,
    description: "",
    quantity: "1",
    unitPriceCents: ""
  };

  nextLineItemId += 1;
  return item;
}

export const initialCompanyForm: CompanyProfileInput = {
  legalName: "",
  tradingName: "",
  taxId: "",
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brazil",
  paymentBeneficiary: "",
  paymentBankName: "",
  paymentAccountNumber: "",
  paymentIban: "",
  paymentSwiftBic: "",
  paymentPixKey: "",
  paymentInstructions: "",
  setupSource: "MANUAL"
};

export const initialContractorForm: ContractorDraft = {
  legalName: "",
  tradingName: "",
  companyIdentifier: "",
  contactEmail: "",
  taxId: "",
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brazil",
  defaultCurrency: "GBP",
  defaultRateCents: "",
  isActive: true
};

export function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function limitDigits(value: string, maxLength: number) {
  return normalizeDigits(value).slice(0, maxLength);
}

export function formatCnpj(value: string) {
  const digits = limitDigits(value, 14);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function formatCep(value: string) {
  const digits = limitDigits(value, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function getCurrencyOption(currency: string) {
  return currencyOptions.find((option) => option.value === currency) ?? currencyOptions[0];
}

export function normalizeCompanyIdentifier(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12);
}

export function getCompanyIdentifier(
  companyIdentifier?: string | null,
  tradingName?: string | null,
  legalName?: string | null
) {
  const normalizedIdentifier = normalizeCompanyIdentifier(companyIdentifier ?? "");

  if (normalizedIdentifier) {
    return normalizedIdentifier;
  }

  const fallbackSource = tradingName || legalName || "INV";
  const fallback = fallbackSource
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");

  return fallback || "INV";
}

export function getNextInvoiceNumber({
  invoiceCount,
  prefix = "INV"
}: {
  invoiceCount: number;
  prefix?: string;
}) {
  return `${normalizeCompanyIdentifier(prefix) || "INV"}-${String(invoiceCount + 1).padStart(4, "0")}`;
}

export async function fetchBootstrap(): Promise<BootstrapPayload> {
  const response = await fetch("/api/bootstrap");

  if (!response.ok) {
    throw new Error("Failed to load dashboard.");
  }

  return response.json();
}

export async function createCompanyProfile(payload: CompanyProfileInput) {
  const response = await fetch("/api/company-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to save company profile.");
  }

  return response.json();
}

export async function updatePaymentDetails(payload: Pick<CompanyProfileInput, "paymentBeneficiary" | "paymentBankName" | "paymentAccountNumber" | "paymentIban" | "paymentSwiftBic" | "paymentPixKey" | "paymentInstructions">) {
  const response = await fetch("/api/company-profile/payment-details", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to update payment details.");
  }

  return response.json();
}

export async function createContractor(payload: ContractorInput) {
  const response = await fetch("/api/contractors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Unable to save contractor. Check the required fields and try again.");
  }

  return response.json();
}

export async function updateContractor(id: string, payload: ContractorInput) {
  const response = await fetch(`/api/contractors/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Unable to update contractor. Check the required fields and try again.");
  }

  return response.json();
}

export async function createInvoice(payload: CreateInvoiceInput) {
  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || "Unable to create invoice. Check the required fields and try again.");
  }

  return response.json();
}

export async function lookupCep(cep: string) {
  const response = await fetch(`/api/cep/${normalizeDigits(cep)}`);

  if (!response.ok) {
    throw new Error("CEP lookup failed.");
  }

  return response.json();
}

export async function lookupCnpj(cnpj: string) {
  const response = await fetch(`/api/cnpj/${normalizeDigits(cnpj)}`);

  if (!response.ok) {
    throw new Error("CNPJ lookup failed.");
  }

  return response.json();
}
