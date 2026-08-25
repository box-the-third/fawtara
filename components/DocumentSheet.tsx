import type { DocType, DocStatus } from "@/lib/database.types";
import { docTypeMeta } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/money";
import ZatcaInvoiceSheet from "@/components/ZatcaInvoiceSheet";

export type SheetItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type SheetData = {
  docType: DocType;
  documentNumber: string;
  title: string;
  status?: DocStatus;
  currency: string;
  isRtl: boolean;
  createdAt: string;
  org: { name: string; logoUrl: string | null; vatNumber: string | null };
  client: {
    name: string;
    companyName: string | null;
    vatNumber: string | null;
    address: string | null;
    crNumber?: string | null;
  } | null;
  userLogoUrl: string | null;
  clientLogoUrl: string | null;
  items: SheetItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  payload: { recipient?: string; body?: string; salary?: string; role?: string };
  /** Invoice layout style. Defaults to the standard single-language sheet. */
  layout?: "standard" | "zatca";
  /** ZATCA layout only: seller commercial-registration number & phone. */
  sellerCr?: string;
  sellerPhone?: string;
};

const T = {
  ar: {
    invoiceFor: "فاتورة إلى",
    number: "رقم المستند",
    date: "التاريخ",
    vat: "الرقم الضريبي",
    description: "الوصف",
    qty: "الكمية",
    unit: "سعر الوحدة",
    lineTotal: "الإجمالي",
    subtotal: "المجموع الفرعي",
    tax: "ضريبة القيمة المضافة",
    total: "الإجمالي المستحق",
    to: "إلى",
    signature: "التوقيع",
    thanks: "شكراً لتعاملكم معنا.",
  },
  en: {
    invoiceFor: "Bill to",
    number: "Document No.",
    date: "Date",
    vat: "VAT No.",
    description: "Description",
    qty: "Qty",
    unit: "Unit price",
    lineTotal: "Total",
    subtotal: "Subtotal",
    tax: "VAT",
    total: "Total due",
    to: "To",
    signature: "Signature",
    thanks: "Thank you for your business.",
  },
};

export default function DocumentSheet({ data }: { data: SheetData }) {
  // Bilingual ZATCA layout is an alternative style for tax invoices.
  if (data.layout === "zatca" && data.docType === "INVOICE") {
    return <ZatcaInvoiceSheet data={data} />;
  }

  const meta = docTypeMeta(data.docType);
  const dir = data.isRtl ? "rtl" : "ltr";
  const t = data.isRtl ? T.ar : T.en;
  const cur = data.currency;
  const rtl = data.isRtl;

  return (
    <div dir={dir} className="print-sheet card mx-auto p-[14mm] text-[13px] text-ink shadow-card">
      {/* Header — dual branding */}
      <header className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          {data.userLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.userLogoUrl} alt="" className="max-h-16 w-auto max-w-[170px] object-contain" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white">
              {data.org.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-base font-bold">{data.org.name}</p>
            {data.org.vatNumber && (
              <p className="text-xs text-ink-muted">
                {t.vat}: {data.org.vatNumber}
              </p>
            )}
          </div>
        </div>

        <div className={rtl ? "text-left" : "text-right"} dir="ltr">
          <p className="text-lg font-extrabold uppercase tracking-wide text-brand-700">
            {rtl ? meta.labelAr : meta.label}
          </p>
          <p className="text-xs text-ink-muted">
            {t.number}: <span className="font-semibold text-ink">{data.documentNumber}</span>
          </p>
          <p className="text-xs text-ink-muted">
            {t.date}: {formatDate(data.createdAt, rtl)}
          </p>
        </div>

        {data.clientLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.clientLogoUrl} alt="" className="max-h-16 w-auto max-w-[170px] object-contain" />
        )}
      </header>

      {/* Recipient / client block */}
      {(data.client || data.payload.recipient) && (
        <section className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {meta.financial ? t.invoiceFor : t.to}
          </p>
          {data.client ? (
            <div className="mt-1">
              <p className="font-semibold">{data.client.companyName || data.client.name}</p>
              {data.client.companyName && <p className="text-ink-soft">{data.client.name}</p>}
              {data.client.vatNumber && (
                <p className="text-xs text-ink-muted">{t.vat}: {data.client.vatNumber}</p>
              )}
              {data.client.address && (
                <p className="whitespace-pre-line text-xs text-ink-muted">{data.client.address}</p>
              )}
            </div>
          ) : (
            <p className="mt-1 font-semibold">{data.payload.recipient}</p>
          )}
        </section>
      )}

      {/* Body: financial table OR narrative letter */}
      {meta.financial ? (
        <section className="mt-6">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50 text-ink-soft">
                <th className={`px-3 py-2 font-semibold ${rtl ? "text-right" : "text-left"}`}>{t.description}</th>
                <th className="px-3 py-2 text-center font-semibold">{t.qty}</th>
                <th className={`px-3 py-2 font-semibold ${rtl ? "text-left" : "text-right"}`}>{t.unit}</th>
                <th className={`px-3 py-2 font-semibold ${rtl ? "text-left" : "text-right"}`}>{t.lineTotal}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, i) => (
                <tr key={i} className="prevent-break border-b border-slate-100">
                  <td className={`px-3 py-2.5 ${rtl ? "text-right" : "text-left"}`}>{it.description || "—"}</td>
                  <td className="px-3 py-2.5 text-center">{it.quantity}</td>
                  <td className={`px-3 py-2.5 ${rtl ? "text-left" : "text-right"}`} dir="ltr">
                    {formatMoney(it.unitPrice, cur, rtl)}
                  </td>
                  <td className={`px-3 py-2.5 font-medium ${rtl ? "text-left" : "text-right"}`} dir="ltr">
                    {formatMoney(it.totalPrice, cur, rtl)}
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-ink-muted">
                    No line items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className={`mt-5 flex ${rtl ? "justify-start" : "justify-end"}`}>
            <div className="w-64 shrink-0 prevent-break" dir="ltr">
              <Row label={t.subtotal} value={formatMoney(data.subtotal, cur, rtl)} />
              <Row label={`${t.tax} (${data.taxRate}%)`} value={formatMoney(data.taxAmount, cur, rtl)} />
              <div className="mt-1 flex items-center justify-between rounded-lg bg-brand-600 px-3 py-2.5 text-white">
                <span className="text-sm font-semibold">{t.total}</span>
                <span className="text-base font-bold">{formatMoney(data.total, cur, rtl)}</span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 leading-7">
          <h2 className="mb-3 text-lg font-bold">{data.title}</h2>
          <p className="whitespace-pre-line text-ink-soft">
            {data.payload.body || "Document body will appear here…"}
          </p>
          <div className="mt-16 w-56 border-t border-slate-300 pt-1 text-sm text-ink-muted">
            {t.signature}
          </div>
        </section>
      )}

      <footer className="mt-8 border-t border-slate-200 pt-3 text-center text-[11px] text-ink-muted">
        {meta.financial ? t.thanks : ""} · {data.org.name}
      </footer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
