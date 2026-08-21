"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DOC_TYPES, docTypeMeta, CURRENCIES } from "@/lib/constants";
import { computeTotals, lineTotal, formatMoney } from "@/lib/money";
import DocumentSheet, { type SheetData } from "@/components/DocumentSheet";
import LogoUpload from "@/components/LogoUpload";
import type { DocType, Tables } from "@/lib/database.types";

type Client = Pick<
  Tables<"clients">,
  "id" | "name" | "company_name" | "vat_number" | "address" | "logo_url"
>;
type Template = Pick<Tables<"templates">, "id" | "doc_type" | "title" | "is_default">;
type CatalogProduct = Pick<Tables<"products">, "id" | "name" | "description" | "unit_price">;
type OrgLite = {
  id: string;
  name: string;
  logo_url: string | null;
  vat_number: string | null;
  currency: string;
  tax_rate: number;
  is_rtl: boolean;
};

type Item = { description: string; quantity: number; unitPrice: number };

/** Existing document loaded for editing. */
export type ExistingDoc = {
  id: string;
  docType: DocType;
  title: string;
  clientId: string | null;
  currency: string;
  taxRate: number;
  isRtl: boolean;
  userLogoUrl: string | null;
  clientLogoUrl: string | null;
  items: Item[];
  recipient: string;
  body: string;
  layout: "standard" | "zatca";
  sellerCr: string;
  sellerPhone: string;
};

