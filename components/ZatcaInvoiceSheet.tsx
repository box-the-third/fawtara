import { CURRENCIES } from "@/lib/constants";
import type { SheetData } from "@/components/DocumentSheet";

// Bilingual (Arabic + English) ZATCA-style tax invoice, matching the reference
// layout: navy section headers, two bordered tables, a highlighted total due.
const NAVY = "#29567F";
const BORDER = "#d1d5db";

function fmt(n: number): string {
  return (Number(n) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function curSymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}
function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Inline bilingual label: bold English / Arabic. */
function BL({ en, ar }: { en: string; ar: string }) {
  return (
    <span>
      <b>{en}</b> / <span className="font-arabic">{ar}</span>
    </span>
  );
}

function SectionTitle({ en, ar }: { en: string; ar: string }) {
  return (
    <h2 className="mb-3 mt-7 text-center text-[15px] font-bold" style={{ color: NAVY }}>
      {en} / <span className="font-arabic">{ar}</span>
    </h2>
  );
}

export default function ZatcaInvoiceSheet({ data }: { data: SheetData }) {
  const cur = curSymbol(data.currency);
  const rate = data.taxRate;
  const buyerName = data.client?.companyName || data.client?.name || "";
  const sellerCr = data.sellerCr || "";
  const sellerPhone = data.sellerPhone || "";

  return (
    <div className="print-sheet card mx-auto bg-white p-[16mm] text-[12px] leading-relaxed text-ink shadow-card">
      {/* Title */}
      <h1 className="text-center text-[26px] font-extrabold" style={{ color: NAVY }}>
        TAX INVOICE / <span className="font-arabic">فاتورة ضريبية</span>
      </h1>

      {/* Header info */}
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-x-10 gap-y-2.5">
        <div className="space-y-2.5">
          <div>
            <BL en="Invoice No:" ar="رقم الفاتورة" /> {data.documentNumber}
          </div>
          <div>
            <BL en="Seller VAT" ar="الرقم الضريبي للمنشأة:" /> {data.org.vatNumber || "—"}
          </div>
        </div>
        <div className="space-y-2.5 text-right">
          <div>
            <BL en="Date:" ar="التاريخ" /> {shortDate(data.createdAt)}
          </div>
          <div>
            <BL en="CR No:" ar="رقم السجل التجاري" /> {sellerCr || "—"}
          </div>
        </div>
      </div>

      {/* Parties */}
      <SectionTitle en="Parties Details" ar="تفاصيل الأطراف" />
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ background: NAVY, color: "#fff" }}>
            <th className="border p-2.5 text-center font-semibold" style={{ borderColor: BORDER }}>
              <BL en="Buyer Details" ar="بيانات العميل" />
            </th>
            <th className="border p-2.5 text-center font-semibold" style={{ borderColor: BORDER }}>
              <BL en="Seller Details" ar="بيانات المورد" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Cell><BL en="Name:" ar="الاسم" /> {buyerName}</Cell>
            <Cell><BL en="Name:" ar="الاسم" /> {data.org.name}</Cell>
          </tr>
          <tr>
            <Cell><BL en="Address:" ar="العنوان" /> {data.client?.address || "—"}</Cell>
            <Cell><BL en="Phone:" ar="الهاتف" /> {sellerPhone || "—"}</Cell>
          </tr>
          <tr>
            <Cell><BL en="VAT No:" ar="الرقم الضريبي" /> {data.client?.vatNumber || "—"}</Cell>
            <Cell> </Cell>
          </tr>
          <tr>
            <Cell><BL en="CR No:" ar="رقم السجل التجاري" /> {data.client?.crNumber || "—"}</Cell>
            <Cell> </Cell>
          </tr>
        </tbody>
      </table>

      {/* Products */}
      <SectionTitle en="Products or Services" ar="المنتجات أو الخدمات" />
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ background: NAVY, color: "#fff" }}>
            <Th w="8%"><BL en="No." ar="الرقم" /></Th>
            <Th><BL en="Description" ar="البيان /الوصف" /></Th>
            <Th w="10%"><BL en="Qty" ar="الكمية" /></Th>
            <Th w="15%"><BL en="Unit Price" ar="سعر الوحدة" /></Th>
            <Th w="18%"><BL en={`VAT (${rate}%)`} ar={`ضريبة القيمة المضافة (${rate}%)`} /></Th>
            <Th w="18%"><BL en="Total (Inc. VAT)" ar="الإجمالي شامل الضريبة" /></Th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => {
            const sub = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
            const vat = (sub * rate) / 100;
            return (
              <tr key={i} className="prevent-break">
                <Td className="text-center">{i + 1}</Td>
                <Td>{it.description || "—"}</Td>
                <Td className="text-center">{it.quantity}</Td>
                <Td className="text-center">{fmt(it.unitPrice)}</Td>
                <Td className="text-center">{fmt(vat)}</Td>
                <Td className="text-center">{fmt(sub + vat)}</Td>
              </tr>
            );
          })}
          {data.items.length === 0 && (
            <tr>
              <Td className="text-center" colSpan={6}>—</Td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="ml-auto mt-8 max-w-md space-y-2 text-[12px]">
        <div className="flex items-center justify-between px-2">
          <BL en="Taxable Amount:" ar="المجموع الخاضع للضريبة" />
          <span>{fmt(data.subtotal)} {cur}</span>
        </div>
        <div className="flex items-center justify-between px-2">
          <BL en="VAT Amount:" ar={`قيمة الضريبة (${rate}%)`} />
          <span>{fmt(data.taxAmount)} {cur}</span>
        </div>
        <div
          className="flex items-center justify-between px-2 py-2 font-bold"
          style={{ background: "#f1f1f1" }}
        >
          <BL en="Total Amount Due:" ar="الإجمالي المستحق" />
          <span style={{ color: NAVY }}>{fmt(data.total)} {cur}</span>
        </div>
      </div>
    </div>
  );
}

function Cell({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return (
    <td className="border p-2.5 align-top" style={{ borderColor: BORDER }} colSpan={colSpan}>
      {children}
    </td>
  );
}
function Th({ children, w }: { children: React.ReactNode; w?: string }) {
  return (
    <th className="border p-2.5 text-center font-semibold" style={{ borderColor: BORDER, width: w }}>
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={`border p-2.5 ${className}`} style={{ borderColor: BORDER }} colSpan={colSpan}>
      {children}
    </td>
  );
}
