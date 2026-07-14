import { z } from "zod";

import { isValidInvoiceColor } from "@/lib/branding";
import { isValidCnpj } from "@/lib/cnpj";

const cepSchema = z.string().trim().regex(/^\d{8}$/, "CEP must have 8 digits");
const cnpjSchema = z.string().trim().refine(isValidCnpj, "Invalid CNPJ check digits");

const paymentDetailsFields = z.object({
  paymentBeneficiary: z.string().trim().max(191).optional(),
  paymentBankName: z.string().trim().max(191).optional(),
  paymentAccountNumber: z.string().trim().max(191).optional(),
  paymentSortCode: z.string().trim().max(191).optional(),
  paymentIban: z.string().trim().max(191).optional(),
  paymentSwiftBic: z.string().trim().max(191).optional(),
  paymentPixKey: z.string().trim().max(191).optional(),
  paymentInstructions: z.string().trim().max(1000).optional()
});

function validatePaymentDetails(
  value: z.infer<typeof paymentDetailsFields>,
  context: z.RefinementCtx
) {
  const hasPix = Boolean(value.paymentPixKey?.trim());
  const hasBankName = Boolean(value.paymentBankName?.trim());
  const hasAccountNumber = Boolean(value.paymentAccountNumber?.trim());

  if (!value.paymentBeneficiary?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["paymentBeneficiary"], message: "Beneficiary name is required." });
  }

  if (!hasPix && !hasBankName) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["paymentBankName"], message: "Add a PIX key or bank name." });
  }

  if (!hasPix && !hasAccountNumber) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["paymentAccountNumber"], message: "Add a PIX key or account number." });
  }
}

export const paymentDetailsSchema = paymentDetailsFields.superRefine(validatePaymentDetails);

export const companyBrandingSchema = z.object({
  invoiceColor: z.string().refine(isValidInvoiceColor, "Invalid invoice color.")
});

export const createInvoiceSchema = z.object({
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  contractorId: z.string().cuid().optional(),
  currency: z.string().min(3).max(3).default("GBP"),
  issueDate: z.string(),
  dueDate: z.string(),
  notes: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(2),
        quantity: z.number().int().positive(),
        unitPriceCents: z.number().int().positive()
      })
    )
    .min(1)
});

export const companyProfileSchema = z.object({
  legalName: z.string().min(2),
  tradingName: z.string().optional(),
  taxId: cnpjSchema,
  cep: cepSchema,
  street: z.string().min(2),
  number: z.string().min(1),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
  country: z.string().min(2).default("Brazil"),
  setupSource: z.enum(["MANUAL", "CNPJ_LOOKUP", "PDF_UPLOAD"]).default("MANUAL")
}).merge(paymentDetailsFields).superRefine(validatePaymentDetails);

export const companyInfoSchema = z.object({
  legalName: z.string().min(2),
  tradingName: z.string().optional(),
  taxId: cnpjSchema,
  cep: cepSchema,
  street: z.string().min(2),
  number: z.string().min(1),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
  country: z.string().min(2).default("Brazil")
});

export const contractorSchema = z.object({
  legalName: z.string().min(2),
  tradingName: z.string().optional(),
  companyIdentifier: z
    .string()
    .trim()
    .max(12)
    .regex(/^[A-Za-z0-9-]*$/, "Use letters, numbers, or hyphens only")
    .optional(),
  contactEmail: z.string().email(),
  taxId: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(2).default("Brazil"),
  defaultCurrency: z.string().min(3).max(3).default("GBP"),
  defaultRateCents: z.number().int().positive().optional(),
  isActive: z.boolean().default(true)
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type CompanyInfoInput = z.infer<typeof companyInfoSchema>;
export type ContractorInput = z.infer<typeof contractorSchema>;
export type PaymentDetailsInput = z.infer<typeof paymentDetailsSchema>;
