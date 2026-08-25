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

const PRICING = [
  {
    name: "Individual",
    price: "500",
    yearly: "Billed 4,200 SAR / year — save 30%",
    tag: null as string | null,
    blurb: "For freelancers, sole traders and side hustles.",
    cta: "Start free trial",
    features: [
      "Unlimited invoices & documents",
      "Automatic VAT engine (15%)",
      "Arabic + English · RTL & LTR",
      "ZATCA bilingual tax-invoice layout",
      "Product catalogue & Excel import",
      "1 user · email support",
    ],
  },
  {
    name: "SME",
    price: "1,000",
    yearly: "Billed 8,400 SAR / year — save 30%",
    tag: "Best value",
    blurb: "For growing businesses and small teams.",
    cta: "Start free trial",
    features: [
      "Everything in Individual",
      "Up to 10 users",
      "Multiple workspaces",
      "Bulk product import",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    yearly: null,
    tag: null,
    blurb: "For large organisations with custom needs.",
    cta: "Contact us",
    features: [
      "Everything in SME",
      "Unlimited users",
      "Custom templates & branding",
      "Dedicated account manager",
      "Onboarding & SLA",
    ],
  },
];

const ZATCA = [
  {
    icon: "🧾",
    title: "ZATCA-compliant e-invoices",
    body: "efatoora supports the Saudi electronic invoice in accordance with the requirements of the Zakat, Tax and Customs Authority (ZATCA). Issue your e-invoice and send it to the KSA electronic invoice system in the approved formats for tax and simplified invoices.",
  },
  {
    icon: "🧮",
    title: "Automatic tax & VAT calculation",
    body: "efatoora also supports the various taxes such as value-added tax and automatically includes them on your invoices — so your subtotals, VAT and totals are always correct.",
  },
];

const FAQ = [
  {
    q: "Who is efatoora for?",
    a: "Everyday business owners — freelancers, shop owners, small teams. It's made by common people, for common people. No accounting degree required.",
  },
  {
    q: "Do I need to be technical?",
    a: "Not at all. If you can fill in a form, you can send a professional invoice: pick a template, type your items, and hit export.",
  },
  {
    q: "Is it really free to use?",
    a: "Yes — you start with a 14-day free trial, no credit card needed and no setup. After that, paid plans start at just 500 SAR / month.",
  },
  {
    q: "Does it work in Arabic?",
    a: "Fully. Native right-to-left Arabic (and English), including a bilingual ZATCA tax-invoice layout that shows both languages on one page.",
  },
  {
    q: "Are my invoices ZATCA-compliant?",
    a: "Yes. efatoora issues tax and simplified invoices in ZATCA-approved formats with automatic VAT, ready for the KSA e-invoicing system.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes — efatoora is fully responsive and works on any device, with nothing to install.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Wordmark />
          <nav className="flex items-center gap-1 sm:gap-2">
            <a href="#pricing" className="hidden px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink md:inline-flex">
              Pricing
            </a>
            <a href="#faq" className="hidden px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink md:inline-flex">
              FAQ
            </a>
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
            🇸🇦 ZATCA-ready · Free to start · Arabic-first
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Professional documents & tax invoices,{" "}
            <span className="text-brand-600">in Arabic or English.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
            efatoora helps individuals, SMEs and enterprises create tenders, invoices, NOCs and
            offer letters — with native right-to-left support, dual-branding and a built-in VAT
            engine. From blank page to signed PDF in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Start free →
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-base">
              I already have an account
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-muted">Free 14-day trial · No credit card · No setup</p>

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

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
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

      {/* ZATCA compliance */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip bg-white text-brand-700 ring-1 ring-brand-100">🇸🇦 KSA e-invoicing</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Electronic invoicing compliant with the KSA Zakat, Tax &amp; Customs Authority
            </h2>
            <p className="mt-3 text-ink-soft">
              Issue e-invoices that meet ZATCA requirements — for both tax and simplified invoices.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {ZATCA.map((z) => (
              <div key={z.title} className="card p-6">
                <div className="text-2xl">{z.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-ink">{z.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{z.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-16">
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
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Simple, honest pricing</h2>
            <p className="mt-3 text-ink-soft">
              Free to start, then plans that grow with you. Start on a 14-day free trial — no card, no setup.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-ink-soft">
              <span>✓ Free 14-day trial</span>
              <span>✓ No credit card</span>
              <span>✓ No setup</span>
              <span>✓ All features included</span>
            </div>
          </div>

          <div className="mt-10 grid items-start gap-5 lg:grid-cols-3">
            {PRICING.map((p) => {
              const featured = p.tag === "Best value";
              return (
                <div
                  key={p.name}
                  className={`card relative flex flex-col p-6 ${
                    featured ? "ring-2 ring-brand-500 lg:-mt-2 lg:shadow-card" : ""
                  }`}
                >
                  {p.tag && (
                    <span className="absolute -top-3 left-6 chip bg-brand-600 text-white shadow-soft">
                      {p.tag}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{p.blurb}</p>

                  <div className="mt-5">
                    {p.price ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold text-ink">{p.price}</span>
                          <span className="text-sm font-semibold text-ink-muted">SAR / month</span>
                        </div>
                        {p.yearly && <p className="mt-1 text-xs text-ink-muted">{p.yearly}</p>}
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-ink">Custom</span>
                      </div>
                    )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink-soft">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 text-brand-600">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className={`mt-6 w-full py-3 text-center ${featured ? "btn-primary" : "btn-ghost"}`}
                  >
                    {p.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Questions? We keep it simple.</h2>
          <p className="mt-3 text-ink-soft">
            efatoora is for common people, made by common people — here&apos;s the plain-language rundown.
          </p>
        </div>
        <div className="mt-8 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                {item.q}
                <span className="text-ink-muted transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-2 text-sm text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-3xl bg-ink px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">Ready to send your first invoice?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Set up your workspace in under a minute — free 14-day trial, no credit card.
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
            © {new Date().getFullYear()} efatoora · Documents & Tax Invoices
          </p>
        </div>
      </footer>
    </div>
  );
}
