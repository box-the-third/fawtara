"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";

export type Organization = Tables<"organizations">;

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  org: Organization | null;
  reloadOrg: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  // The user id we've finished loading the org for — avoids a stale "ready"
  // flag causing a premature redirect while a new user's org is still loading.
  const [orgLoadedFor, setOrgLoadedFor] = useState<string | null>(null);

  const loadOrg = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setOrg(null);
      return;
    }
    const supabase = createClient();
    const { data: memberships } = await supabase
      .from("memberships")
      .select("org_id")
      .order("created_at", { ascending: true })
      .limit(1);
    const orgId = memberships?.[0]?.org_id;
    if (!orgId) {
      setOrg(null);
      return;
    }
    const { data: organization } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();
    setOrg(organization ?? null);
  }, []);

  // Auth state. IMPORTANT: the onAuthStateChange callback must stay synchronous
  // and must NOT call Supabase (doing so deadlocks the auth lock). Data loading
  // happens in the separate effect below, keyed on the user id.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load the active org whenever the signed-in user changes.
  useEffect(() => {
    let active = true;
    if (!user) {
      setOrg(null);
      setOrgLoadedFor(null);
      return;
    }
    loadOrg(user.id).finally(() => {
      if (active) setOrgLoadedFor(user.id);
    });
    return () => {
      active = false;
    };
  }, [user?.id, loadOrg]); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadOrg = useCallback(() => loadOrg(user?.id), [loadOrg, user?.id]);
  const signOut = useCallback(async () => {
    await createClient().auth.signOut();
    setOrg(null);
    setOrgLoadedFor(null);
  }, []);

  // Still loading until auth settles AND the org has been fetched for THIS user.
  const loading = authLoading || (!!user && orgLoadedFor !== user.id);

  return (
    <AuthContext.Provider value={{ loading, session, user, org, reloadOrg, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
