import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Activity,
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Copy,
  Database,
  Fingerprint,
  GraduationCap,
  Loader2,
  LogOut,
  RefreshCcw,
  Save,
  ShieldCheck,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { getAcademyProgressSummary } from "../lib/academyProgressStore";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import {
  loadCustomerProfile,
  saveCustomerProfile,
  type OttCustomerProfile,
} from "../lib/profileStore";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type WalletTabProps = {
  walletAddress?: string;
  onDisconnect?: () => void;
};

type AccountInfo = {
  address: string;
  balanceXrp: string;
  sequence: number | null;
  ownerCount: number | null;
  ledgerIndex: number | null;
};

type Trustline = {
  currency: string;
  balance: string;
  issuer: string;
};

type AccountTransaction = {
  hash: string;
  type: string;
  date: string;
  fee: string;
  sourceTag: string;
};

type LookupStatus = "idle" | "loading" | "success" | "error";
type DashboardView = "overview" | "profile" | "academy";

type XrplResponse = {
  id?: number;
  status?: string;
  result?: {
    status?: string;
    error?: string;
    account_data?: {
      Account?: string;
      Balance?: string;
      Sequence?: number;
      OwnerCount?: number;
    };
    lines?: Array<{
      currency?: string;
      balance?: string;
      account?: string;
    }>;
    transactions?: Array<{
      tx?: {
        hash?: string;
        TransactionType?: string;
        Fee?: string;
        SourceTag?: number;
        date?: number;
      };
      tx_json?: {
        hash?: string;
        TransactionType?: string;
        Fee?: string;
        SourceTag?: number;
        date?: number;
      };
    }>;
    ledger_index?: number;
  };
};

const XRPL_ENDPOINT = "wss://xrplcluster.com/";

function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function shortWallet(value: string) {
  return value.length > 22 ? `${value.slice(0, 11)}…${value.slice(-8)}` : value;
}

function dropsToXrp(value: string) {
  const drops = Number(value);
  return Number.isFinite(drops) ? (drops / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0";
}

function formatRippleDate(value: number) {
  return new Date((value + 946684800) * 1000).toLocaleString();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function xrplRequest(command: Record<string, unknown>) {
  return new Promise<XrplResponse>((resolve, reject) => {
    const socket = new WebSocket(XRPL_ENDPOINT);
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("XRPL request timed out."));
    }, 15_000);

    socket.onopen = () => {
      socket.send(JSON.stringify({ id, ...command }));
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data) as XrplResponse;

        if (response.id !== id) {
          return;
        }

        window.clearTimeout(timeout);
        socket.close();
        resolve(response);
      } catch (error) {
        window.clearTimeout(timeout);
        socket.close();
        reject(error);
      }
    };

    socket.onerror = () => {
      window.clearTimeout(timeout);
      socket.close();
      reject(new Error("XRPL websocket connection failed."));
    };
  });
}

