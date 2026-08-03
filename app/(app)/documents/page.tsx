"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { docTypeMeta, STATUS_META } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/money";
import type { Tables, DocStatus } from "@/lib/database.types";

type DocRow = Pick<
  Tables<"documents">,
  "id" | "title" | "doc_type" | "document_number" | "status" | "total_amount" | "currency" | "created_at"
>;

export default function DocumentsPage() {
  const { org } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!org) return;
    const supabase = createClient();
    supabase
      .from("documents")
      .select("id, title, doc_type, document_number, status, total_amount, currency, created_at")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDocs((data as DocRow[]) ?? []);
        setLoading(false);
      });
  }, [org]);

  if (!org) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Documents</h1>
        <Link href="/documents/new" className="btn-primary">+ New</Link>
      </div>

      {docs.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
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
              {docs.map((d) => {
                const meta = docTypeMeta(d.doc_type);
                const st = STATUS_META[d.status as DocStatus];
                return (
                  <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
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
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="mt-6 card grid place-items-center gap-2 p-12 text-center">
            <p className="text-3xl">📄</p>
            <p className="font-semibold text-ink">No documents yet</p>
            <p className="text-sm text-ink-soft">Your invoices, tenders and letters will live here.</p>
            <Link href="/documents/new" className="btn-primary mt-2">Create your first document</Link>
          </div>
        )
      )}
    </div>
  );
}
