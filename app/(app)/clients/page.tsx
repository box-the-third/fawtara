"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import ClientManager from "@/components/ClientManager";
import type { Tables } from "@/lib/database.types";

export default function ClientsPage() {
  const { org } = useAuth();
  const [clients, setClients] = useState<Tables<"clients">[] | null>(null);

  useEffect(() => {
    if (!org) return;
    const supabase = createClient();
    supabase
      .from("clients")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setClients(data ?? []));
  }, [org]);

  if (!org) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Clients</h1>
        <p className="mt-1 text-sm text-ink-soft">
          The people and companies you bill and write to. Their logo enables dual-branding.
        </p>
      </div>
      {clients === null ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <ClientManager orgId={org.id} initial={clients} />
      )}
    </div>
  );
}
