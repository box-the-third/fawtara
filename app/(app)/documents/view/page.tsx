"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { docTypeMeta } from "@/lib/constants";
import DocumentSheet, { type SheetData } from "@/components/DocumentSheet";
import DocumentToolbar from "@/components/DocumentToolbar";
import type { DocStatus } from "@/lib/database.types";

function DocumentViewInner() {
  const { org } = useAuth();
  const id = useSearchParams().get("id");
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [meta, setMeta] = useState<{ docId: string; status: DocStatus; number: string; financial: boolean }>({
    docId: "",
    status: "DRAFT",
    number: "",
    financial: false,
  });
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    if (!org || !id) return;
    const supabase = createClient();
    (async () => {
      const { data: doc } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .eq("org_id", org.id)
        .single();
      if (!doc) {
        setState("notfound");
        return;
      }
      const [{ data: items }, clientRes] = await Promise.all([
        supabase
          .from("document_items")
          .select("description, quantity, unit_price, total_price, sort_order")
          .eq("document_id", doc.id)
          .order("sort_order", { ascending: true }),
        doc.client_id
          ? supabase
              .from("clients")
              .select("name, company_name, vat_number, cr_number, address")
              .eq("id", doc.client_id)
              .single()
          : Promise.resolve({ data: null }),
      ]);
      const m = docTypeMeta(doc.doc_type);
      const payload = (doc.payload ?? {}) as {
        recipient?: string;
        body?: string;
        layout?: "standard" | "zatca";
        sellerCr?: string;
        sellerPhone?: string;
      };
      const clientRow = clientRes.data as
        | {
            name: string;
            company_name: string | null;
            vat_number: string | null;
            cr_number: string | null;
            address: string | null;
          }
        | null;

      setSheet({
        docType: doc.doc_type,
        documentNumber: doc.document_number,
        title: doc.title,
        status: doc.status,
        currency: doc.currency,
        isRtl: doc.is_rtl,
        createdAt: doc.created_at,
        org: { name: org.name, logoUrl: doc.user_logo_url ?? org.logo_url, vatNumber: org.vat_number },
        client: clientRow
          ? {
              name: clientRow.name,
              companyName: clientRow.company_name,
              vatNumber: clientRow.vat_number,
              address: clientRow.address,
              crNumber: clientRow.cr_number,
            }
          : null,
        userLogoUrl: doc.user_logo_url ?? org.logo_url,
        clientLogoUrl: doc.client_logo_url,
        items: (items ?? []).map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unit_price),
          totalPrice: Number(it.total_price),
        })),
        subtotal: Number(doc.subtotal),
        taxRate: Number(doc.tax_rate),
        taxAmount: Number(doc.tax_amount),
        total: Number(doc.total_amount),
        payload,
        layout: payload.layout ?? "standard",
        sellerCr: payload.sellerCr ?? "",
        sellerPhone: payload.sellerPhone ?? "",
      });
      setMeta({ docId: doc.id, status: doc.status, number: doc.document_number, financial: m.financial });
      setState("ready");
    })();
  }, [org, id]);

  if (!org) return null;
  if (state === "loading") return <p className="text-sm text-ink-muted">Loading document…</p>;
  if (state === "notfound" || !sheet)
    return (
      <div className="card grid place-items-center gap-2 p-12 text-center">
        <p className="text-3xl">🔍</p>
        <p className="font-semibold text-ink">Document not found</p>
        <Link href="/documents" className="btn-primary mt-2">Back to documents</Link>
      </div>
    );

  return (
    <div>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <Link href="/documents" className="hover:text-ink">Documents</Link>
          <span>/</span>
          <span className="text-ink">{meta.number}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/documents" className="btn-ghost">← All</Link>
          <Link href={`/documents/edit?id=${meta.docId}`} className="btn-ghost">✎ Edit</Link>
          <DocumentToolbar documentId={meta.docId} status={meta.status} financial={meta.financial} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-slate-100 p-3 sm:p-8">
        <div className="doc-preview-fit">
          <DocumentSheet data={sheet} />
        </div>
      </div>
    </div>
  );
}

export default function DocumentViewPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
      <DocumentViewInner />
    </Suspense>
  );
}
