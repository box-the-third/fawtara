"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import ProductManager from "@/components/ProductManager";
import type { Tables } from "@/lib/database.types";

export default function ProductsPage() {
  const { org } = useAuth();
  const [products, setProducts] = useState<Tables<"products">[] | null>(null);

  useEffect(() => {
    if (!org) return;
    const supabase = createClient();
    supabase
      .from("products")
      .select("*")
      .eq("org_id", org.id)
      .order("name", { ascending: true })
      .then(({ data }) => setProducts(data ?? []));
  }, [org]);

  if (!org) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Products</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your catalogue with fixed pricing. Import from Excel/CSV, then add products to any
          invoice in one click.
        </p>
      </div>
      {products === null ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <ProductManager orgId={org.id} currency={org.currency} initial={products} />
      )}
    </div>
  );
}
