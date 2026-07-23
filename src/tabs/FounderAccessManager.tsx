import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  KeyRound,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  createFounderAccessGrant,
  loadFounderAccessGrants,
  revokeFounderAccessGrant,
  searchFounderAccessTarget,
  type FounderAccessScope,
  type FounderGrantUser,
  type FounderTarget,
} from "../lib/founderAccessClient";
import type { PremiumGrant, WalletLink } from "../lib/premiumAccessClient";
import { getOttAccountName } from "../lib/ottAuth";
import { useOttAuthSession } from "../lib/useOttAuthSession";

const scopes: Array<{ id: FounderAccessScope; label: string; detail: string }> = [
  { id: "wallet-academy", label: "Wallet Academy", detail: "Alle volledige walletopleidingen." },
  { id: "academy-premium", label: "Academy Premium", detail: "Premium Academy inclusief Wallet Academy." },
  { id: "research-pro", label: "Research Pro", detail: "Premium tokenresearch- en bewijsfuncties." },
  { id: "all-premium", label: "All Premium", detail: "Alle huidige en onderliggende premiumscopes." },
];

function errorText(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

function localInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function FounderAccessManager() {
  const { user, signedIn, loading: authLoading } = useOttAuthSession();
  const [grants, setGrants] = useState<PremiumGrant[]>([]);
  const [users, setUsers] = useState<FounderGrantUser[]>([]);
  const [walletLinks, setWalletLinks] = useState<WalletLink[]>([]);
  const [targets, setTargets] = useState<FounderTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<FounderTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<FounderAccessScope>("wallet-academy");
  const [startsAt, setStartsAt] = useState(() => localInputValue(new Date()));
  const [expiresAt, setExpiresAt] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return localInputValue(date);
  });
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);

  async function refresh() {
    if (!signedIn) return;
    setBusy("refresh");
    setError("");
    try {
      const response = await loadFounderAccessGrants();
      setGrants(response.grants ?? []);
      setUsers(response.users ?? []);
      setWalletLinks(response.walletLinks ?? []);
      setSetupRequired(Boolean(response.setupRequired));
    } catch (nextError) {
      setError(errorText(nextError, "Founder grants konden niet worden geladen."));
    } finally {
      setBusy("");
    }
  }

  useEffect(() => {
    if (!authLoading && signedIn) void refresh();
  }, [authLoading, signedIn]);

  async function searchTarget() {
    if (!searchQuery.trim()) return;
    setBusy("search");
    setError("");
    setMessage("");
    setSelectedTarget(null);
    try {
      const response = await searchFounderAccessTarget(searchQuery.trim());
      const next = response.targets ?? [];
      setTargets(next);
      if (next.length === 1) setSelectedTarget(next[0]);
      if (next.length === 0) setMessage("Geen exact OTT-account of walletdoel gevonden.");
    } catch (nextError) {
      setError(errorText(nextError, "Zoeken is mislukt."));
    } finally {
      setBusy("");
    }
  }

  async function createGrant() {
    if (!selectedTarget) {
      setError("Kies eerst een OTT-account of XRPL-wallet.");
      return;
    }
    if (reason.trim().length < 3) {
      setError("Leg vast waarom deze gratis toegang wordt gegeven.");
      return;
    }

    setBusy("create");
    setError("");
    setMessage("");
    try {
      const response = await createFounderAccessGrant({
        targetUserId: selectedTarget.type === "account" ? selectedTarget.userId : undefined,
        walletAddress: selectedTarget.type === "wallet" ? selectedTarget.walletAddress : undefined,
        accessScope: scope,
        reason: reason.trim(),
        startsAt: new Date(startsAt).toISOString(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setMessage(response.eventType === "extended"
        ? "Bestaande actieve toegang is bijgewerkt en in het auditlog vastgelegd."
        : "Gratis toegang is server-side aangemaakt en in het auditlog vastgelegd.");
      setReason("");
      await refresh();
    } catch (nextError) {
      setError(errorText(nextError, "Grant kon niet worden opgeslagen."));
    } finally {
      setBusy("");
    }
  }

  async function revokeGrant(grantId: string) {
    setBusy(`revoke:${grantId}`);
    setError("");
    try {
      await revokeFounderAccessGrant(grantId);
      setMessage("Toegang is ingetrokken en het audit-event is opgeslagen.");
      await refresh();
    } catch (nextError) {
      setError(errorText(nextError, "Grant kon niet worden ingetrokken."));
    } finally {
      setBusy("");
    }
  }

  const activeCount = grants.filter((grant) => grant.status === "active" && (!grant.expires_at || new Date(grant.expires_at) > new Date())).length;
  const userMap = useMemo(() => new Map(users.map((item) => [item.id, item])), [users]);
  const verifiedWallets = useMemo(() => new Set(walletLinks.filter((link) => link.status === "verified").map((link) => link.wallet_address)), [walletLinks]);

  if (authLoading) return <FullScreen text="Founderaccount controleren…" loading />;
  if (!signedIn) return <FullScreen text="Log eerst in via Account & Profile en open daarna opnieuw ?founder=1&accessmanager=1." />;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <a href="/?founder=1" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} />Terug naar OTT Terminal</a>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Founder only · server controlled</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Premium Access Manager</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Ingelogd als {getOttAccountName(user) || user?.email}. Iedere grant heeft scope, looptijd, reden, founder-ID en audit-events. Walletgrants activeren pas na Xaman-walletbewijs.</p>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/5 disabled:opacity-50">{busy === "refresh" ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}Vernieuwen</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {setupRequired && <Warning title="Databaseactivering vereist" text="Voer eerst de tokenresearch- en wallet-linkmigraties uit. Tot die tijd worden geen grants aangemaakt." />}
        {message && <p className="mb-6 rounded-2xl border border-blue-300/20 bg-blue-300/5 p-5 text-sm text-blue-100">{message}</p>}
        {error && <p className="mb-6 rounded-2xl border border-red-300/20 bg-red-300/5 p-5 text-sm text-red-100">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Actieve grants" value={activeCount} />
          <Stat label="Wallets bewezen" value={verifiedWallets.size} />
          <Stat label="Totaal auditrecords" value={grants.length} />
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
            <div className="flex items-center gap-3"><Search className="text-blue-300" size={21} /><h2 className="text-xl font-semibold">1. Zoek exact doel</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-400">Gebruik exact e-mailadres, Supabase user-ID of XRPL r-adres. Een walletadres geeft pas toegang nadat de ontvanger het in Xaman heeft ondertekend.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void searchTarget(); }} placeholder="email@example.com, UUID of r..." className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-400" />
              <button type="button" onClick={() => void searchTarget()} disabled={busy === "search" || setupRequired} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{busy === "search" ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />}Zoeken</button>
            </div>

            <div className="mt-5 space-y-3">
              {targets.map((target) => <TargetCard key={target.type === "account" ? target.userId : target.walletAddress} target={target} active={selectedTarget === target} onSelect={() => setSelectedTarget(target)} />)}
            </div>

            <div className="mt-8 border-t border-white/10 pt-7">
              <div className="flex items-center gap-3"><KeyRound className="text-blue-300" size={21} /><h2 className="text-xl font-semibold">2. Stel toegang in</h2></div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Scope</span><select value={scope} onChange={(event) => setScope(event.target.value as FounderAccessScope)} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm">{scopes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><p className="mt-2 text-xs leading-5 text-slate-500">{scopes.find((item) => item.id === scope)?.detail}</p></label>
                <label><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Reden verplicht</span><input value={reason} onChange={(event) => setReason(event.target.value.slice(0, 1000))} placeholder="Partner, tester, community education…" className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm" /></label>
                <label><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Start</span><input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm" /></label>
                <label><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Einde</span><input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm" /></label>
              </div>
              <button type="button" onClick={() => void createGrant()} disabled={!selectedTarget || Boolean(busy) || setupRequired} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-40"><ShieldCheck size={18} />Gratis toegang opslaan</button>
            </div>
          </div>

          <aside className="rounded-3xl border border-amber-300/20 bg-amber-300/5 p-6">
            <div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={22} /><div><h2 className="font-semibold text-amber-100">Geen onveilige walletunlock</h2><p className="mt-2 text-sm leading-6 text-amber-100/80">Een openbaar r-adres kan door iedereen worden gekopieerd. Daarom wordt een walletgrant pas onderdeel van de entitlementstatus wanneer hetzelfde ingelogde OTT-account een Xaman SignIn-payload met die wallet heeft ondertekend.</p></div></div>
            {selectedTarget && <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4"><p className="text-xs text-slate-500">Geselecteerd doel</p><p className="mt-2 break-all font-semibold">{selectedTarget.type === "account" ? selectedTarget.email || selectedTarget.userId : selectedTarget.walletAddress}</p>{selectedTarget.type === "wallet" && <p className="mt-3 text-xs text-slate-400">Xaman-proof: {(selectedTarget.linkedUsers?.length ?? 0) > 0 ? "al gekoppeld" : "nog vereist"}</p>}</div>}
          </aside>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
          <div className="flex items-center gap-3"><Clock3 className="text-blue-300" size={21} /><h2 className="text-xl font-semibold">Grantregister</h2></div>
          <div className="mt-6 space-y-4">
            {grants.length > 0 ? grants.map((grant) => {
              const targetUser = grant.target_user_id ? userMap.get(grant.target_user_id) : null;
              const walletVerified = grant.wallet_address ? verifiedWallets.has(grant.wallet_address) : false;
              const active = grant.status === "active" && (!grant.expires_at || new Date(grant.expires_at) > new Date());
              return <article key={grant.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-400/15 text-emerald-200" : "bg-slate-400/15 text-slate-300"}`}>{grant.status}</span><span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-semibold text-blue-200">{grant.access_scope}</span>{grant.wallet_address && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${walletVerified ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>{walletVerified ? "wallet bewezen" : "walletproof vereist"}</span>}</div><h3 className="mt-4 break-all text-lg font-semibold">{targetUser?.email || targetUser?.name || grant.wallet_address || grant.target_user_id}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{grant.reason}</p><p className="mt-3 text-xs text-slate-500">{new Date(grant.starts_at).toLocaleString()} → {grant.expires_at ? new Date(grant.expires_at).toLocaleString() : "geen einddatum"}</p></div>{active && <button type="button" onClick={() => void revokeGrant(grant.id)} disabled={busy === `revoke:${grant.id}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300/20 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-300/5 disabled:opacity-50">{busy === `revoke:${grant.id}` ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}Intrekken</button>}</div></article>;
            }) : <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-400">Nog geen grants opgeslagen.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

function TargetCard({ target, active, onSelect }: { target: FounderTarget; active: boolean; onSelect: () => void }) {
  const Icon = target.type === "account" ? UserRound : Wallet;
  return <button type="button" onClick={onSelect} className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left ${active ? "border-blue-400 bg-blue-400/10" : "border-white/10 bg-slate-950/40 hover:bg-white/5"}`}><Icon className="mt-0.5 shrink-0 text-blue-300" size={20} /><div className="min-w-0"><p className="font-semibold">{target.type === "account" ? target.email || target.name || target.userId : target.walletAddress}</p><p className="mt-1 break-all text-xs text-slate-500">{target.type === "account" ? target.userId : `${target.linkedUsers?.length ?? 0} geverifieerde accountkoppeling(en)`}</p></div>{active && <CheckCircle2 className="ml-auto shrink-0 text-blue-300" size={19} />}</button>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}

function Warning({ title, text }: { title: string; text: string }) {
  return <div className="mb-6 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={21} /><div><p className="font-semibold text-amber-100">{title}</p><p className="mt-2 text-sm leading-6 text-amber-100/80">{text}</p></div></div>;
}

function FullScreen({ text, loading = false }: { text: string; loading?: boolean }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">{loading && <Loader2 className="mx-auto mb-5 animate-spin" size={28} />}<p className="text-sm leading-7 text-slate-300">{text}</p>{!loading && <a href="/?founder=1" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"><ArrowLeft size={16} />Terug</a>}</div></div>;
}
