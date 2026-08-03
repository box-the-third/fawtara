export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Totals = {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** The VAT engine: subtotal → tax → grand total. Single source of truth. */
export function computeTotals(items: LineItem[], taxRate: number): Totals {
  const subtotal = round2(
    items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0),
  );
  const taxAmount = round2(subtotal * (Number(taxRate) || 0) / 100);
  const total = round2(subtotal + taxAmount);
  return { subtotal, taxRate: Number(taxRate) || 0, taxAmount, total };
}

export function lineTotal(item: LineItem): number {
  return round2((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0));
}

/** Locale-aware currency formatting; RTL scripts render numerals correctly. */
export function formatMoney(amount: number, currency = "SAR", rtl = false): string {
  const locale = rtl ? "ar-SA" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${(Number(amount) || 0).toFixed(2)} ${currency}`;
  }
}

export function formatDate(iso: string, rtl = false): string {
  const locale = rtl ? "ar-SA" : "en-GB";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}
