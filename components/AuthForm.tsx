"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { appUrl } from "@/lib/site";

type Mode = "signin" | "signup";
type Status = { kind: "idle" | "loading" | "ok" | "err"; msg: string };

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });

  // Creating the client processes any session in the URL (email-confirmation
  // links land here with tokens in the hash). If already signed in, move on.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const fullName = String(fd.get("fullName") || "").trim();
    const supabase = createClient();

    setStatus({ kind: "loading", msg: mode === "signin" ? "Signing in…" : "Creating your account…" });

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setStatus({ kind: "err", msg: error.message });
      router.push(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // Return the confirmation link to the deployed app (honours base path).
        emailRedirectTo: appUrl("/login/"),
      },
    });
    if (error) return setStatus({ kind: "err", msg: error.message });

    if (data.session) {
      // Email confirmation disabled → straight into onboarding.
      router.push("/onboarding");
      router.refresh();
    } else {
      setStatus({
        kind: "ok",
        msg: "Account created. Check your email to confirm, then sign in.",
      });
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {mode === "signin" ? "Welcome back" : "Create your workspace"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {mode === "signin"
            ? "Sign in to manage your documents and invoices."
            : "One account for every document your business sends."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="fullName" className="field-label">Full name</label>
              <input id="fullName" name="fullName" required placeholder="Your name" className="field-input" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="field-label">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@company.com"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="••••••••"
              className="field-input"
            />
          </div>

          <button type="submit" disabled={status.kind === "loading"} className="btn-primary w-full py-3">
            {status.kind === "loading"
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in →"
                : "Create account →"}
          </button>

          {status.msg && (
            <p
              className={`text-sm ${
                status.kind === "err" ? "text-rose-600" : status.kind === "ok" ? "text-emerald-600" : "text-ink-muted"
              }`}
            >
              {status.msg}
            </p>
          )}
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {mode === "signin" ? (
          <>
            New to efatoora?{" "}
            <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
