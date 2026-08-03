"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LogoUpload from "@/components/LogoUpload";
import type { Tables } from "@/lib/database.types";

type Client = Tables<"clients">;

export default function ClientManager({ orgId, initial }: { orgId: string; initial: Client[] }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initial);
  const [open, setOpen] = useState(initial.length === 0);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setErr(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .insert({
          org_id: orgId,
          name: String(fd.get("name") || "").trim(),
          company_name: String(fd.get("company_name") || "").trim() || null,
          email: String(fd.get("email") || "").trim() || null,
          phone: String(fd.get("phone") || "").trim() || null,
          vat_number: String(fd.get("vat_number") || "").trim() || null,
          address: String(fd.get("address") || "").trim() || null,
          logo_url: logoUrl,
        })
        .select("*")
        .single();
      if (error) throw error;
      setClients((prev) => [data, ...prev]);
      form.reset();
      setLogoUrl(null);
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not add client");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* List */}
      <div>
        {clients.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {clients.map((c) => (
              <div key={c.id} className="card flex items-start gap-3 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-sm font-bold text-ink-soft">
                  {c.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo_url} alt="" className="h-full w-full object-contain" />
                  ) : (
                    (c.company_name || c.name).charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{c.company_name || c.name}</p>
                  {c.company_name && <p className="truncate text-sm text-ink-soft">{c.name}</p>}
                  {c.email && <p className="truncate text-xs text-ink-muted">{c.email}</p>}
                  {c.vat_number && <p className="text-xs text-ink-muted">VAT: {c.vat_number}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card grid place-items-center gap-2 p-12 text-center">
            <p className="text-3xl">👥</p>
            <p className="font-semibold text-ink">No clients yet</p>
            <p className="text-sm text-ink-soft">Add your first client to start billing and branding.</p>
          </div>
        )}
      </div>

      {/* Add form */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        {open ? (
          <form onSubmit={onSubmit} className="card space-y-4 p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink">Add a client</p>
              {clients.length > 0 && (
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-muted hover:text-ink">
                  Cancel
                </button>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="name">Contact name</label>
              <input id="name" name="name" required className="field-input" placeholder="Ahmed Al-Salem" />
            </div>
            <div>
              <label className="field-label" htmlFor="company_name">Company</label>
              <input id="company_name" name="company_name" className="field-input" placeholder="Al Salem Group" />
            </div>
            <LogoUpload value={logoUrl} onChange={setLogoUrl} label="Client logo" folder="client-logos" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" className="field-input" />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="vat_number">VAT number</label>
              <input id="vat_number" name="vat_number" className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="address">Address</label>
              <textarea id="address" name="address" rows={2} className="field-input" />
            </div>
            {err && <p className="text-sm text-rose-600">{err}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Saving…" : "Add client"}
            </button>
          </form>
        ) : (
          <button onClick={() => setOpen(true)} className="btn-primary w-full py-3">
            + Add client
          </button>
        )}
      </div>
    </div>
  );
}
