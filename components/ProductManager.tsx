"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/money";
import type { Tables } from "@/lib/database.types";

type Product = Tables<"products">;
type ParsedRow = { name: string; unitPrice: number; description: string };

export default function ProductManager({
  orgId,
  currency,
  initial,
}: {
  orgId: string;
  currency: string;
  initial: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ── Manual add ───────────────────────────────────────────────
  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    if (!name) return;
    setErr(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .insert({
          org_id: orgId,
          name,
          description: String(fd.get("description") || "").trim() || null,
          unit_price: Number(fd.get("unit_price") || 0),
        })
        .select("*")
        .single();
      if (error) throw error;
      setProducts((p) => [data, ...p]);
      form.reset();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not add product");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    const prev = products;
    setProducts((p) => p.filter((x) => x.id !== id));
    const { error } = await createClient().from("products").delete().eq("id", id);
    if (error) setProducts(prev); // revert on failure
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* List */}
      <div>
        <ImportPanel
          orgId={orgId}
          onImported={(rows) => setProducts((p) => [...rows, ...p])}
        />

        {products.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3 text-right">Unit price</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{p.name}</p>
                      {p.description && <p className="text-xs text-ink-muted">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatMoney(Number(p.unit_price), currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(p.id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 card grid place-items-center gap-2 p-12 text-center">
            <p className="text-3xl">📦</p>
            <p className="font-semibold text-ink">No products yet</p>
            <p className="text-sm text-ink-soft">Import an Excel/CSV file or add one by hand.</p>
          </div>
        )}
      </div>

      {/* Manual add */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <form onSubmit={addProduct} className="card space-y-4 p-5">
          <p className="font-semibold text-ink">Add a product</p>
          <div>
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" name="name" required className="field-input" placeholder="3-Phase Circuit Breaker" />
          </div>
          <div>
            <label className="field-label" htmlFor="unit_price">Unit price ({currency})</label>
            <input id="unit_price" name="unit_price" type="number" step="0.01" min="0" required className="field-input" placeholder="1150.00" />
          </div>
          <div>
            <label className="field-label" htmlFor="description">Description (optional)</label>
            <input id="description" name="description" className="field-input" placeholder="150 A" />
          </div>
          {err && <p className="text-sm text-rose-600">{err}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Saving…" : "Add product"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Excel / CSV import ─────────────────────────────────────────
function ImportPanel({ orgId, onImported }: { orgId: string; onImported: (rows: Product[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setBusy(true);
    setFileName(file.name);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      if (!raw.length) throw new Error("The file has no rows.");

      const headers = Object.keys(raw[0]);
      const nameKey = headers.find((h) => /name|product|item|service/i.test(h)) || headers[0];
      const priceKey = headers.find((h) => /price|amount|rate|cost|unit/i.test(h));
      const descKey = headers.find((h) => /desc|detail|note/i.test(h) && h !== nameKey);

      const parsed: ParsedRow[] = raw
        .map((r) => ({
          name: String(r[nameKey] ?? "").trim(),
          unitPrice:
            Number(String(priceKey ? r[priceKey] : "0").replace(/[^0-9.\-]/g, "")) || 0,
          description: descKey ? String(r[descKey] ?? "").trim() : "",
        }))
        .filter((p) => p.name);

      if (!parsed.length) throw new Error("Couldn't find a product name column.");
      setRows(parsed);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not read that file.");
      setRows(null);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function confirmImport() {
    if (!rows?.length) return;
    setBusy(true);
    setErr(null);
    try {
      const supabase = createClient();
      const payload = rows.map((r) => ({
        org_id: orgId,
        name: r.name,
        description: r.description || null,
        unit_price: r.unitPrice,
      }));
      const { data, error } = await supabase.from("products").insert(payload).select("*");
      if (error) throw error;
      onImported((data ?? []) as Product[]);
      setRows(null);
      setFileName("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  const templateHref =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent("Name,Price,Description\n3-Phase Circuit Breaker,1150,150 A\nDB Box,450,\nInstallation Fees,1399.90,\n");

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Import from Excel / CSV</p>
          <p className="text-xs text-ink-muted">
            Columns: <b>Name</b>, <b>Price</b>, optional <b>Description</b>. Accepts .xlsx, .xls, .csv.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={templateHref} download="fawtara-products-template.csv" className="btn-subtle">
            Template
          </a>
          <label className="btn-primary cursor-pointer">
            {busy && !rows ? "Reading…" : "Choose file"}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        </div>
      </div>

      {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}

      {rows && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              {rows.length} product{rows.length === 1 ? "" : "s"} found in {fileName}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setRows(null)} className="text-sm text-ink-muted hover:text-ink">
                Cancel
              </button>
              <button onClick={confirmImport} disabled={busy} className="btn-primary">
                {busy ? "Importing…" : `Import ${rows.length}`}
              </button>
            </div>
          </div>
          <div className="mt-2 max-h-40 overflow-auto rounded-lg bg-white">
            <table className="w-full text-sm">
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-1.5">{r.name}</td>
                    <td className="px-3 py-1.5 text-ink-muted">{r.description}</td>
                    <td className="px-3 py-1.5 text-right font-medium">{r.unitPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 && (
              <p className="px-3 py-1.5 text-xs text-ink-muted">…and {rows.length - 50} more</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
