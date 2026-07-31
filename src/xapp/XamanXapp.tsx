import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Copy,
  ExternalLink,
  FileCode2,
  FileText,
  Fingerprint,
  Flag,
  Hash,
  Home,
  Image,
  KeyRound,
  LifeBuoy,
  Loader2,
  LockKeyhole,
  LogOut,
  Network,
  QrCode,
  RefreshCcw,
  ScanLine,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Wallet,
} from "lucide-react";
import {
  loadXrplTransactionSnapshot,
  loadXrplWalletProfile,
  loadXrplWalletWorkspace,
  type XrplRecentTransaction,
  type XrplTransactionSnapshot,
  type XrplWalletProfile,
  type XrplWalletWorkspace,
} from "../lib/xrplWalletProfile";
import {
  extractXrplAddress,
  extractXrplTransactionHash,
  getXamanXappTheme,
  initializeXamanXapp,
  type XamanDestinationEvent,
  type XamanQrEvent,
  type XamanXappRuntime,
} from "../lib/xamanXappRuntime";
import "./xaman-xapp.css";

type LoadState = "idle" | "loading" | "success" | "error";
type XappView = "home" | "assets" | "activity" | "scan" | "safety";

const SOURCE_REPOSITORY = "https://github.com/opmonthetrack/ott-terminal-mvp";
const ACCOUNT_FLAGS = [
  { bit: 0x00020000, label: "Destination tag required", tone: "positive" },
  { bit: 0x00040000, label: "Trustline authorization required", tone: "neutral" },
  { bit: 0x00080000, label: "Incoming XRP discouraged", tone: "warning" },
  { bit: 0x00100000, label: "Master key disabled", tone: "positive" },
  { bit: 0x00200000, label: "No Freeze enabled", tone: "positive" },
  { bit: 0x00400000, label: "Global Freeze enabled", tone: "warning" },
  { bit: 0x00800000, label: "Default Ripple enabled", tone: "warning" },
  { bit: 0x01000000, label: "Deposit authorization required", tone: "positive" },
  { bit: 0x08000000, label: "Incoming NFT offers blocked", tone: "positive" },
  { bit: 0x10000000, label: "Incoming checks blocked", tone: "positive" },
  { bit: 0x20000000, label: "Incoming payment channels blocked", tone: "positive" },
  { bit: 0x40000000, label: "Incoming trustlines blocked", tone: "positive" },
] as const;

const SAFETY_LESSONS = [
  { title: "Before every signature", text: "Match the transaction type, account, destination, amount, issuer, tags and fee with the action you intended." },
  { title: "Trustlines are permissions", text: "A TrustSet is not a normal payment. Check the currency, issuer, limit and freeze controls before approval." },
  { title: "Tags can be essential", text: "Exchanges and custodians may require a destination tag. Missing or incorrect tags can make recovery difficult." },
  { title: "NFT actions are ledger actions", text: "Mint, offer, accept and burn are different actions. Never approve an unexpected NFT offer or brokered sale." },
  { title: "Secrets never belong here", text: "OTT and legitimate xApps never need your seed phrase, recovery words, private key or family seed." },
];

