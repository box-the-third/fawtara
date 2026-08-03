import type { DocType, DocStatus } from "@/lib/database.types";

export type DocTypeMeta = {
  type: DocType;
  label: string;
  labelAr: string;
  icon: string;
  description: string;
  /** Invoices carry priced line items + VAT; letters are narrative documents. */
  financial: boolean;
};

export const DOC_TYPES: DocTypeMeta[] = [
  {
    type: "INVOICE",
    label: "Tax Invoice",
    labelAr: "فاتورة ضريبية",
    icon: "🧾",
    description: "VAT/tax invoice with line items and automatic totals.",
    financial: true,
  },
  {
    type: "OFFER_LETTER",
    label: "Offer Letter",
    labelAr: "خطاب عرض",
    icon: "📨",
    description: "Employment offer with role, salary and start date.",
    financial: false,
  },
  {
    type: "NOC",
    label: "No Objection Certificate",
    labelAr: "شهادة عدم ممانعة",
    icon: "✅",
    description: "Certify no objection for travel, transfer or licensing.",
    financial: false,
  },
  {
    type: "POLICY_LETTER",
    label: "Policy Letter",
    labelAr: "خطاب سياسة",
    icon: "📋",
    description: "Internal policy or memo on your letterhead.",
    financial: false,
  },
  {
    type: "TENDER",
    label: "Tender",
    labelAr: "مناقصة",
    icon: "📑",
    description: "Formal tender submission with scope and pricing.",
    financial: true,
  },
  {
    type: "CUSTOM",
    label: "Custom Document",
    labelAr: "مستند مخصص",
    icon: "📄",
    description: "A blank document driven entirely by your template.",
    financial: false,
  },
];

export function docTypeMeta(type: DocType): DocTypeMeta {
  return DOC_TYPES.find((d) => d.type === type) ?? DOC_TYPES[DOC_TYPES.length - 1];
}

export const CURRENCIES = [
  { code: "SAR", label: "Saudi Riyal (SAR)", symbol: "ر.س" },
  { code: "AED", label: "UAE Dirham (AED)", symbol: "د.إ" },
  { code: "QAR", label: "Qatari Riyal (QAR)", symbol: "ر.ق" },
  { code: "KWD", label: "Kuwaiti Dinar (KWD)", symbol: "د.ك" },
  { code: "BHD", label: "Bahraini Dinar (BHD)", symbol: ".د.ب" },
  { code: "OMR", label: "Omani Rial (OMR)", symbol: "ر.ع" },
  { code: "USD", label: "US Dollar (USD)", symbol: "$" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€" },
];

export const STATUS_META: Record<DocStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  ISSUED: { label: "Issued", className: "bg-brand-100 text-brand-700" },
  PAID: { label: "Paid", className: "bg-emerald-100 text-emerald-700" },
  VOID: { label: "Void", className: "bg-rose-100 text-rose-700" },
};
