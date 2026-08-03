"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { DOC_TYPES, docTypeMeta, STATUS_META } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/money";
import type { Tables, DocStatus } from "@/lib/database.types";

type DocRow = Pick<
  Tables<"documents">,
  "id" | "title" | "doc_type" | "document_number" | "status" | "total_amount" | "currency" | "created_at"
>;

export default function DashboardPage() {
  const { org } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [totals, setTotals] = useState({ count: 0, invoiced: 0, paid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!org) return;
    const supabase = createClient();
    (async () => {
      const [{ data: recent }, { count }, { data: invoices }] = await Promise.all([
        supabase
          .from("documents")
          .select("id, title, doc_type, document_number, status, total_amount, currency, created_at")
          .eq("org_id", org.id)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("org_id", org.id),
        supabase.from("documents").select("total_amount, status").eq("org_id", org.id).eq("doc_type", "INVOICE"),
      ]);
      const invoiced = (invoices ?? []).reduce((s, d) => s + Number(d.total_amount), 0);
      const paid = (invoices ?? [])
        .filter((d) => d.status === "PAID")
        .reduce((s, d) => s + Number(d.total_amount), 0);
      setDocs((recent as DocRow[]) ?? []);
      setTotals({ count: count ?? 0, invoiced, paid });
      setLoading(false);
    })();
  }, [org]);

  if (!org) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-ink-soft">Here&apos;s what&apos;s happening in {org.name}.</p>
        </div>
        <Link href="/documents/new" className="btn-primary">+ New document</Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Documents" value={loading ? "—" : String(totals.count)} />
        <Stat label="Total invoiced" value={loading ? "—" : formatMoney(totals.invoiced, org.currency)} />
        <Stat label="Collected (paid)" value={loading ? "—" : formatMoney(totals.paid, org.currency)} accent />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink-muted">Create a document</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOC_TYPES.map((d) => (
          <Link
            key={d.type}
            href={`/documents/new?type=${d.type}`}
            className="card flex items-start gap-3 p-4 transition hover:shadow-card"
          >
            <span className="text-2xl">{d.icon}</span>
            <div>
              <p className="font-semibold text-ink">{d.label}</p>
              <p className="text-xs text-ink-soft">{d.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Recent documents</h2>
        <Link href="/documents" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
      </div>

      {docs.length > 0 ? (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => <DocRowLine key={d.id} d={d} />)}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="mt-3 card grid place-items-center gap-2 p-10 text-center">
            <p className="text-3xl">📄</p>
            <p className="font-semibold text-ink">No documents yet</p>
            <p className="text-sm text-ink-soft">Create your first invoice or letter to get started.</p>
            <Link href="/documents/new" className="btn-primary mt-2">+ New document</Link>
          </div>
        )
      )}
    </div>
  );
}

function DocRowLine({ d }: { d: DocRow }) {
  const meta = docTypeMeta(d.doc_type);
  const st = STATUS_META[d.status as DocStatus];
  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3">
        <Link href={`/documents/view?id=${d.id}`} className="font-medium text-ink hover:text-brand-600">
          {d.title}
        </Link>
        <div className="text-xs text-ink-muted">{d.document_number}</div>
      </td>
      <td className="px-4 py-3 text-ink-soft">{meta.icon} {meta.label}</td>
      <td className="px-4 py-3"><span className={`chip ${st.className}`}>{st.label}</span></td>
      <td className="px-4 py-3 text-right font-medium">
        {meta.financial ? formatMoney(Number(d.total_amount), d.currency) : "—"}
      </td>
      <td className="px-4 py-3 text-right text-ink-muted">{formatDate(d.created_at)}</td>
    </tr>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`card p-5 ${accent ? "bg-ink text-white" : ""}`}>
      <p className={`text-xs uppercase tracking-wide ${accent ? "text-slate-300" : "text-ink-muted"}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
