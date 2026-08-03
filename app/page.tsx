import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { DOC_TYPES } from "@/lib/constants";

const STEPS = [
  {
    n: "01",
    title: "Create your workspace",
    body: "Sign up and set your organization once — logo, VAT number, currency and default language (Arabic or English).",
  },
  {
    n: "02",
    title: "Add a client",
    body: "Save the clients you bill or write to, each with their own logo for dual-branded documents.",
  },
  {
    n: "03",
    title: "Build the document",
    body: "Pick a type, add line items, and watch VAT and totals calculate live in a real A4 preview.",
  },
  {
    n: "04",
    title: "Export & send",
    body: "One click to a pixel-perfect A4 PDF — right-to-left aware, ready to email or print.",
  },
];

const FEATURES = [
  { icon: "🌐", title: "Native Arabic (RTL)", body: "True right-to-left layout with the Cairo typeface — not a bolted-on afterthought." },
  { icon: "🏷️", title: "Dual-branding", body: "Your logo and your client's logo, side by side, on every document." },
  { icon: "🧮", title: "Automated VAT engine", body: "Line items, tax rate and totals stay in sync as you type. Default 15% VAT." },
  { icon: "🧩", title: "Modular templates", body: "Invoices, tenders, offer letters, NOCs and policy letters from one editor." },
  { icon: "🔐", title: "Multi-tenant & secure", body: "Row-level security isolates every workspace's data at the database." },
  { icon: "📄", title: "One-click PDF", body: "A4, print-perfect, page numbers and no awkward table breaks." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Wordmark />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,#eef4ff_0%,#ffffff_70%)]" />
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-16 text-center sm:pt-24">
          <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            🌍 Bilingual · Arabic-first · RTL &amp; LTR
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Professional documents & tax invoices,{" "}
            <span className="text-brand-600">in Arabic or English.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
            Fawtara helps SMBs, agencies and enterprises create tenders, invoices, NOCs and
            offer letters — with native right-to-left support, dual-branding and a built-in
            VAT engine. From blank page to signed PDF in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Create your first document →
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-base">
              I already have an account
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-muted">No credit card required · Free to start</p>

          {/* Hero preview mock */}
          <div className="mx-auto mt-14 max-w-4xl">
            <div className="card overflow-hidden p-2 shadow-card">
              <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr]">
                <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white p-6 text-left ring-1 ring-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-24 rounded bg-brand-100" />
                    <div className="h-8 w-20 rounded bg-slate-100" />
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="h-3 w-40 rounded bg-slate-200" />
                    <div className="h-3 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="mt-6 space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                        <div className="h-3 w-16 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <div className="w-40 space-y-2">
                      <div className="flex justify-between"><div className="h-3 w-16 rounded bg-slate-100" /><div className="h-3 w-12 rounded bg-slate-100" /></div>
                      <div className="flex justify-between"><div className="h-3 w-20 rounded bg-slate-100" /><div className="h-3 w-12 rounded bg-slate-100" /></div>
                      <div className="flex justify-between"><div className="h-4 w-16 rounded bg-brand-200" /><div className="h-4 w-14 rounded bg-brand-200" /></div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-ink p-6 text-left text-white">
                  <p className="text-xs uppercase tracking-widest text-brand-200">Live totals</p>
                  <p className="mt-3 text-sm text-slate-300">Subtotal</p>
                  <p className="text-lg font-semibold">1,200.00</p>
                  <p className="mt-3 text-sm text-slate-300">VAT (15%)</p>
                  <p className="text-lg font-semibold">180.00</p>
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="text-sm text-slate-300">Total due</p>
                    <p className="text-2xl font-bold text-brand-300">1,380.00 SAR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doc types */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          One editor. Every document you send.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOC_TYPES.map((d) => (
            <div key={d.type} className="card p-5 transition hover:shadow-card">
              <div className="text-2xl">{d.icon}</div>
              <h3 className="mt-3 font-semibold text-ink">
                {d.label} <span className="font-arabic text-ink-muted">· {d.labelAr}</span>
              </h3>
              <p className="mt-1.5 text-sm text-ink-soft">{d.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buyer journey / how it works */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            From sign-up to signed PDF in four steps
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="text-3xl font-extrabold text-brand-200">{s.n}</div>
                <h3 className="mt-2 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Start free →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl p-5 ring-1 ring-slate-100">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-3xl bg-ink px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">Ready to send your first invoice?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Set up your workspace in under a minute. Your data is isolated and secured with
            row-level security on Supabase.
          </p>
          <Link href="/signup" className="btn-primary mt-6 px-6 py-3 text-base">
            Get started free →
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 sm:flex-row">
          <Wordmark />
          <p className="text-sm text-ink-muted">
            © {new Date().getFullYear()} Fawtara · Documents & Tax Invoices SaaS
          </p>
        </div>
      </footer>
    </div>
  );
}
