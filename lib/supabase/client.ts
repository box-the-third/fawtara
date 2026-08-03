"use client";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// A tiny in-memory mutex per lock name, used instead of the default Navigator
// LockManager. The Navigator lock can stall on hard page loads when multiple
// GoTrueClient instances share a storage key (a common dev/HMR situation);
// in-memory locking is sufficient for a single-tab SPA.
const chains: Record<string, Promise<unknown>> = {};
async function memoryLock<R>(name: string, _timeout: number, fn: () => Promise<R>): Promise<R> {
  const prev = chains[name] ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((res) => (release = res));
  chains[name] = prev.then(() => gate);
  await prev.catch(() => {});
  try {
    return await fn();
  } finally {
    release();
  }
}

// Single browser client for the whole SPA. Sessions persist in localStorage
// and auto-refresh; `detectSessionInUrl` lets email-confirmation links
// establish the session on redirect back to the app.
let client: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (client) return client;
  client = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "fawtara-auth",
        lock: memoryLock,
      },
    },
  );
  return client;
}