export default function DocumentBuilder({
  org,
  clients,
  templates,
  products = [],
  initialType,
  existing,
}: {
  org: OrgLite;
  clients: Client[];
  templates: Template[];
  products?: CatalogProduct[];
  initialType: DocType;
  /** When present, the builder edits this document instead of creating one. */
  existing?: ExistingDoc;
}) {
  const router = useRouter();
  const editing = !!existing;
  const [docType, setDocType] = useState<DocType>(existing?.docType ?? initialType);
  const meta = docTypeMeta(docType);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [clientId, setClientId] = useState<string>(existing?.clientId ?? "");
  const [currency, setCurrency] = useState(existing?.currency ?? org.currency);
  const [taxRate, setTaxRate] = useState<number>(existing?.taxRate ?? org.tax_rate);
  const [isRtl, setIsRtl] = useState<boolean>(existing?.isRtl ?? org.is_rtl);
  const [userLogoUrl, setUserLogoUrl] = useState<string | null>(existing?.userLogoUrl ?? org.logo_url);
  const [clientLogoOverride, setClientLogoOverride] = useState<string | null>(
    existing?.clientLogoUrl ?? null,
  );

  const [items, setItems] = useState<Item[]>(
    existing?.items?.length ? existing.items : [{ description: "", quantity: 1, unitPrice: 0 }],
  );
  const [recipient, setRecipient] = useState(existing?.recipient ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [layout, setLayout] = useState<"standard" | "zatca">(existing?.layout ?? "standard");
  const [sellerCr, setSellerCr] = useState(existing?.sellerCr ?? "");
  const [sellerPhone, setSellerPhone] = useState(existing?.sellerPhone ?? "");

  // For new invoices, prefill seller CR/phone from the last one used (per org).
  useEffect(() => {
    if (existing) return;
    try {
      const raw = localStorage.getItem(`fawtara-seller-${org.id}`);
      if (raw) {
        const s = JSON.parse(raw) as { cr?: string; phone?: string };
        if (s.cr) setSellerCr(s.cr);
        if (s.phone) setSellerPhone(s.phone);
      }
    } catch {
      /* ignore */
    }
  }, [existing, org.id]);

  // Remember seller CR/phone once entered so the next invoice is pre-filled.
  useEffect(() => {
    if (layout !== "zatca" || (!sellerCr && !sellerPhone)) return;
    try {
      localStorage.setItem(`fawtara-seller-${org.id}`, JSON.stringify({ cr: sellerCr, phone: sellerPhone }));
    } catch {
      /* ignore */
    }
  }, [layout, sellerCr, sellerPhone, org.id]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const client = clients.find((c) => c.id === clientId) || null;
  const clientLogoUrl = clientLogoOverride ?? client?.logo_url ?? null;
  const totals = useMemo(() => computeTotals(items, taxRate), [items, taxRate]);

  const effectiveTitle =
    title.trim() || `${meta.label}${client ? ` — ${client.company_name || client.name}` : ""}`;

  const sheet: SheetData = {
    docType,
    documentNumber: "PREVIEW",
    title: effectiveTitle,
    status: "DRAFT",
    currency,
    isRtl,
    createdAt: new Date().toISOString(),
    org: { name: org.name, logoUrl: userLogoUrl, vatNumber: org.vat_number },
    client: client
      ? {
          name: client.name,
          companyName: client.company_name,
          vatNumber: client.vat_number,
          address: client.address,
        }
      : null,
    userLogoUrl,
    clientLogoUrl,
    items: items.map((it) => ({ ...it, totalPrice: lineTotal(it) })),
    subtotal: totals.subtotal,
    taxRate: totals.taxRate,
    taxAmount: totals.taxAmount,
    total: totals.total,
    payload: { recipient, body },
    layout: docType === "INVOICE" ? layout : "standard",
    sellerCr,
    sellerPhone,
  };

  function setItem(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }
  function removeItem(i: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }
  function addFromCatalog(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    const line: Item = {
      description: p.description ? `${p.name} — ${p.description}` : p.name,
      quantity: 1,
      unitPrice: Number(p.unit_price),
    };
    setItems((prev) => {
      const last = prev[prev.length - 1];
      // Fill the trailing empty row if there is one, otherwise append.
      if (last && !last.description.trim() && !last.unitPrice) {
        return [...prev.slice(0, -1), line];
      }
      return [...prev, line];
    });
  }

  const financial = meta.financial;

  function itemRows(documentId: string) {
    return items
      .filter((it) => it.description.trim() || it.unitPrice > 0)
      .map((it, idx) => ({
        document_id: documentId,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        total_price: lineTotal(it),
        sort_order: idx,
      }));
  }

  function docFields(templateId: string | null) {
    return {
      title: effectiveTitle,
      doc_type: docType,
      is_rtl: isRtl,
      currency,
      user_logo_url: userLogoUrl,
      client_logo_url: clientLogoUrl,
      subtotal: financial ? totals.subtotal : 0,
      tax_rate: financial ? totals.taxRate : 0,
      tax_amount: financial ? totals.taxAmount : 0,
      total_amount: financial ? totals.total : 0,
      payload: financial
        ? { layout: docType === "INVOICE" ? layout : "standard", sellerCr, sellerPhone }
        : { recipient, body },
      client_id: clientId || null,
      template_id: templateId,
    };
  }

  async function save() {
    setErr(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const templateId =
        (templates.find((t) => t.doc_type === docType && t.is_default) ||
          templates.find((t) => t.doc_type === docType))?.id ?? null;

      // ── Edit existing document ───────────────────────────────
      if (existing) {
        const { error: upErr } = await supabase
          .from("documents")
          .update(docFields(templateId))
          .eq("id", existing.id);
        if (upErr) throw upErr;

        // Replace line items wholesale.
        const { error: delErr } = await supabase
          .from("document_items")
          .delete()
          .eq("document_id", existing.id);
        if (delErr) throw delErr;

        if (financial) {
          const rows = itemRows(existing.id);
          if (rows.length) {
            const { error: itemsErr } = await supabase.from("document_items").insert(rows);
            if (itemsErr) throw itemsErr;
          }
        }

        router.push(`/documents/view?id=${existing.id}`);
        return;
      }

      // ── Create new document ──────────────────────────────────
      const { data: numData, error: numErr } = await supabase.rpc("next_document_number", {
        p_org: org.id,
        p_type: docType,
      });
      if (numErr) throw numErr;

      const { data: doc, error: docErr } = await supabase
        .from("documents")
        .insert({
          org_id: org.id,
          document_number: numData as string,
          status: "DRAFT",
          ...docFields(templateId),
        })
        .select("id")
        .single();
      if (docErr) throw docErr;

      if (financial) {
        const rows = itemRows(doc.id);
        if (rows.length) {
          const { error: itemsErr } = await supabase.from("document_items").insert(rows);
          if (itemsErr) throw itemsErr;
        }
      }

      router.push(`/documents/view?id=${doc.id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save document");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      {/* ── Form ─────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Doc type */}
        <div className="card p-4">
          <span className="field-label">Document type</span>
          <div className="grid grid-cols-3 gap-2">
            {DOC_TYPES.map((d) => (
              <button
                key={d.type}
                type="button"
                onClick={() => setDocType(d.type)}
                className={`rounded-xl border p-2 text-center text-xs transition ${
                  docType === d.type
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-ink-soft hover:bg-slate-50"
                }`}
              >
                <div className="text-lg">{d.icon}</div>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="card space-y-4 p-4">
          <div>
            <label className="field-label" htmlFor="title">Title</label>
            <input
              id="title"
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={effectiveTitle}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="client">Client</label>
            <select
              id="client"
              className="field-input"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setClientLogoOverride(null);
              }}
            >
              <option value="">— No client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name || c.name}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="mt-1 text-xs text-ink-muted">
                Tip: add clients in the Clients tab for auto-branding.
              </p>
            )}
          </div>

          {!meta.financial && (
            <div>
              <label className="field-label" htmlFor="recipient">Recipient</label>
              <input
                id="recipient"
                className="field-input"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Mr. Ahmed Al-Salem"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="currency">Currency</label>
              <select
                id="currency"
                className="field-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="field-label">Direction</span>
              <button
                type="button"
                onClick={() => setIsRtl((v) => !v)}
                className="field-input flex items-center justify-between font-medium"
              >
                {isRtl ? "RTL · عربي" : "LTR · English"}
                <span className="text-ink-muted">⇄</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice layout (INVOICE only) */}
        {docType === "INVOICE" && (
          <div className="card space-y-3 p-4">
            <p className="text-sm font-semibold text-ink">Invoice layout</p>
            <div className="flex gap-2">
              {([
                ["standard", "Standard"],
                ["zatca", "Bilingual · عربي/EN"],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLayout(val)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    layout === val
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-ink-soft hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {layout === "zatca" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label" htmlFor="sellerCr">Seller CR number</label>
                  <input
                    id="sellerCr"
                    className="field-input"
                    value={sellerCr}
                    onChange={(e) => setSellerCr(e.target.value)}
                    placeholder="7034735410"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="sellerPhone">Company phone</label>
                  <input
                    id="sellerPhone"
                    className="field-input"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="0579812232"
                  />
                </div>
                <p className="col-span-2 text-xs text-ink-muted">
                  The bilingual layout shows seller VAT + CR and buyer name/address/VAT (from the
                  selected client). Remembered for your next invoice.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Branding */}
        <div className="card space-y-4 p-4">
          <p className="text-sm font-semibold text-ink">Dual branding</p>
          <LogoUpload value={userLogoUrl} onChange={setUserLogoUrl} label="Your logo" folder="org-logos" />
          <LogoUpload
            value={clientLogoUrl}
            onChange={setClientLogoOverride}
            label="Client logo"
            folder="client-logos"
          />
        </div>

        {/* Financial: line items */}
        {meta.financial ? (
          <div className="card space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Line items</p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-ink-soft">VAT %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_56px_84px_auto] items-center gap-2">
                  <input
                    className="field-input py-2"
                    placeholder="Description"
                    value={it.description}
                    onChange={(e) => setItem(i, { description: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    className="field-input py-2 text-center"
                    value={it.quantity}
                    onChange={(e) => setItem(i, { quantity: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input py-2 text-right"
                    value={it.unitPrice}
                    onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove line"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={addItem} className="btn-subtle flex-1">+ Add line</button>
              {products.length > 0 && (
                <select
                  aria-label="Add from catalogue"
                  className="field-input flex-1 py-2"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addFromCatalog(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">+ From catalogue…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {formatMoney(Number(p.unit_price), currency)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
              <Row label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
              <Row label={`VAT (${taxRate}%)`} value={formatMoney(totals.taxAmount, currency)} />
              <div className="flex items-center justify-between pt-1 font-bold text-ink">
                <span>Total</span>
                <span>{formatMoney(totals.total, currency)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card space-y-3 p-4">
            <p className="text-sm font-semibold text-ink">Body</p>
            <textarea
              rows={8}
              className="field-input"
              placeholder="Write the letter body… line breaks are preserved."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        )}

        {err && <p className="text-sm text-rose-600">{err}</p>}

        <button onClick={save} disabled={busy} className="btn-primary w-full py-3">
          {busy ? "Saving…" : editing ? "Update document →" : "Save document →"}
        </button>
      </div>

      {/* ── Live preview ─────────────────────────────────────── */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-soft">Live preview</p>
          <span className="chip bg-slate-100 text-ink-muted">A4</span>
        </div>
        <div className="overflow-x-auto rounded-2xl bg-slate-100 p-3 sm:p-4">
          <div className="doc-preview-scale">
            <DocumentSheet data={sheet} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-soft">
      <span>{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
