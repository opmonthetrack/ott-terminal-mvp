import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  FileText,
  Hash,
  LifeBuoy,
  Loader2,
  LogOut,
  QrCode,
  RefreshCcw,
  ScanLine,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  loadXrplTransactionSnapshot,
  loadXrplWalletProfile,
  type XrplTransactionSnapshot,
  type XrplWalletProfile,
} from "../lib/xrplWalletProfile";
import {
  extractXrplTransactionHash,
  getXamanXappTheme,
  initializeXamanXapp,
  type XamanQrEvent,
  type XamanXappRuntime,
} from "../lib/xamanXappRuntime";
import "./xaman-xapp.css";

type LoadState = "idle" | "loading" | "success" | "error";

const SOURCE_REPOSITORY = "https://github.com/opmonthetrack/ott-terminal-mvp";

function shortValue(value: string, start = 8, end = 6) {
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

function currentOriginUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

export function XamanXapp() {
  const [runtime, setRuntime] = useState<XamanXappRuntime | null>(null);
  const [sessionState, setSessionState] = useState<LoadState>("loading");
  const [sessionError, setSessionError] = useState("");
  const [profile, setProfile] = useState<XrplWalletProfile | null>(null);
  const [profileState, setProfileState] = useState<LoadState>("idle");
  const [profileError, setProfileError] = useState("");
  const [hashInput, setHashInput] = useState("");
  const [transaction, setTransaction] = useState<XrplTransactionSnapshot | null>(null);
  const [transactionState, setTransactionState] = useState<LoadState>("idle");
  const [transactionError, setTransactionError] = useState("");
  const [notice, setNotice] = useState("");
  const theme = runtime?.theme ?? getXamanXappTheme();

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
        if (nextRuntime.preview) {
          setNotice("Browser preview: Xaman supplies the selected account and network only inside the live xApp.");
        }
      })
      .catch((error) => {
        if (!active) return;
        setSessionState("error");
        setSessionError(error instanceof Error ? error.message : "Xaman context could not be loaded.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!runtime?.account) return;
    let active = true;
    setProfileState("loading");
    setProfileError("");

    void loadXrplWalletProfile(runtime.account, runtime.network)
      .then((nextProfile) => {
        if (!active) return;
        setProfile(nextProfile);
        setProfileState("success");
      })
      .catch((error) => {
        if (!active) return;
        setProfileState("error");
        setProfileError(error instanceof Error ? error.message : "The wallet snapshot could not be loaded.");
      });

    return () => {
      active = false;
    };
  }, [runtime?.account, runtime?.network]);

  async function refreshProfile() {
    if (!runtime?.account) return;
    setProfileState("loading");
    setProfileError("");
    try {
      setProfile(await loadXrplWalletProfile(runtime.account, runtime.network));
      setProfileState("success");
    } catch (error) {
      setProfileState("error");
      setProfileError(error instanceof Error ? error.message : "The wallet snapshot could not be loaded.");
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
      const result = await loadXrplTransactionSnapshot(hash, runtime?.network ?? "mainnet");
      setTransaction(result);
      setTransactionState("success");
    } catch (error) {
      setTransactionState("error");
      setTransactionError(error instanceof Error ? error.message : "The transaction could not be verified.");
    }
  }

  function scanTransactionQr() {
    const bridge = runtime?.bridge;
    if (!bridge) {
      setNotice("The native QR scanner is available only when this page is opened as an xApp in Xaman.");
      return;
    }

    const handleQr = (event: XamanQrEvent) => {
      bridge.off?.("qr", handleQr);
      if (event.reason !== "SCANNED" || !event.qrContents) {
        setNotice("No transaction hash was scanned.");
        return;
      }
      const hash = extractXrplTransactionHash(event.qrContents);
      if (!hash) {
        setNotice("The QR code did not contain a valid XRPL transaction hash.");
        return;
      }
      setNotice("Transaction hash scanned. Checking the selected network now.");
      void verifyTransaction(hash);
    };

    bridge.on("qr", handleQr);
    void Promise.resolve(bridge.scanQr()).catch(() => {
      bridge.off?.("qr", handleQr);
      setNotice("Xaman could not open the QR scanner.");
    });
  }

  function openExternal(url: string) {
    if (!runtime?.bridge) {
      setNotice("Open the live xApp in Xaman to use its confirmed external-browser flow.");
      return;
    }
    void Promise.resolve(runtime.bridge.openBrowser({ url })).catch(() => {
      setNotice("Xaman could not open the external page.");
    });
  }

  function closeXapp() {
    if (!runtime?.bridge) {
      setNotice("The close action is available only inside Xaman.");
      return;
    }
    void Promise.resolve(runtime.bridge.close({ refreshEvents: false })).catch(() => {
      setNotice("Xaman could not close the xApp automatically.");
    });
  }

  const selectedAccountRole = transaction && runtime?.account
    ? transaction.account === runtime.account
      ? "The selected Xaman account submitted this transaction."
      : transaction.destination === runtime.account
        ? "The selected Xaman account is the destination."
        : "This transaction does not directly involve the selected Xaman account."
    : "Open the live xApp to compare a transaction with the selected Xaman account.";

  return (
    <main className="xaman-xapp-shell" data-theme={theme}>
      <div className="xaman-xapp-container">
        <header className="xaman-xapp-header">
          <div className="xaman-brand-row">
            <img src="/logo.png" alt="OnTheTrack" className="xaman-brand-logo" />
            <div>
              <p className="xaman-eyebrow">OTT · Xaman Safety Companion</p>
              <p className="xaman-third-party">Independent xApp by OnTheTrack · not operated by Xaman</p>
            </div>
          </div>

          <h1>Selected wallet. Clear checks. No signing.</h1>
          <p className="xaman-lead">
            Review public data for the account selected in Xaman and inspect an XRPL transaction hash before relying on it.
            This xApp is read-only: it creates no payment, trustline, token, NFT or signing request.
          </p>

          <div className="xaman-trust-row" aria-label="Safety boundaries">
            <TrustPill icon={<ShieldCheck size={18} />} text="Read-only" />
            <TrustPill icon={<Wallet size={18} />} text="Self-custody" />
            <TrustPill icon={<Hash size={18} />} text="Public XRPL data" />
          </div>
        </header>

        {notice ? (
          <div className="xaman-notice" role="status" aria-live="polite">
            <ShieldCheck size={20} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="xaman-card" aria-labelledby="xaman-session-title" aria-busy={sessionState === "loading"}>
          <SectionHeading
            icon={<Wallet size={22} />}
            eyebrow="Xaman context"
            title="Selected account and network"
            action={runtime?.bridge ? (
              <button type="button" className="xaman-button xaman-button-quiet" onClick={closeXapp}>
                <LogOut size={18} /> Close
              </button>
            ) : null}
          />

          {sessionState === "loading" ? <LoadingLine text="Reading verified Xaman context…" /> : null}
          {sessionState === "error" ? <ErrorLine text={sessionError} /> : null}
          {runtime ? (
            <div className="xaman-session-grid" id="xaman-session-title">
              <DataPoint label="Account" value={runtime.account ? shortValue(runtime.account, 10, 8) : "Available in live xApp"} mono />
              <DataPoint label="Network" value={runtime.networkType} />
              <DataPoint label="Mode" value={runtime.preview ? "Browser preview" : "Xaman xApp"} />
            </div>
          ) : null}
        </section>

        <section className="xaman-card" aria-labelledby="wallet-snapshot-title" aria-busy={profileState === "loading"}>
          <SectionHeading
            icon={<ScanLine size={22} />}
            eyebrow="Read-only check"
            title="Wallet snapshot"
            action={runtime?.account ? (
              <button type="button" className="xaman-button xaman-button-quiet" onClick={() => void refreshProfile()} disabled={profileState === "loading"}>
                <RefreshCcw className={profileState === "loading" ? "animate-spin" : ""} size={18} /> Refresh
              </button>
            ) : null}
          />

          {!runtime?.account && sessionState !== "error" ? (
            <p className="xaman-muted" id="wallet-snapshot-title">The live xApp loads this section automatically for the account selected in Xaman.</p>
          ) : null}
          {profileState === "loading" ? <LoadingLine text="Loading validated ledger data…" /> : null}
          {profileState === "error" ? <ErrorLine text={profileError} /> : null}
          {profile ? (
            <>
              <div className="xaman-metric-grid" id="wallet-snapshot-title">
                <Metric label="XRP balance" value={profile.balanceXrp} />
                <Metric label="Owner entries" value={String(profile.ownerCount)} />
                <Metric label="Trustlines" value={String(profile.trustlineCount)} />
                <Metric label="NFTs" value={String(profile.nftCount)} />
                <Metric label="Signer lists" value={String(profile.signerListCount)} />
                <Metric label="Ledger" value={String(profile.ledgerIndex)} />
              </div>
              <p className="xaman-footnote">
                {profile.partial
                  ? "Partial result: one or more public XRPL queries were unavailable or paginated. Do not treat these counts as complete."
                  : "Loaded from a validated ledger. Counts describe public ledger objects and do not judge their safety or value."}
              </p>
            </>
          ) : null}
        </section>

        <section className="xaman-card" aria-labelledby="transaction-check-title" aria-busy={transactionState === "loading"}>
          <SectionHeading icon={<Hash size={22} />} eyebrow="Evidence check" title="Verify a transaction hash" />
          <p className="xaman-muted" id="transaction-check-title">
            Paste a 64-character hash or scan a QR code. OTT reads the transaction from the same XRPL network selected in Xaman and never changes the ledger.
          </p>

          <label className="xaman-field-label" htmlFor="xaman-transaction-hash">Transaction hash</label>
          <textarea
            id="xaman-transaction-hash"
            className="xaman-input"
            value={hashInput}
            onChange={(event) => setHashInput(event.target.value)}
            placeholder="64-character XRPL transaction hash"
            rows={3}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          <div className="xaman-action-row">
            <button type="button" className="xaman-button xaman-button-primary" onClick={() => void verifyTransaction()} disabled={transactionState === "loading"}>
              {transactionState === "loading" ? <Loader2 className="animate-spin" size={19} /> : <ShieldCheck size={19} />}
              {transactionState === "loading" ? "Checking…" : "Verify hash"}
            </button>
            <button type="button" className="xaman-button xaman-button-secondary" onClick={scanTransactionQr}>
              <QrCode size={19} /> Scan QR in Xaman
            </button>
          </div>

          {transactionState === "error" ? <ErrorLine text={transactionError} /> : null}
          {transaction ? (
            <div className="xaman-result" role="status" aria-live="polite">
              <div className={transaction.validated && transaction.successful ? "xaman-result-status is-success" : "xaman-result-status is-warning"}>
                {transaction.validated && transaction.successful ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                <div>
                  <strong>{transaction.validated ? "Validated ledger result" : "Not validated"}</strong>
                  <span>{transaction.result}</span>
                </div>
              </div>
              <div className="xaman-session-grid">
                <DataPoint label="Type" value={transaction.transactionType} />
                <DataPoint label="Amount" value={transaction.amount} />
                <DataPoint label="Fee" value={`${transaction.feeXrp} XRP`} />
                <DataPoint label="Sender" value={shortValue(transaction.account)} mono />
                <DataPoint label="Destination" value={transaction.destination ? shortValue(transaction.destination) : "Not present"} mono />
                <DataPoint label="Destination tag" value={transaction.destinationTag === null ? "Not present" : String(transaction.destinationTag)} />
              </div>
              <p className="xaman-footnote">{selectedAccountRole}</p>
            </div>
          ) : null}
        </section>

        <section className="xaman-card" aria-labelledby="safety-checklist-title">
          <SectionHeading icon={<ShieldCheck size={22} />} eyebrow="Before approval" title="Use Xaman's signing screen as the final check" />
          <ul className="xaman-checklist" id="safety-checklist-title">
            <li>Confirm the transaction type and selected account.</li>
            <li>Confirm destination, amount, issuer and destination tag when present.</li>
            <li>Reject unexpected payments, trustlines, offers or NFT actions.</li>
            <li>Never enter a seed phrase, recovery words or private key into OTT.</li>
          </ul>
        </section>

        <section className="xaman-card" aria-labelledby="transparency-title">
          <SectionHeading icon={<LifeBuoy size={22} />} eyebrow="Accountability" title="Support and transparency" />
          <p className="xaman-muted" id="transparency-title">
            Customer and technical support: <strong>info@onthetrack.com</strong>. Never include a seed phrase, private key or recovery words in a support request.
          </p>
          <div className="xaman-link-grid">
            <ExternalButton icon={<LifeBuoy size={18} />} label="Support" onClick={() => openExternal(currentOriginUrl("/xapp-support.html"))} />
            <ExternalButton icon={<FileText size={18} />} label="Privacy" onClick={() => openExternal(currentOriginUrl("/privacy.html"))} />
            <ExternalButton icon={<FileText size={18} />} label="Terms" onClick={() => openExternal(currentOriginUrl("/terms.html"))} />
            <ExternalButton icon={<FileCode2 size={18} />} label="Source code" onClick={() => openExternal(SOURCE_REPOSITORY)} />
          </div>
        </section>

        <footer className="xaman-xapp-footer">
          <p>OTT Xaman Safety Companion · SourceTag 2606170002</p>
          <p>Read-only educational utility. No custody and no financial advice.</p>
        </footer>
      </div>
    </main>
  );
}

function TrustPill({ icon, text }: { icon: ReactNode; text: string }) {
  return <span className="xaman-trust-pill">{icon}{text}</span>;
}

function SectionHeading({
  icon,
  eyebrow,
  title,
  action,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="xaman-section-heading">
      <div className="xaman-section-title-row">
        <span className="xaman-section-icon">{icon}</span>
        <div>
          <p className="xaman-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      {action}
    </div>
  );
}

function DataPoint({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="xaman-data-point">
      <span>{label}</span>
      <strong className={mono ? "is-mono" : ""}>{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="xaman-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LoadingLine({ text }: { text: string }) {
  return <div className="xaman-loading" role="status"><Loader2 className="animate-spin" size={20} />{text}</div>;
}

function ErrorLine({ text }: { text: string }) {
  return <div className="xaman-error" role="alert"><AlertTriangle size={20} />{text}</div>;
}

function ExternalButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" className="xaman-button xaman-button-secondary" onClick={onClick}>
      {icon}{label}<ExternalLink size={16} />
    </button>
  );
}
