import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
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

    if (!isOttAuthConfigured) {
      setLoading(false);
      return;
    }

    void getOttSession()
      .then((nextSession) => {
        if (mounted) {
          setSession(nextSession);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const unsubscribe = subscribeToOttAuth((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        setLoading(false);
      }
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
