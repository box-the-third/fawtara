"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import DocumentBuilder, { type ExistingDoc } from "@/components/DocumentBuilder";
import type { Tables } from "@/lib/database.types";

type Client = Pick<Tables<"clients">, "id" | "name" | "company_name" | "vat_number" | "address" | "logo_url">;
type Template = Pick<Tables<"templates">, "id" | "doc_type" | "title" | "is_default">;
type Product = Pick<Tables<"products">, "id" | "name" | "description" | "unit_price">;

function EditDocumentInner() {
  const { org } = useAuth();
  const id = useSearchParams().get("id");

  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [existing, setExisting] = useState<ExistingDoc | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    if (!org || !id) return;
    const supabase = createClient();
    (async () => {
      const [{ data: c }, { data: t }, { data: p }, { data: doc }] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name, company_name, vat_number, address, logo_url")
          .eq("org_id", org.id)
          .order("created_at", { ascending: false }),
        supabase.from("templates").select("id, doc_type, title, is_default"),
        supabase
          .from("products")
          .select("id, name, description, unit_price")
          .eq("org_id", org.id)
          .order("name", { ascending: true }),
        supabase.from("documents").select("*").eq("id", id).eq("org_id", org.id).single(),
      ]);
      setClients((c as Client[]) ?? []);
      setTemplates((t as Template[]) ?? []);
      setProducts((p as Product[]) ?? []);

      if (!doc) {
        setState("notfound");
        return;
      }

      const { data: items } = await supabase
        .from("document_items")
        .select("description, quantity, unit_price, sort_order")
        .eq("document_id", doc.id)
        .order("sort_order", { ascending: true });

      const payload = (doc.payload ?? {}) as { recipient?: string; body?: string };
      setExisting({
        id: doc.id,
        docType: doc.doc_type,
        title: doc.title,
        clientId: doc.client_id,
        currency: doc.currency,
        taxRate: Number(doc.tax_rate),
        isRtl: doc.is_rtl,
        userLogoUrl: doc.user_logo_url,
        clientLogoUrl: doc.client_logo_url,
        items: (items ?? []).map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unit_price),
        })),
        recipient: payload.recipient ?? "",
        body: payload.body ?? "",
      });
      setState("ready");
    })();
  }, [org, id]);

  if (!org) return null;
  if (state === "loading") return <p className="text-sm text-ink-muted">Loading document…</p>;
  if (state === "notfound" || !existing)
    return (
      <div className="card grid place-items-center gap-2 p-12 text-center">
        <p className="text-3xl">🔍</p>
        <p className="font-semibold text-ink">Document not found</p>
        <Link href="/documents" className="btn-primary mt-2">Back to documents</Link>
      </div>
    );

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 text-sm text-ink-muted">
        <Link href="/documents" className="hover:text-ink">Documents</Link>
        <span>/</span>
        <Link href={`/documents/view?id=${existing.id}`} className="hover:text-ink">{existing.title}</Link>
        <span>/</span>
        <span className="text-ink">Edit</span>
      </div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink">Edit document</h1>

      <DocumentBuilder
        org={{
          id: org.id,
          name: org.name,
          logo_url: org.logo_url,
          vat_number: org.vat_number,
          currency: org.currency,
          tax_rate: org.tax_rate,
          is_rtl: org.is_rtl,
        }}
        clients={clients}
        templates={templates}
        products={products}
        initialType={existing.docType}
        existing={existing}
      />
    </div>
  );
}

export default function EditDocumentPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
      <EditDocumentInner />
    </Suspense>
  );
}
