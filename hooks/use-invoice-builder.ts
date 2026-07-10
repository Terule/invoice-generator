"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useDashboardData } from "@/components/shell/dashboard-shell";
import {
  createInvoice,
  createInvoiceLineItem,
  type InvoiceForm,
  type InvoiceLineItemDraft,
  initialInvoiceForm
} from "@/lib/dashboard";

export function useInvoiceBuilder() {
  const { bootstrap, refresh } = useDashboardData();
  const [form, setForm] = useState<InvoiceForm>(initialInvoiceForm);
  const [createdInvoice, setCreatedInvoice] = useState<{ id: string; invoiceNumber: string } | null>(null);

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: async (invoice) => {
      setCreatedInvoice({ id: invoice.id, invoiceNumber: invoice.invoiceNumber });
      await refresh();
      setForm((current) => ({ ...initialInvoiceForm, currency: current.currency }));
    }
  });

  const activeContractors = bootstrap.contractors.filter((contractor) => contractor.isActive);
  const selectedContractor =
    activeContractors.find((contractor) => contractor.id === form.contractorId) ?? null;

  function addLineItem() {
    setForm((current) => ({
      ...current,
      items: [...current.items, createInvoiceLineItem()]
    }));
  }

  function removeLineItem(id: string) {
    setForm((current) => {
      if (current.items.length === 1) {
        return current;
      }

      return {
        ...current,
        items: current.items.filter((item) => item.id !== id)
      };
    });
  }

  function updateLineItem(id: string, field: keyof Omit<InvoiceLineItemDraft, "id">, value: string) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    }));
  }

  function dismissCreatedInvoice() {
    setCreatedInvoice(null);
  }

  useEffect(() => {
    if (!selectedContractor || form.contractorMode !== "saved") {
      return;
    }

    setForm((current) => ({
      ...current,
      clientName: selectedContractor.legalName,
      clientEmail: selectedContractor.contactEmail ?? current.clientEmail,
      currency: selectedContractor.defaultCurrency ?? current.currency,
      items:
        selectedContractor.defaultRateCents != null
          ? current.items.map((item, index) =>
              index === 0 ? { ...item, unitPriceCents: String(selectedContractor.defaultRateCents) } : item
            )
          : current.items
    }));
  }, [form.contractorMode, selectedContractor]);

  const totalCents = useMemo(
    () =>
      form.items.reduce(
        (total, item) => total + Number(item.quantity || 0) * Number(item.unitPriceCents || 0),
        0
      ),
    [form.items]
  );

  return {
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
  };
}
