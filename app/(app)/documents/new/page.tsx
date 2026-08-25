"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import DocumentBuilder from "@/components/DocumentBuilder";
import type { DocType, Tables } from "@/lib/database.types";

const VALID: DocType[] = ["INVOICE", "OFFER_LETTER", "NOC", "POLICY_LETTER", "TENDER", "CUSTOM"];

type Client = Pick<Tables<"clients">, "id" | "name" | "company_name" | "vat_number" | "cr_number" | "address" | "logo_url">;
type Template = Pick<Tables<"templates">, "id" | "doc_type" | "title" | "is_default">;
type Product = Pick<Tables<"products">, "id" | "name" | "description" | "unit_price">;

function NewDocumentInner() {
  const { org } = useAuth();
  const search = useSearchParams();
  const initialType = (VALID.includes(search.get("type") as DocType)
    ? search.get("type")
    : "INVOICE") as DocType;

  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!org) return;
    const supabase = createClient();
    (async () => {
      const [{ data: c }, { data: t }, { data: p }] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name, company_name, vat_number, cr_number, address, logo_url")
          .eq("org_id", org.id)
          .order("created_at", { ascending: false }),
        supabase.from("templates").select("id, doc_type, title, is_default"),
        supabase
          .from("products")
          .select("id, name, description, unit_price")
          .eq("org_id", org.id)
          .order("name", { ascending: true }),
      ]);
      setClients((c as Client[]) ?? []);
      setTemplates((t as Template[]) ?? []);
      setProducts((p as Product[]) ?? []);
      setReady(true);
    })();
  }, [org]);

  if (!org) return null;

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 text-sm text-ink-muted">
        <Link href="/documents" className="hover:text-ink">Documents</Link>
        <span>/</span>
        <span className="text-ink">New</span>
      </div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink">Create a document</h1>

      {ready ? (
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
          initialType={initialType}
        />
      ) : (
        <p className="text-sm text-ink-muted">Loading…</p>
      )}
    </div>
  );
}

export default function NewDocumentPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
      <NewDocumentInner />
    </Suspense>
  );
}
