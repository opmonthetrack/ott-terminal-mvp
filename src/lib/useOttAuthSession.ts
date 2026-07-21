import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hydrateAccountAcademyCache } from "./accountAcademyStore";
import { setActiveAcademyAccount } from "./academyProgressStore";
import {
  getOttSession,
  isOttAuthConfigured,
  subscribeToOttAuth,
} from "./ottAuth";

export function useOttAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isOttAuthConfigured);

  useEffect(() => {
    let mounted = true;

    async function applySession(nextSession: Session | null) {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setActiveAcademyAccount(nextSession?.user.id ?? null);

      if (nextSession?.user.id) {
        try {
          await hydrateAccountAcademyCache(nextSession.user.id);
        } catch {
          // The account session remains valid when remote Academy hydration is temporarily unavailable.
        }
      }

      if (mounted) {
        setLoading(false);
      }
    }

    if (!isOttAuthConfigured) {
      setActiveAcademyAccount(null);
      setLoading(false);
      return;
    }

    void getOttSession()
      .then((nextSession) => applySession(nextSession))
      .catch(() => applySession(null));

    const unsubscribe = subscribeToOttAuth((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return {
    configured: isOttAuthConfigured,
    loading,
    session,
    user: (session?.user ?? null) as User | null,
    signedIn: Boolean(session?.user),
  };
}
