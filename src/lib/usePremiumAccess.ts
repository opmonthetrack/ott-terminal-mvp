import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createWalletProof,
  EMPTY_ENTITLEMENTS,
  loadPremiumAccessStatus,
  verifyWalletProof,
  type PremiumAccessResponse,
  type PremiumEntitlements,
  type PremiumGrant,
  type WalletLink,
} from "./premiumAccessClient";
import { useOttAuthSession } from "./useOttAuthSession";

const XRPL_ADDRESS = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

export function usePremiumAccess(walletAddress = "") {
  const { signedIn, loading: authLoading } = useOttAuthSession();
  const wallet = XRPL_ADDRESS.test(walletAddress) ? walletAddress : "";
  const [entitlements, setEntitlements] = useState<PremiumEntitlements>(EMPTY_ENTITLEMENTS);
  const [grants, setGrants] = useState<PremiumGrant[]>([]);
  const [walletLinks, setWalletLinks] = useState<WalletLink[]>([]);
  const [walletLinked, setWalletLinked] = useState(false);
  const [walletGrantAvailable, setWalletGrantAvailable] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);
  const [error, setError] = useState("");

  const apply = useCallback((response: PremiumAccessResponse) => {
    setEntitlements(response.entitlements ?? EMPTY_ENTITLEMENTS);
    setGrants(response.grants ?? []);
    setWalletLinks(response.walletLinks ?? []);
    setWalletLinked(Boolean(response.walletLinked));
    setWalletGrantAvailable(Boolean(response.walletGrantAvailable));
    setSetupRequired(Boolean(response.setupRequired));
  }, []);

  const refresh = useCallback(async (silent = false) => {
    if (!signedIn || authLoading) {
      setEntitlements(EMPTY_ENTITLEMENTS);
      setGrants([]);
      setWalletLinks([]);
      setWalletLinked(false);
      setWalletGrantAvailable(false);
      setSetupRequired(false);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const response = await loadPremiumAccessStatus(wallet || undefined);
      apply(response);
      setError("");
    } catch (nextError) {
      setError(errorMessage(nextError, "Premium access could not be verified."));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [apply, authLoading, signedIn, wallet]);

  useEffect(() => {
    void refresh(true);
    if (!signedIn) return;
    const onFocus = () => void refresh(true);
    const timer = window.setInterval(() => void refresh(true), 30_000);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, [refresh, signedIn]);

  useEffect(() => {
    if (!signedIn || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("wallet_link_return") !== "1") return;
    const payloadUuid = params.get("payload") ?? "";
    if (!payloadUuid) return;

    let cancelled = false;
    setLinkBusy(true);
    void verifyWalletProof(payloadUuid)
      .then((response) => {
        if (cancelled) return;
        apply(response);
        return refresh(true);
      })
      .catch((nextError) => {
        if (!cancelled) setError(errorMessage(nextError, "Wallet proof could not be verified."));
      })
      .finally(() => {
        if (cancelled) return;
        setLinkBusy(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("wallet_link_return");
        url.searchParams.delete("payload");
        window.history.replaceState({}, document.title, url.toString());
      });

    return () => { cancelled = true; };
  }, [apply, refresh, signedIn]);

  const startWalletProof = useCallback(async () => {
    if (!wallet) throw new Error("Koppel eerst een geldig XRPL-walletadres.");
    setLinkBusy(true);
    setError("");
    try {
      const response = await createWalletProof(wallet);
      apply(response);
      const nextUrl = response.payload?.next?.always || response.payload?.next?.no_push_msg_received;
      if (!nextUrl) throw new Error("Xaman gaf geen wallet-prooflink terug.");
      window.location.assign(nextUrl);
    } catch (nextError) {
      const message = errorMessage(nextError, "Wallet proof could not be created.");
      setError(message);
      setLinkBusy(false);
      throw new Error(message);
    }
  }, [apply, wallet]);

  const source = useMemo(() => {
    if (entitlements.accessPassIssued) return "access-pass";
    if (grants.some((grant) => grant.target_user_id)) return "account-grant";
    if (grants.some((grant) => grant.wallet_address)) return "wallet-grant";
    return "none";
  }, [entitlements.accessPassIssued, grants]);

  return {
    signedIn,
    authLoading,
    loading,
    linkBusy,
    setupRequired,
    entitlements,
    grants,
    walletLinks,
    walletLinked,
    walletGrantAvailable,
    source,
    error,
    refresh,
    startWalletProof,
  };
}
