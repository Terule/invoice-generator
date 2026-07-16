"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_INVOICE_COLOR, isValidInvoiceColor } from "@/lib/branding";
import { cn } from "@/lib/utils";

type PickrInstance = import("@simonwep/pickr").default;

type PickrColorInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
};

const PICKR_SWATCHES = [
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

function toUpperHex(value: string) {
  return value.toUpperCase();
}

function colorFromPickr(color: { toHEXA(): { toString(): string } } | null) {
  if (!color) {
    return DEFAULT_INVOICE_COLOR;
  }

  const rawValue = color.toHEXA().toString();
  const normalized = normalizeInvoiceColor(rawValue);
  return isValidInvoiceColor(normalized) ? normalized : DEFAULT_INVOICE_COLOR;
}

export function PickrColorInput({
  value,
  onChange,
  disabled = false,
  className
}: PickrColorInputProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pickrRef = useRef<PickrInstance | null>(null);
  const committedColorRef = useRef(toUpperHex(value));

  useEffect(() => {
    const nextValue = toUpperHex(value);
    committedColorRef.current = nextValue;
    pickrRef.current?.setColor(nextValue, true);
  }, [value]);

  useEffect(() => {
    let isMounted = true;

    async function setupPickr() {
      if (!triggerRef.current) {
        return;
      }

      const { default: Pickr } = await import("@simonwep/pickr");

      if (!isMounted || !triggerRef.current) {
        return;
      }

      const pickr = Pickr.create({
        el: triggerRef.current,
        useAsButton: true,
        theme: "monolith",
        default: committedColorRef.current,
        defaultRepresentation: "HEXA",
        swatches: PICKR_SWATCHES,
        closeOnScroll: true,
        position: "bottom-start",
        appClass: "invoice-color-pickr",
        components: {
          preview: true,
          opacity: false,
          hue: true,
          interaction: {
            hex: true,
            input: true,
            save: true,
            cancel: true,
            clear: false,
            rgba: false,
            hsla: false,
            hsva: false,
            cmyk: false
          }
        },
        i18n: {
          "btn:save": "Apply",
          "btn:cancel": "Cancel"
        }
      });

      pickr
        .on("save", (color: { toHEXA(): { toString(): string } } | null, instance: PickrInstance) => {
          const nextColor = colorFromPickr(color);
          committedColorRef.current = nextColor;
          onChange(nextColor);
          instance.hide();
        })
        .on("cancel", (instance: PickrInstance) => {
          instance.setColor(committedColorRef.current, true);
          instance.hide();
        });

      if (disabled) {
        pickr.disable();
      }

      pickrRef.current = pickr;
    }

    void setupPickr();

    return () => {
      isMounted = false;
      pickrRef.current?.destroyAndRemove();
      pickrRef.current = null;
    };
  }, [disabled, onChange]);

  useEffect(() => {
    if (disabled) {
      pickrRef.current?.disable();
      return;
    }

    pickrRef.current?.enable();
  }, [disabled]);

  const previewColor = isValidInvoiceColor(value) ? value : committedColorRef.current;

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <button
        aria-label="Choose invoice color"
        className="h-11 w-16 rounded-xl border border-border shadow-soft transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        ref={triggerRef}
        style={{ backgroundColor: previewColor }}
        type="button"
      />
      <div className="space-y-1">
        <p className="text-sm text-foreground/72">{previewColor.toUpperCase()}</p>
        <p className="text-xs text-foreground/60">Open the picker and use its HEX field, then click Apply.</p>
      </div>
    </div>
  );
}