export function WalletTab({ walletAddress = "guest", onDisconnect }: WalletTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const hasVerifiedWallet = isLikelyXrplAddress(walletAddress);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [error, setError] = useState("");
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [trustlines, setTrustlines] = useState<Trustline[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [lastUpdated, setLastUpdated] = useState("not loaded");
  const [profile, setProfile] = useState<OttCustomerProfile | null>(() =>
    hasVerifiedWallet ? loadCustomerProfile(walletAddress) : null,
  );
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [handle, setHandle] = useState(profile?.handle ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [profileStatus, setProfileStatus] = useState("");
  const [progressVersion, setProgressVersion] = useState(0);

  const academy = useMemo(
    () => getAcademyProgressSummary(walletAddress),
    [walletAddress, progressVersion],
  );
  const sourceTagHits = useMemo(
    () => transactions.filter((transaction) => transaction.sourceTag === String(MAKE_WAVES_SOURCE_TAG)),
    [transactions],
  );

  useEffect(() => {
    const nextProfile = hasVerifiedWallet ? loadCustomerProfile(walletAddress) : null;
    setProfile(nextProfile);
    setDisplayName(nextProfile?.displayName ?? "");
    setHandle(nextProfile?.handle ?? "");
    setBio(nextProfile?.bio ?? "");
  }, [walletAddress, hasVerifiedWallet]);

  useEffect(() => {
    const refreshProgress = () => setProgressVersion((value) => value + 1);
    window.addEventListener("ott-academy-progress-changed", refreshProgress);
    window.addEventListener("ott-profile-changed", refreshProgress);
    window.addEventListener("storage", refreshProgress);

    return () => {
      window.removeEventListener("ott-academy-progress-changed", refreshProgress);
      window.removeEventListener("ott-profile-changed", refreshProgress);
      window.removeEventListener("storage", refreshProgress);
    };
  }, []);

  useEffect(() => {
    if (!hasVerifiedWallet) {
      setAccountInfo(null);
      setTrustlines([]);
      setTransactions([]);
      setStatus("idle");
      return;
    }

    void loadWallet();
  }, [walletAddress, hasVerifiedWallet]);

  async function loadWallet() {
    if (!hasVerifiedWallet) {
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const [infoResponse, linesResponse, txResponse] = await Promise.all([
        xrplRequest({ command: "account_info", account: walletAddress, ledger_index: "validated" }),
        xrplRequest({ command: "account_lines", account: walletAddress, ledger_index: "validated", limit: 20 }),
        xrplRequest({ command: "account_tx", account: walletAddress, ledger_index_min: -1, ledger_index_max: -1, binary: false, limit: 15 }),
      ]);

      if (infoResponse.result?.error || !infoResponse.result?.account_data?.Account) {
        throw new Error(infoResponse.result?.error || "No validated account data found.");
      }

      const accountData = infoResponse.result.account_data;
      setAccountInfo({
        address: accountData.Account,
        balanceXrp: dropsToXrp(accountData.Balance ?? "0"),
        sequence: accountData.Sequence ?? null,
        ownerCount: accountData.OwnerCount ?? null,
        ledgerIndex: infoResponse.result.ledger_index ?? null,
      });
      setTrustlines(
        (linesResponse.result?.lines ?? []).map((line) => ({
          currency: line.currency ?? "Unknown",
          balance: line.balance ?? "0",
          issuer: line.account ?? "unknown",
        })),
      );
      setTransactions(
        (txResponse.result?.transactions ?? [])
          .map((entry) => {
            const tx = entry.tx_json ?? entry.tx;

            if (!tx?.hash) {
              return null;
            }

            return {
              hash: tx.hash,
              type: tx.TransactionType ?? "Unknown",
              date: typeof tx.date === "number" ? formatRippleDate(tx.date) : "—",
              fee: tx.Fee ? `${dropsToXrp(tx.Fee)} XRP` : "—",
              sourceTag: tx.SourceTag ? String(tx.SourceTag) : "—",
            };
          })
          .filter((item): item is AccountTransaction => Boolean(item)),
      );
      setLastUpdated(new Date().toLocaleTimeString());
      setStatus("success");
    } catch (lookupError) {
      setStatus("error");
      setError(getErrorMessage(lookupError, "Wallet lookup failed."));
    }
  }

  function saveProfile() {
    try {
      const nextProfile = saveCustomerProfile({
        walletAddress,
        displayName,
        handle,
        bio,
      });
      setProfile(nextProfile);
      setProfileStatus(
        isEnglish
          ? "Profile saved locally under your verified wallet session. It is private by default."
          : "Profiel lokaal opgeslagen onder je geverifieerde walletsessie. Het is standaard privé.",
      );
    } catch (profileError) {
      setProfileStatus(
        getErrorMessage(
          profileError,
          isEnglish ? "Could not save profile." : "Profiel kon niet worden opgeslagen.",
        ),
      );
    }
  }

  function copyWallet() {
    if (hasVerifiedWallet) {
      void navigator.clipboard?.writeText(walletAddress);
    }
  }

  if (!hasVerifiedWallet) {
    return (
      <div className="min-h-screen bg-white text-[#080808] p-4 md:p-8 xl:p-10">
        <div className="max-w-4xl mx-auto border border-black/10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,152,232,0.16),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(200,56,136,0.16),transparent_30%),#fff] p-6 md:p-10 text-center">
          <Wallet size={44} className="mx-auto text-[#3898E8] mb-6" />
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/35 mb-4">
            Wallet Dashboard + Profile
          </p>
          <h1 className="font-orbitron text-3xl md:text-5xl font-black uppercase mb-6">
            {isEnglish ? "Connect once. Track everything." : "Eén keer koppelen. Alles bijhouden."}
          </h1>
          <p className="font-mono text-sm text-black/55 leading-relaxed max-w-2xl mx-auto">
            {isEnglish
              ? "Connect through Xaman to load public XRPL data and create a private OTT profile. Only AI-verified Academy progress is added here."
              : "Koppel via Xaman om publieke XRPL-data te laden en een privé OTT-profiel te maken. Alleen AI-geverifieerde Academy-voortgang wordt hier toegevoegd."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="border-b border-black/10 bg-[radial-gradient(circle_at_15%_12%,rgba(56,152,232,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(200,56,136,0.16),transparent_30%),#fff] p-4 md:p-8 xl:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <OTTLogo
            size="lg"
            subtitle={
              isEnglish
                ? "Wallet data, customer profile and verified learning in one place"
                : "Walletdata, klantprofiel en geverifieerd leren op één plek"
            }
          />
          <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
        </div>

        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 xl:col-span-8">
            <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 px-4 py-2 mb-6">
              <User size={15} className="text-[#C83888]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                {isEnglish ? "Verified Customer Command Center" : "Geverifieerd Klantencentrum"}
              </p>
            </div>
            <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase leading-none tracking-tight mb-6">
              {profile?.displayName || (isEnglish ? "Your Wallet." : "Jouw Wallet.")}
              <br />
              <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                {isEnglish ? "Your OTT profile." : "Jouw OTT-profiel."}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <code className="border border-black/10 bg-white px-4 py-3 font-mono text-xs break-all">{walletAddress}</code>
              <button type="button" onClick={copyWallet} className="border border-black/10 bg-white p-3" aria-label="Copy wallet"><Copy size={16} /></button>
              <button type="button" onClick={onDisconnect} className="border border-[#C83888]/25 bg-[#C83888]/10 px-4 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><LogOut size={15} />{isEnglish ? "Disconnect" : "Ontkoppel"}</button>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 border border-black/10 bg-white/90 p-5">
            <InfoRow label={isEnglish ? "Session" : "Sessie"} value="Xaman verified · 7-day local session" />
            <InfoRow label={isEnglish ? "Profile privacy" : "Profielprivacy"} value="Private / local by default" />
            <InfoRow label={isEnglish ? "Last wallet update" : "Laatste walletupdate"} value={lastUpdated} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          <MetricCard icon={Wallet} label="XRP" value={accountInfo?.balanceXrp ?? "—"} text={isEnglish ? "Public balance" : "Publiek saldo"} />
          <MetricCard icon={Database} label="Trustlines" value={String(trustlines.length)} text={isEnglish ? "Issued assets" : "Issued assets"} />
          <MetricCard icon={GraduationCap} label={isEnglish ? "Modules" : "Modules"} value={String(academy.completedCount)} text={isEnglish ? "AI verified" : "AI-geverifieerd"} />
          <MetricCard icon={Zap} label="XP" value={String(academy.totalXp)} text={isEnglish ? "Verified learning" : "Geverifieerd leren"} />
          <MetricCard icon={Award} label="Credits" value={String(academy.totalCredits)} text={`${academy.averageScore}% AI avg`} />
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <ViewButton active={activeView === "overview"} label={isEnglish ? "Wallet Overview" : "Walletoverzicht"} onClick={() => setActiveView("overview")} />
          <ViewButton active={activeView === "profile"} label={isEnglish ? "My Profile" : "Mijn Profiel"} onClick={() => setActiveView("profile")} />
          <ViewButton active={activeView === "academy"} label={isEnglish ? "Academy Progress" : "Academy-Voortgang"} onClick={() => setActiveView("academy")} />
        </div>
      </section>

      <section className="p-4 md:p-8 xl:p-10">
        {activeView === "overview" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8 space-y-4">
              <Panel title={isEnglish ? "Public XRPL Account" : "Publiek XRPL-Account"} icon={Wallet}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <p className="font-mono text-xs text-black/55 leading-relaxed">
                    {isEnglish ? "Read-only data. OTT never stores private keys or a seed phrase." : "Alleen-lezen data. OTT bewaart nooit private keys of een seed phrase."}
                  </p>
                  <button type="button" onClick={() => void loadWallet()} disabled={status === "loading"} className="border border-black/10 bg-[#F7F8FC] px-4 py-3 font-orbitron text-[10px] font-black uppercase flex items-center gap-2 disabled:opacity-50">
                    {status === "loading" ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                    {isEnglish ? "Refresh" : "Verversen"}
                  </button>
                </div>

                {error && <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 font-mono text-xs text-black/60 mb-4">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <InfoRow label={isEnglish ? "Validated ledger" : "Gevalideerde ledger"} value={String(accountInfo?.ledgerIndex ?? "—")} />
                  <InfoRow label="Sequence" value={String(accountInfo?.sequence ?? "—")} />
                  <InfoRow label="Owner Count" value={String(accountInfo?.ownerCount ?? "—")} />
                </div>
              </Panel>

              <Panel title={isEnglish ? "Recent Transactions" : "Recente Transacties"} icon={Activity}>
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.hash} className="border border-black/10 bg-[#F7F8FC] p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <div className="min-w-0">
                        <p className="font-orbitron text-xs font-black uppercase mb-2">{transaction.type}</p>
                        <p className="font-mono text-[10px] text-black/45 break-all">{transaction.hash}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-mono text-[10px] text-black/45">{transaction.date}</p>
                        <p className="font-mono text-[10px] text-black/45 mt-1">SourceTag {transaction.sourceTag}</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <EmptyState text={isEnglish ? "No recent transactions loaded." : "Geen recente transacties geladen."} />}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel title="OTT Proof Signals" icon={Fingerprint}>
                <InfoRow label="Official SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />
                <InfoRow label={isEnglish ? "Recent matches" : "Recente matches"} value={String(sourceTagHits.length)} />
                <InfoRow label={isEnglish ? "Profile status" : "Profielstatus"} value={profile ? "Created" : "Not created"} />
              </Panel>

              <Panel title={isEnglish ? "Issued Assets" : "Issued Assets"} icon={Database}>
                <div className="space-y-2">
                  {trustlines.map((line) => (
                    <div key={`${line.currency}-${line.issuer}`} className="border border-black/10 bg-[#F7F8FC] p-3">
                      <p className="font-orbitron text-xs font-black uppercase">{line.currency} · {line.balance}</p>
                      <p className="font-mono text-[9px] text-black/40 break-all mt-2">{line.issuer}</p>
                    </div>
                  ))}
                  {trustlines.length === 0 && <EmptyState text={isEnglish ? "No trustlines found." : "Geen trustlines gevonden."} />}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeView === "profile" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-7">
              <Panel title={profile ? (isEnglish ? "Edit Customer Profile" : "Bewerk Klantprofiel") : (isEnglish ? "Create Customer Profile" : "Maak Klantprofiel")} icon={User}>
                <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 p-4 mb-5">
                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {isEnglish
                      ? "The profile is optional and stored locally under this verified wallet. Nothing becomes public automatically."
                      : "Het profiel is optioneel en wordt lokaal onder deze geverifieerde wallet opgeslagen. Niets wordt automatisch openbaar."}
                  </p>
                </div>

                <label className="block mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">{isEnglish ? "Display name" : "Weergavenaam"}</span>
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value.slice(0, 40))} maxLength={40} className="mt-2 w-full border border-black/10 bg-[#F7F8FC] p-4 font-mono text-sm outline-none focus:border-[#3898E8]" placeholder="XRPL Learner" />
                  <span className="block text-right font-mono text-[9px] text-black/35 mt-1">{displayName.length}/40</span>
                </label>

                <label className="block mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">Handle</span>
                  <div className="mt-2 flex border border-black/10 bg-[#F7F8FC] focus-within:border-[#3898E8]">
                    <span className="p-4 font-mono text-sm text-black/35">@</span>
                    <input value={handle} onChange={(event) => setHandle(event.target.value.replace(/^@/, "").slice(0, 32))} maxLength={32} className="flex-1 bg-transparent p-4 pl-0 font-mono text-sm outline-none" placeholder="on_the_track" />
                  </div>
                  <span className="block text-right font-mono text-[9px] text-black/35 mt-1">{handle.length}/32</span>
                </label>

                <label className="block mb-5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">Bio</span>
                  <textarea value={bio} onChange={(event) => setBio(event.target.value.slice(0, 160))} maxLength={160} rows={5} className="mt-2 w-full border border-black/10 bg-[#F7F8FC] p-4 font-mono text-sm outline-none focus:border-[#3898E8]" placeholder={isEnglish ? "What are you learning or building on XRPL?" : "Wat leer of bouw je op XRPL?"} />
                  <span className="block text-right font-mono text-[9px] text-black/35 mt-1">{bio.length}/160</span>
                </label>

                <button type="button" onClick={saveProfile} className="w-full bg-black text-white p-4 font-orbitron text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"><Save size={16} />{isEnglish ? "Save Private Profile" : "Sla Privéprofiel Op"}</button>
                {profileStatus && <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-4 font-mono text-xs text-black/60">{profileStatus}</div>}
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-5">
              <Panel title={isEnglish ? "Profile Preview" : "Profielvoorbeeld"} icon={BadgeCheck}>
                <div className="border border-black/10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,152,232,0.14),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(200,56,136,0.14),transparent_30%),#fff] p-6">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-orbitron text-xl font-black mb-5">
                    {(displayName || "OTT").slice(0, 3).toUpperCase()}
                  </div>
                  <h2 className="font-orbitron text-2xl font-black uppercase mb-2">{displayName || "Unnamed learner"}</h2>
                  <p className="font-mono text-xs text-[#C83888] mb-4">{handle ? `@${handle}` : "No public handle"}</p>
                  <p className="font-mono text-sm text-black/55 leading-relaxed mb-5">{bio || (isEnglish ? "Add a short private profile bio." : "Voeg een korte privéprofielbio toe.")}</p>
                  <InfoRow label="Wallet" value={shortWallet(walletAddress)} />
                  <InfoRow label={isEnglish ? "Verified modules" : "Geverifieerde modules"} value={String(academy.completedCount)} />
                  <InfoRow label="XP / Credits" value={`${academy.totalXp} / ${academy.totalCredits}`} />
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeView === "academy" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel title={isEnglish ? "Verified Academy History" : "Geverifieerde Academy-Historie"} icon={GraduationCap}>
                <div className="space-y-3">
                  {academy.completions.map((completion) => (
                    <div key={completion.lessonId} className="border border-black/10 bg-[#F7F8FC] p-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 size={16} className="text-[#3898E8]" />
                          <p className="font-orbitron text-sm font-black uppercase">{completion.lessonTitle}</p>
                        </div>
                        <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest">
                          {new Date(completion.completedAt).toLocaleString()} · AI assessment
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Tag text={`${completion.overallScore}%`} />
                        <Tag text={`+${completion.xp} XP`} />
                        <Tag text={`+${completion.credits} Credits`} />
                      </div>
                    </div>
                  ))}
                  {academy.completions.length === 0 && <EmptyState text={isEnglish ? "No AI-verified modules yet. Academy answers must all pass before they appear here." : "Nog geen AI-geverifieerde modules. Alle Academy-antwoorden moeten slagen voordat ze hier verschijnen."} />}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel title={isEnglish ? "Learning Profile" : "Leerprofiel"} icon={BookOpen}>
                <InfoRow label={isEnglish ? "Completed modules" : "Afgeronde modules"} value={String(academy.completedCount)} />
                <InfoRow label="AI Average" value={`${academy.averageScore}%`} />
                <InfoRow label="XP" value={String(academy.totalXp)} />
                <InfoRow label="OTT Credits" value={String(academy.totalCredits)} />
              </Panel>

              <Panel title={isEnglish ? "Integrity Rules" : "Integriteitsregels"} icon={ShieldCheck}>
                <InfoLine text={isEnglish ? "No manual completion button." : "Geen handmatige afrondingsknop."} />
                <InfoLine text={isEnglish ? "All module answers must pass." : "Alle moduleantwoorden moeten slagen."} />
                <InfoLine text={isEnglish ? "Progress is separated by verified wallet." : "Voortgang is per geverifieerde wallet gescheiden."} />
                <InfoLine text={isEnglish ? "Profile is private by default." : "Profiel is standaard privé."} />
              </Panel>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ElementType; children: React.ReactNode }) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm shadow-black/5">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />
        <p className="font-orbitron text-xs uppercase tracking-widest">{title}</p>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, text }: { icon: ElementType; label: string; value: string; text: string }) {
  return (
    <div className="border border-black/10 bg-white/85 p-4">
      <Icon size={17} className="text-[#3898E8] mb-3" />
      <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mb-1">{label}</p>
      <p className="font-orbitron text-lg font-black uppercase mb-1 break-words">{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-black/40">{text}</p>
    </div>
  );
}

function ViewButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`px-4 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest ${active ? "bg-black text-white" : "border border-black/10 bg-white"}`}>{label}</button>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3 mb-2 last:mb-0">
      <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mb-1">{label}</p>
      <p className="font-mono text-xs text-black/65 break-all">{value}</p>
    </div>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 mb-3 last:mb-0">
      <CheckCircle2 size={14} className="text-[#3898E8] mt-0.5 shrink-0" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function Tag({ text }: { text: string }) {
  return <span className="border border-black/10 bg-white px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-black/45">{text}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="border border-black/10 bg-[#F7F8FC] p-5 font-mono text-xs text-black/45 leading-relaxed">{text}</div>;
}
