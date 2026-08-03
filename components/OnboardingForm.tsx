"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CURRENCIES } from "@/lib/constants";
import LogoUpload from "@/components/LogoUpload";

export default function OnboardingForm() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErr(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("create_organization", {
        p_name: String(fd.get("name") || "").trim(),
        p_vat_number: String(fd.get("vat_number") || "").trim() || undefined,
        p_currency: String(fd.get("currency") || "SAR"),
        p_language: language,
        p_is_rtl: language === "ar",
        p_tax_rate: Number(fd.get("tax_rate") || 15),
        p_logo_url: logoUrl || undefined,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not create organization");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6">
        <span className="chip bg-brand-50 text-brand-700">Step 1 of 1</span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Set up your workspace</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          These details appear on every document you create. You can change them later.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-5 p-6">
        <div>
          <label htmlFor="name" className="field-label">Organization name</label>
          <input id="name" name="name" required placeholder="e.g. Al Noor Trading Co." className="field-input" />
        </div>

        <LogoUpload value={logoUrl} onChange={setLogoUrl} label="Company logo" folder="org-logos" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="vat_number" className="field-label">VAT number (optional)</label>
            <input id="vat_number" name="vat_number" placeholder="3xxxxxxxxxxxxx3" className="field-input" />
          </div>
          <div>
            <label htmlFor="currency" className="field-label">Currency</label>
            <select id="currency" name="currency" defaultValue="SAR" className="field-input">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="field-label">Default language</span>
            <div className="flex gap-2">
              {(["ar", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    language === l
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-ink-soft hover:bg-slate-50"
                  }`}
                >
                  {l === "ar" ? "العربية (RTL)" : "English (LTR)"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="tax_rate" className="field-label">Default VAT rate (%)</label>
            <input
              id="tax_rate"
              name="tax_rate"
              type="number"
              step="0.1"
              min="0"
              defaultValue={15}
              className="field-input"
            />
          </div>
        </div>

        {err && <p className="text-sm text-rose-600">{err}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full py-3">
          {busy ? "Creating workspace…" : "Create workspace & continue →"}
        </button>
      </form>
    </div>
  );
}
