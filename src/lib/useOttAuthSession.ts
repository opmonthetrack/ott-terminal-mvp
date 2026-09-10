import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { observeSession } from "./asyncReliability";
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
    if (!isOttAuthConfigured) {
      setActiveAcademyAccount(null);
      setLoading(false);
      return;
    }
    return observeSession<Session>({
      initial: getOttSession,
      subscribe: listener => subscribeToOttAuth((_event, next) => listener(next)),
      apply: next => {
        setSession(next);
        setActiveAcademyAccount(next?.user.id ?? null);
        setLoading(false);
      },
      hydrate: (next, stillCurrent) => hydrateAccountAcademyCache(next.user.id, stillCurrent),
    });
  }, []);

  return {
    configured: isOttAuthConfigured,
    loading,
    session,
    user: (session?.user ?? null) as User | null,
    signedIn: Boolean(session?.user),
  };
}