function shortValue(value: string, start = 8, end = 6) {
  if (!value) return "Not present";
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

function currentOriginUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

function formatDate(value: string) {
  if (value === "Date unavailable") return value;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function activeAccountFlags(profile: XrplWalletProfile) {
  return ACCOUNT_FLAGS.filter((flag) => (profile.accountFlags & flag.bit) !== 0);
}

function profileWarnings(profile: XrplWalletProfile, workspace: XrplWalletWorkspace) {
  const warnings: string[] = [];
  if ((profile.accountFlags & 0x00400000) !== 0) warnings.push("Global Freeze is active on this account.");
  if ((profile.accountFlags & 0x00800000) !== 0) warnings.push("Default Ripple is enabled; review issuer-account routing carefully.");
  if (workspace.trustlines.some((line) => line.freeze || line.freezePeer)) warnings.push("At least one trustline reports a freeze flag.");
  if (profile.availableXrp === "0") warnings.push("The estimated available XRP is zero after the current owner reserve.");
  if (workspace.profile.partial) warnings.push("One or more ledger lists are partial; displayed counts may be incomplete.");
  return warnings;
}

export function XamanXapp() {
  const [view, setView] = useState<XappView>("home");
  const [runtime, setRuntime] = useState<XamanXappRuntime | null>(null);
  const [sessionState, setSessionState] = useState<LoadState>("loading");
  const [sessionError, setSessionError] = useState("");
  const [workspace, setWorkspace] = useState<XrplWalletWorkspace | null>(null);
  const [workspaceState, setWorkspaceState] = useState<LoadState>("idle");
  const [workspaceError, setWorkspaceError] = useState("");
  const [hashInput, setHashInput] = useState("");
  const [transaction, setTransaction] = useState<XrplTransactionSnapshot | null>(null);
  const [transactionState, setTransactionState] = useState<LoadState>("idle");
  const [transactionError, setTransactionError] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [addressProfile, setAddressProfile] = useState<XrplWalletProfile | null>(null);
  const [addressTag, setAddressTag] = useState<number | null>(null);
  const [addressState, setAddressState] = useState<LoadState>("idle");
  const [addressError, setAddressError] = useState("");
  const [assetMode, setAssetMode] = useState<"tokens" | "nfts">("tokens");
  const [notice, setNotice] = useState("");
  const theme = runtime?.theme ?? getXamanXappTheme();

  const warnings = useMemo(
    () => workspace ? profileWarnings(workspace.profile, workspace) : [],
    [workspace],
  );

  useEffect(() => {
    document.body.classList.add("xaman-xapp-active");
    return () => document.body.classList.remove("xaman-xapp-active");
  }, []);

  useEffect(() => {
    let active = true;
    void initializeXamanXapp()
      .then((nextRuntime) => {
        if (!active) return;
        setRuntime(nextRuntime);
        setSessionState("success");
        if (nextRuntime.preview) setNotice("Browser preview: Xaman supplies the selected account and network only inside the live xApp.");
      })
      .catch((error) => {
        if (!active) return;
        setSessionState("error");
        setSessionError(error instanceof Error ? error.message : "Xaman context could not be loaded.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!runtime?.account) return;
    let active = true;
    setWorkspaceState("loading");
    setWorkspaceError("");
    void loadXrplWalletWorkspace(runtime.account, runtime.network)
      .then((nextWorkspace) => {
        if (!active) return;
        setWorkspace(nextWorkspace);
        setWorkspaceState("success");
      })
      .catch((error) => {
        if (!active) return;
        setWorkspaceState("error");
        setWorkspaceError(error instanceof Error ? error.message : "The wallet workspace could not be loaded.");
      });
    return () => { active = false; };
  }, [runtime?.account, runtime?.network]);

  async function refreshWorkspace() {
    if (!runtime?.account) return;
    setWorkspaceState("loading");
    setWorkspaceError("");
    try {
      setWorkspace(await loadXrplWalletWorkspace(runtime.account, runtime.network));
      setWorkspaceState("success");
      setNotice("Validated wallet data refreshed.");
    } catch (error) {
      setWorkspaceState("error");
      setWorkspaceError(error instanceof Error ? error.message : "The wallet workspace could not be loaded.");
    }
  }

  async function verifyTransaction(candidate = hashInput) {
    const hash = extractXrplTransactionHash(candidate.trim());
    if (!hash) {
      setTransactionState("error");
      setTransactionError("Enter or scan a valid 64-character XRPL transaction hash.");
      return;
    }
    setHashInput(hash);
    setTransaction(null);
    setTransactionError("");
    setTransactionState("loading");
    try {
      setTransaction(await loadXrplTransactionSnapshot(hash, runtime?.network ?? "mainnet"));
      setTransactionState("success");
    } catch (error) {
      setTransactionState("error");
      setTransactionError(error instanceof Error ? error.message : "The transaction could not be verified.");
    }
  }

  async function inspectAddress(candidate = addressInput, tag: number | null = addressTag) {
    const address = extractXrplAddress(candidate.trim());
    if (!address) {
      setAddressState("error");
      setAddressError("Enter, paste or select a valid XRPL r-address.");
      return;
    }
    setAddressInput(address);
    setAddressTag(tag);
    setAddressProfile(null);
    setAddressError("");
    setAddressState("loading");
    try {
      setAddressProfile(await loadXrplWalletProfile(address, runtime?.network ?? "mainnet"));
      setAddressState("success");
    } catch (error) {
      setAddressState("error");
      setAddressError(error instanceof Error ? error.message : "The destination could not be checked.");
    }
  }

  function scanWithXaman() {
    const bridge = runtime?.bridge;
    if (!bridge) {
      setNotice("The native QR scanner is available only inside the live xApp.");
      return;
    }
    const handleQr = (event: XamanQrEvent) => {
      bridge.off?.("qr", handleQr);
      if (event.reason !== "SCANNED" || !event.qrContents) {
        setNotice("No QR content was scanned.");
        return;
      }
      const hash = extractXrplTransactionHash(event.qrContents);
      if (hash) {
        setView("scan");
        setNotice("Transaction hash scanned. Verifying it on the selected network.");
        void verifyTransaction(hash);
        return;
      }
      const address = extractXrplAddress(event.qrContents);
      if (address) {
        setView("scan");
        setNotice("XRPL address scanned. Inspecting the destination.");
        void inspectAddress(address, null);
        return;
      }
      setNotice("The QR code did not contain a supported XRPL address or transaction hash.");
    };
    bridge.on("qr", handleQr);
    void Promise.resolve(bridge.scanQr()).catch(() => {
      bridge.off?.("qr", handleQr);
      setNotice("Xaman could not open the QR scanner.");
    });
  }

  function selectDestination() {
    const bridge = runtime?.bridge;
    if (!bridge?.selectDestination) {
      setNotice("Destination Picker requires a supported Xaman version inside the live xApp.");
      return;
    }
    const handleDestination = (event: XamanDestinationEvent) => {
      bridge.off?.("destination", handleDestination);
      const address = event.destination?.address ?? "";
      if (!address) {
        setNotice("No destination was selected.");
        return;
      }
      const tag = typeof event.destination?.tag === "number" ? event.destination.tag : null;
      setNotice(event.destination?.name ? `Selected ${event.destination.name}. Checking its public account settings.` : "Destination selected. Checking its public account settings.");
      void inspectAddress(address, tag);
    };
    bridge.on("destination", handleDestination);
    void Promise.resolve(bridge.selectDestination({ ignoreDestinationTag: false })).catch(() => {
      bridge.off?.("destination", handleDestination);
      setNotice("Xaman could not open the Destination Picker.");
    });
  }

  function showNativeTransaction(hash: string) {
    if (!runtime?.bridge?.tx || !runtime.account) {
      setNotice("Open this transaction from the live xApp to use Xaman's native details panel.");
      return;
    }
    void Promise.resolve(runtime.bridge.tx({ account: runtime.account, tx: hash })).catch(() => setNotice("Xaman could not open the transaction panel."));
  }

  function shareText(text: string) {
    if (!runtime?.bridge?.share) {
      setNotice("Native sharing is available only inside a supported Xaman xApp.");
      return;
    }
    void Promise.resolve(runtime.bridge.share({ text })).catch(() => setNotice("Xaman could not open the share dialog."));
  }

  function copyValue(value: string, label: string) {
    void navigator.clipboard.writeText(value)
      .then(() => setNotice(`${label} copied.`))
      .catch(() => setNotice(`${label} could not be copied on this device.`));
  }

  function openExternal(url: string) {
    if (!runtime?.bridge) {
      setNotice("Open the live xApp in Xaman to use its confirmed external-browser flow.");
      return;
    }
    void Promise.resolve(runtime.bridge.openBrowser({ url })).catch(() => setNotice("Xaman could not open the external page."));
  }

  function closeXapp() {
    if (!runtime?.bridge) {
      setNotice("The close action is available only inside Xaman.");
      return;
    }
    void Promise.resolve(runtime.bridge.close({ refreshEvents: false })).catch(() => setNotice("Xaman could not close the xApp automatically."));
  }

  const profile = workspace?.profile ?? null;

  return (
    <main className="xaman-xapp-shell" data-theme={theme}>
      <div className="xaman-xapp-container">
        <header className="xaman-app-bar">
          <div className="xaman-brand-row">
            <img src="/logo.png" alt="OnTheTrack" className="xaman-brand-logo" />
            <div>
              <p className="xaman-eyebrow">OTT · Xaman</p>
              <strong>Safety Companion</strong>
            </div>
          </div>
          <div className="xaman-app-actions">
            <button type="button" className="xaman-icon-button" onClick={() => void refreshWorkspace()} aria-label="Refresh wallet data" disabled={!runtime?.account || workspaceState === "loading"}>
              <RefreshCcw className={workspaceState === "loading" ? "animate-spin" : ""} size={20} />
            </button>
            {runtime?.bridge ? <button type="button" className="xaman-icon-button" onClick={closeXapp} aria-label="Close xApp"><LogOut size={20} /></button> : null}
          </div>
        </header>

        {notice ? <button type="button" className="xaman-notice" onClick={() => setNotice("")} aria-label="Dismiss message"><ShieldCheck size={20} /><span>{notice}</span></button> : null}
        {sessionState === "loading" ? <LoadingLine text="Reading verified Xaman context…" /> : null}
        {sessionState === "error" ? <ErrorLine text={sessionError} /> : null}
        {workspaceState === "error" ? <ErrorLine text={workspaceError} /> : null}

        <div className="xaman-view" key={view}>
          {view === "home" ? (
            <HomeView runtime={runtime} workspace={workspace} state={workspaceState} warnings={warnings} onNavigate={setView} onCopy={copyValue} onShare={shareText} />
          ) : null}
          {view === "assets" ? (
            <AssetsView workspace={workspace} mode={assetMode} onMode={setAssetMode} onCopy={copyValue} />
          ) : null}
          {view === "activity" ? (
            <ActivityView transactions={workspace?.transactions ?? []} onOpen={showNativeTransaction} onInspect={(hash) => { setView("scan"); void verifyTransaction(hash); }} />
          ) : null}
          {view === "scan" ? (
            <ScanView
              network={runtime?.networkType ?? "Preview"}
              hashInput={hashInput}
              onHashInput={setHashInput}
              transaction={transaction}
              transactionState={transactionState}
              transactionError={transactionError}
              onVerify={() => void verifyTransaction()}
              onScan={scanWithXaman}
              onNativeTx={showNativeTransaction}
              addressInput={addressInput}
              onAddressInput={setAddressInput}
              addressProfile={addressProfile}
              addressTag={addressTag}
              addressState={addressState}
              addressError={addressError}
              onInspectAddress={() => void inspectAddress()}
              onSelectDestination={selectDestination}
              selectedAccount={runtime?.account ?? ""}
              onCopy={copyValue}
            />
          ) : null}
          {view === "safety" ? (
            <SafetyView profile={profile} workspace={workspace} warnings={warnings} onExternal={openExternal} />
          ) : null}
        </div>

        <nav className="xaman-bottom-nav" aria-label="xApp sections">
          <NavButton active={view === "home"} icon={<Home size={21} />} label="Home" onClick={() => setView("home")} />
          <NavButton active={view === "assets"} icon={<Boxes size={21} />} label="Assets" onClick={() => setView("assets")} />
          <NavButton active={view === "activity"} icon={<Activity size={21} />} label="Activity" onClick={() => setView("activity")} />
          <NavButton active={view === "scan"} icon={<ScanLine size={21} />} label="Scan" onClick={() => setView("scan")} />
          <NavButton active={view === "safety"} icon={<ShieldCheck size={21} />} label="Safety" onClick={() => setView("safety")} />
        </nav>
      </div>
    </main>
  );
}

function HomeView({ runtime, workspace, state, warnings, onNavigate, onCopy, onShare }: {
  runtime: XamanXappRuntime | null;
  workspace: XrplWalletWorkspace | null;
  state: LoadState;
  warnings: string[];
  onNavigate: (view: XappView) => void;
  onCopy: (value: string, label: string) => void;
  onShare: (text: string) => void;
}) {
  const profile = workspace?.profile;
  return (
    <>
      <section className="xaman-hero-card">
        <div className="xaman-hero-topline"><span><Network size={16} />{runtime?.networkType ?? "Loading network"}</span><span className="xaman-live-dot">Validated ledger</span></div>
        <h1 className="xaman-home-title">Wallet overview</h1>
        <p className="xaman-hero-label">Selected wallet balance</p>
        <div className="xaman-balance-row"><strong>{profile?.balanceXrp ?? (state === "loading" ? "…" : "0")}</strong><span>XRP</span></div>
        <p className="xaman-address-line">{runtime?.account ? shortValue(runtime.account, 12, 9) : "Available inside the live xApp"}</p>
        <div className="xaman-hero-actions">
          <button type="button" onClick={() => runtime?.account && onCopy(runtime.account, "Wallet address")} disabled={!runtime?.account}><Copy size={17} />Copy</button>
          <button type="button" onClick={() => profile && onShare(`OTT read-only XRPL wallet check\nAccount: ${profile.address}\nNetwork: ${runtime?.networkType}\nLedger: ${profile.ledgerIndex}`)} disabled={!profile}><Share2 size={17} />Share check</button>
        </div>
      </section>

      <div className="xaman-stat-grid">
        <StatCard label="Estimated available" value={`${profile?.availableXrp ?? "—"} XRP`} icon={<CircleDollarSign size={20} />} />
        <StatCard label="Owner reserve" value={`${profile?.estimatedReserveXrp ?? "—"} XRP`} icon={<LockKeyhole size={20} />} />
        <StatCard label="Tokens" value={String(profile?.tokenCount ?? 0)} icon={<Tag size={20} />} />
        <StatCard label="NFTs" value={String(profile?.nftCount ?? 0)} icon={<Image size={20} />} />
      </div>

      <section className="xaman-card">
        <SectionHeading icon={<ShieldCheck size={22} />} eyebrow="Wallet safety" title={warnings.length ? `${warnings.length} item${warnings.length === 1 ? "" : "s"} to review` : "No immediate warnings found"} />
        <p className="xaman-muted">This is a public-ledger checklist, not a guarantee of wallet, token or issuer safety.</p>
        {warnings.length ? <ul className="xaman-warning-list">{warnings.slice(0, 3).map((warning) => <li key={warning}><AlertTriangle size={18} />{warning}</li>)}</ul> : <div className="xaman-positive-line"><CheckCircle2 size={20} />No supported high-attention flag was detected in the current snapshot.</div>}
        <button type="button" className="xaman-text-link" onClick={() => onNavigate("safety")}>Open full safety report <ChevronRight size={17} /></button>
      </section>

      <section className="xaman-card">
        <SectionHeading icon={<Activity size={22} />} eyebrow="Latest ledger activity" title="Recent transactions" />
        {workspace?.transactions.length ? workspace.transactions.slice(0, 3).map((tx) => <TransactionRow key={`${tx.hash}-${tx.ledgerIndex}`} transaction={tx} onClick={() => onNavigate("activity")} />) : <EmptyState icon={<Activity size={26} />} title="No recent activity loaded" text="Refresh the selected account or check that Xaman is on the intended network." />}
        <button type="button" className="xaman-text-link" onClick={() => onNavigate("activity")}>View all loaded activity <ChevronRight size={17} /></button>
      </section>

      <p className="xaman-boundary">Independent xApp by OnTheTrack · not operated by Xaman. This xApp is read-only and creates no signing request.</p>
    </>
  );
}

function AssetsView({ workspace, mode, onMode, onCopy }: {
  workspace: XrplWalletWorkspace | null;
  mode: "tokens" | "nfts";
  onMode: (mode: "tokens" | "nfts") => void;
  onCopy: (value: string, label: string) => void;
}) {
  return (
    <>
      <PageHeader eyebrow="Public ledger inventory" title="Assets" text="Review quantities, issuers and ledger controls without changing a trustline or NFT." />
      <div className="xaman-segmented" role="tablist" aria-label="Asset type">
        <button type="button" role="tab" aria-selected={mode === "tokens"} className={mode === "tokens" ? "is-active" : ""} onClick={() => onMode("tokens")}>Tokens <span>{workspace?.trustlines.length ?? 0}</span></button>
        <button type="button" role="tab" aria-selected={mode === "nfts"} className={mode === "nfts" ? "is-active" : ""} onClick={() => onMode("nfts")}>NFTs <span>{workspace?.nfts.length ?? 0}</span></button>
      </div>
      {mode === "tokens" ? (
        <section className="xaman-list-stack" aria-label="Trustlines">
          {workspace?.trustlines.length ? workspace.trustlines.map((line, index) => (
            <article className="xaman-asset-card" key={`${line.issuer}-${line.currency}-${index}`}>
              <div className="xaman-asset-heading"><span className="xaman-asset-icon"><Tag size={21} /></span><div><p>{line.currency}</p><strong>{line.balance}</strong></div><StatusBadge tone={line.freeze || line.freezePeer ? "warning" : "positive"} text={line.freeze || line.freezePeer ? "Freeze flag" : "No freeze shown"} /></div>
              <DataRow label="Issuer" value={shortValue(line.issuer, 11, 8)} mono action={<button type="button" onClick={() => onCopy(line.issuer, "Issuer address")} aria-label="Copy issuer"><Copy size={16} /></button>} />
              <DataRow label="Trust limit" value={line.limit} />
              <div className="xaman-chip-row">
                <SmallChip active={line.noRipple} text="No Ripple" />
                <SmallChip active={line.authorized || line.peerAuthorized} text="Authorized" />
                <SmallChip active={line.freeze || line.freezePeer} warning text="Frozen" />
              </div>
              <p className="xaman-footnote">A listed balance or issuer is not an endorsement. Verify issuer identity independently.</p>
            </article>
          )) : <EmptyState icon={<Tag size={28} />} title="No trustlines loaded" text="The account has no loaded trustlines on this network, or the public query returned a partial result." />}
        </section>
      ) : (
        <section className="xaman-list-stack" aria-label="NFTs">
          {workspace?.nfts.length ? workspace.nfts.map((nft) => (
            <article className="xaman-asset-card" key={nft.id}>
              <div className="xaman-asset-heading"><span className="xaman-asset-icon"><Image size={21} /></span><div><p>NFT #{nft.serial || "—"}</p><strong>Taxon {nft.taxon}</strong></div><StatusBadge tone={nft.transferable ? "positive" : "neutral"} text={nft.transferable ? "Transferable" : "Restricted"} /></div>
              <DataRow label="NFTokenID" value={shortValue(nft.id, 12, 10)} mono action={<button type="button" onClick={() => onCopy(nft.id, "NFTokenID")} aria-label="Copy NFTokenID"><Copy size={16} /></button>} />
              <DataRow label="Issuer" value={shortValue(nft.issuer, 11, 8)} mono action={<button type="button" onClick={() => onCopy(nft.issuer, "NFT issuer")} aria-label="Copy NFT issuer"><Copy size={16} /></button>} />
              <DataRow label="Transfer fee" value={`${nft.transferFee}%`} />
              <DataRow label="URI" value={nft.uri || "No URI published"} mono />
              <div className="xaman-chip-row"><SmallChip active={nft.burnable} text="Issuer burnable" /><SmallChip active={nft.onlyXrp} text="XRP offers only" /><SmallChip active={nft.transferable} text="Transferable" /></div>
            </article>
          )) : <EmptyState icon={<Image size={28} />} title="No NFTs loaded" text="The account has no loaded XRPL NFTs on this network, or the public query returned a partial result." />}
        </section>
      )}
    </>
  );
}

function ActivityView({ transactions, onOpen, onInspect }: {
  transactions: XrplRecentTransaction[];
  onOpen: (hash: string) => void;
  onInspect: (hash: string) => void;
}) {
  return (
    <>
      <PageHeader eyebrow="Account history" title="Activity" text="The latest loaded transactions for the account selected in Xaman. Always confirm validated status and result." />
      <section className="xaman-list-stack">
        {transactions.length ? transactions.map((tx) => (
          <article className="xaman-transaction-card" key={`${tx.hash}-${tx.ledgerIndex}`}>
            <TransactionRow transaction={tx} />
            <div className="xaman-transaction-meta"><span>Ledger {tx.ledgerIndex || "—"}</span><span>{formatDate(tx.date)}</span></div>
            <div className="xaman-action-row">
              <button type="button" className="xaman-button xaman-button-secondary" onClick={() => onInspect(tx.hash)}><Search size={18} />Explain</button>
              <button type="button" className="xaman-button xaman-button-secondary" onClick={() => onOpen(tx.hash)} disabled={!tx.hash}><ExternalLink size={18} />Xaman details</button>
            </div>
          </article>
        )) : <EmptyState icon={<Activity size={28} />} title="No recent transactions loaded" text="The selected account may be new, inactive, or the ledger history query may be temporarily unavailable." />}
      </section>
    </>
  );
}

function ScanView(props: {
  network: string;
  hashInput: string;
  onHashInput: (value: string) => void;
  transaction: XrplTransactionSnapshot | null;
  transactionState: LoadState;
  transactionError: string;
  onVerify: () => void;
  onScan: () => void;
  onNativeTx: (hash: string) => void;
  addressInput: string;
  onAddressInput: (value: string) => void;
  addressProfile: XrplWalletProfile | null;
  addressTag: number | null;
  addressState: LoadState;
  addressError: string;
  onInspectAddress: () => void;
  onSelectDestination: () => void;
  selectedAccount: string;
  onCopy: (value: string, label: string) => void;
}) {
  const selectedAccountRole = props.transaction && props.selectedAccount
    ? props.transaction.account === props.selectedAccount
      ? "The selected Xaman account submitted this transaction."
      : props.transaction.destination === props.selectedAccount
        ? "The selected Xaman account is the destination."
        : "This transaction does not directly involve the selected Xaman account."
    : "Results are compared with the selected Xaman account when available.";
  const requiresTag = props.addressProfile ? (props.addressProfile.accountFlags & 0x00020000) !== 0 : false;
  return (
    <>
      <PageHeader eyebrow="Read-only evidence tools" title="Scan & verify" text={`Every check uses ${props.network}. Scanning or selecting a destination never creates a transaction.`} />
      <section className="xaman-card">
        <SectionHeading icon={<Hash size={22} />} eyebrow="Transaction decoder" title="Verify a transaction hash" />
        <label className="xaman-field-label" htmlFor="xaman-transaction-hash">Transaction hash</label>
        <textarea id="xaman-transaction-hash" className="xaman-input" value={props.hashInput} onChange={(event) => props.onHashInput(event.target.value)} placeholder="64-character XRPL transaction hash" rows={3} autoCapitalize="characters" autoCorrect="off" spellCheck={false} />
        <div className="xaman-action-row">
          <button type="button" className="xaman-button xaman-button-primary" onClick={props.onVerify} disabled={props.transactionState === "loading"}>{props.transactionState === "loading" ? <Loader2 className="animate-spin" size={19} /> : <ShieldCheck size={19} />}{props.transactionState === "loading" ? "Checking…" : "Verify hash"}</button>
          <button type="button" className="xaman-button xaman-button-secondary" onClick={props.onScan}><QrCode size={19} />Scan QR</button>
        </div>
        {props.transactionState === "error" ? <ErrorLine text={props.transactionError} /> : null}
        {props.transaction ? (
          <div className="xaman-result" role="status" aria-live="polite">
            <div className={props.transaction.validated && props.transaction.successful ? "xaman-result-status is-success" : "xaman-result-status is-warning"}>{props.transaction.validated && props.transaction.successful ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}<div><strong>{props.transaction.validated ? "Validated ledger result" : "Not validated"}</strong><span>{props.transaction.result}</span></div></div>
            <div className="xaman-session-grid">
              <DataPoint label="Type" value={props.transaction.transactionType} />
              <DataPoint label="Amount" value={props.transaction.amount} />
              <DataPoint label="Fee" value={`${props.transaction.feeXrp} XRP`} />
              <DataPoint label="Sender" value={shortValue(props.transaction.account)} mono />
              <DataPoint label="Destination" value={shortValue(props.transaction.destination)} mono />
              <DataPoint label="Destination tag" value={props.transaction.destinationTag === null ? "Not present" : String(props.transaction.destinationTag)} />
              <DataPoint label="Source tag" value={props.transaction.sourceTag === null ? "Not present" : String(props.transaction.sourceTag)} />
              <DataPoint label="Ledger" value={String(props.transaction.ledgerIndex)} />
              <DataPoint label="Date" value={formatDate(props.transaction.date)} />
            </div>
            <p className="xaman-footnote">{selectedAccountRole}</p>
            <button type="button" className="xaman-button xaman-button-secondary xaman-full-button" onClick={() => props.onNativeTx(props.transaction?.hash ?? "")}><ExternalLink size={18} />Open Xaman transaction details</button>
          </div>
        ) : null}
      </section>

      <section className="xaman-card">
        <SectionHeading icon={<Fingerprint size={22} />} eyebrow="Destination inspector" title="Check an XRPL address" />
        <p className="xaman-muted">Use Xaman's native picker to select, find or scan a destination. Xaman also checks whether a destination tag is required.</p>
        <label className="xaman-field-label" htmlFor="xaman-address">XRPL address</label>
        <input id="xaman-address" className="xaman-input xaman-single-input" value={props.addressInput} onChange={(event) => props.onAddressInput(event.target.value)} placeholder="r…" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        <div className="xaman-action-row">
          <button type="button" className="xaman-button xaman-button-primary" onClick={props.onSelectDestination}><Wallet size={19} />Xaman picker</button>
          <button type="button" className="xaman-button xaman-button-secondary" onClick={props.onInspectAddress} disabled={props.addressState === "loading"}>{props.addressState === "loading" ? <Loader2 className="animate-spin" size={19} /> : <Search size={19} />}Inspect</button>
        </div>
        {props.addressState === "error" ? <ErrorLine text={props.addressError} /> : null}
        {props.addressProfile ? (
          <div className="xaman-result">
            <div className={requiresTag && props.addressTag === null ? "xaman-result-status is-warning" : "xaman-result-status is-success"}>{requiresTag && props.addressTag === null ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}<div><strong>{requiresTag ? "Destination tag required" : "No required-tag flag detected"}</strong><span>{requiresTag && props.addressTag === null ? "Do not send without obtaining the correct tag from the recipient." : props.addressTag === null ? "No destination tag was selected." : `Selected destination tag: ${props.addressTag}`}</span></div></div>
            <DataRow label="Address" value={shortValue(props.addressProfile.address, 13, 10)} mono action={<button type="button" onClick={() => props.onCopy(props.addressProfile?.address ?? "", "Destination address")} aria-label="Copy destination"><Copy size={16} /></button>} />
            <DataRow label="Balance" value={`${props.addressProfile.balanceXrp} XRP`} />
            <DataRow label="Domain" value={props.addressProfile.domain || "No domain published"} />
            <DataRow label="Owner entries" value={String(props.addressProfile.ownerCount)} />
          </div>
        ) : null}
      </section>
    </>
  );
}

function SafetyView({ profile, workspace, warnings, onExternal }: {
  profile: XrplWalletProfile | null;
  workspace: XrplWalletWorkspace | null;
  warnings: string[];
  onExternal: (url: string) => void;
}) {
  const flags = profile ? activeAccountFlags(profile) : [];
  return (
    <>
      <PageHeader eyebrow="Account controls & education" title="Safety" text="Understand public account settings and learn what to verify before approving anything in Xaman." />
      <section className="xaman-card">
        <SectionHeading icon={<ShieldAlert size={22} />} eyebrow="Current snapshot" title={warnings.length ? "Items needing attention" : "No immediate warnings found"} />
        {warnings.length ? <ul className="xaman-warning-list">{warnings.map((warning) => <li key={warning}><AlertTriangle size={18} />{warning}</li>)}</ul> : <div className="xaman-positive-line"><CheckCircle2 size={20} />No supported high-attention flag was detected. This is not a guarantee of safety.</div>}
      </section>

      <section className="xaman-card">
        <SectionHeading icon={<Flag size={22} />} eyebrow="AccountRoot flags" title="Active account controls" />
        {flags.length ? <div className="xaman-flag-grid">{flags.map((flag) => <StatusBadge key={flag.label} tone={flag.tone} text={flag.label} />)}</div> : <p className="xaman-muted">No supported AccountRoot flags are active in the current snapshot.</p>}
        <div className="xaman-security-grid">
          <SecurityItem icon={<KeyRound size={19} />} label="Regular Key" value={profile?.regularKey ? shortValue(profile.regularKey) : "Not configured"} />
          <SecurityItem icon={<LockKeyhole size={19} />} label="Signer lists" value={String(profile?.signerListCount ?? 0)} />
          <SecurityItem icon={<BadgeCheck size={19} />} label="Deposit preauth" value={String(profile?.depositPreauthCount ?? 0)} />
          <SecurityItem icon={<FileText size={19} />} label="Escrows / checks" value={`${profile?.escrowCount ?? 0} / ${profile?.checkCount ?? 0}`} />
          <SecurityItem icon={<Activity size={19} />} label="Offers / channels" value={`${profile?.offerCount ?? 0} / ${profile?.paymentChannelCount ?? 0}`} />
          <SecurityItem icon={<Network size={19} />} label="Ledger objects" value={String(profile?.objectCountLoaded ?? 0)} />
        </div>
        {workspace?.profile.partial ? <p className="xaman-footnote">Partial result: at least one public query failed or returned a pagination marker.</p> : null}
      </section>

      <section className="xaman-card">
        <SectionHeading icon={<BookOpenCheck size={22} />} eyebrow="Five safety lessons" title="Before you approve" />
        <div className="xaman-lessons">{SAFETY_LESSONS.map((lesson, index) => <article key={lesson.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{lesson.title}</strong><p>{lesson.text}</p></div></article>)}</div>
      </section>

      <section className="xaman-card">
        <SectionHeading icon={<LifeBuoy size={22} />} eyebrow="Accountability" title="Support and transparency" />
        <p className="xaman-muted">Customer and technical support: <strong>info@onthetrack.com</strong>. Never include a seed phrase, private key or recovery words.</p>
        <div className="xaman-link-grid">
          <ExternalButton icon={<LifeBuoy size={18} />} label="Support" onClick={() => onExternal(currentOriginUrl("/xapp-support.html"))} />
          <ExternalButton icon={<FileText size={18} />} label="Privacy" onClick={() => onExternal(currentOriginUrl("/privacy.html"))} />
          <ExternalButton icon={<FileText size={18} />} label="Terms" onClick={() => onExternal(currentOriginUrl("/terms.html"))} />
          <ExternalButton icon={<FileCode2 size={18} />} label="Source code" onClick={() => onExternal(SOURCE_REPOSITORY)} />
        </div>
      </section>

      <footer className="xaman-xapp-footer"><p>OTT Xaman Safety Companion · SourceTag 2606170002</p><p>Read-only educational utility. No custody and no financial advice.</p></footer>
    </>
  );
}

function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <header className="xaman-page-header"><p className="xaman-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></header>;
}

function SectionHeading({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return <div className="xaman-section-heading"><div className="xaman-section-title-row"><span className="xaman-section-icon">{icon}</span><div><p className="xaman-eyebrow">{eyebrow}</p><h2>{title}</h2></div></div></div>;
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <article className="xaman-stat-card"><span>{icon}</span><p>{label}</p><strong>{value}</strong></article>;
}

function TransactionRow({ transaction, onClick }: { transaction: XrplRecentTransaction; onClick?: () => void }) {
  const directionIcon = transaction.direction === "incoming" ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />;
  const content = <><span className={`xaman-direction-icon is-${transaction.direction}`}>{directionIcon}</span><div className="xaman-transaction-main"><strong>{transaction.transactionType}</strong><span>{transaction.counterparty ? shortValue(transaction.counterparty, 9, 6) : transaction.direction}</span></div><div className="xaman-transaction-value"><strong>{transaction.amount}</strong><span className={transaction.successful && transaction.validated ? "is-ok" : "is-attention"}>{transaction.result}</span></div></>;
  return onClick ? <button type="button" className="xaman-transaction-row" onClick={onClick}>{content}</button> : <div className="xaman-transaction-row">{content}</div>;
}

function DataPoint({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="xaman-data-point"><span>{label}</span><strong className={mono ? "is-mono" : ""}>{value}</strong></div>;
}

function DataRow({ label, value, mono = false, action }: { label: string; value: string; mono?: boolean; action?: ReactNode }) {
  return <div className="xaman-data-row"><span>{label}</span><strong className={mono ? "is-mono" : ""}>{value}</strong>{action}</div>;
}

function StatusBadge({ tone, text }: { tone: "positive" | "warning" | "neutral"; text: string }) {
  return <span className={`xaman-status-badge is-${tone}`}>{tone === "positive" ? <CheckCircle2 size={14} /> : tone === "warning" ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}{text}</span>;
}

function SmallChip({ active, warning = false, text }: { active: boolean; warning?: boolean; text: string }) {
  return <span className={`xaman-small-chip ${active ? warning ? "is-warning" : "is-active" : ""}`}>{active ? <CheckCircle2 size={13} /> : null}{text}</span>;
}

function SecurityItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="xaman-security-item"><span>{icon}</span><div><p>{label}</p><strong>{value}</strong></div></div>;
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="xaman-empty-state"><span>{icon}</span><strong>{title}</strong><p>{text}</p></div>;
}

function LoadingLine({ text }: { text: string }) {
  return <div className="xaman-loading" role="status"><Loader2 className="animate-spin" size={20} />{text}</div>;
}

function ErrorLine({ text }: { text: string }) {
  return <div className="xaman-error" role="alert"><AlertTriangle size={20} />{text}</div>;
}

function ExternalButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" className="xaman-button xaman-button-secondary" onClick={onClick}>{icon}{label}<ExternalLink size={16} /></button>;
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" className={active ? "is-active" : ""} aria-current={active ? "page" : undefined} onClick={onClick}>{icon}<span>{label}</span></button>;
}
