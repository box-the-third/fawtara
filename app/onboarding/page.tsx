"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Wordmark from "@/components/Wordmark";
import OnboardingForm from "@/components/OnboardingForm";
import { AuthProvider, useAuth } from "@/lib/auth";

function OnboardingGate() {
  const { loading, user, org } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (org) router.replace("/dashboard");
  }, [loading, user, org, router]);

  if (loading || !user || org) {
    return (
      <div className="grid place-items-center py-20 text-sm text-ink-muted">Loading…</div>
    );
  }
  return <OnboardingForm />;
}

export default function OnboardingPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-brand-50/60 to-white">
        <header className="px-5 py-5">
          <Wordmark />
        </header>
        <main className="px-5 pb-20 pt-6">
          <OnboardingGate />
        </main>
      </div>
    </AuthProvider>
  );
}
