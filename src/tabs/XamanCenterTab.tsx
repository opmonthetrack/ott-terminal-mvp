import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  Loader2,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Wallet,
  XCircle,
} from "lucide-react";
import { OTTLogoMark } from "../components/OTTLogo";
import { isMobileDevice, openXamanMobileDeepLink } from "../lib/xamanMobileSession";
import {
  createXamanSignIn,
  getXamanSignInQr,
  getXamanSignInUrl,
  getXamanSignInUuid,
  verifyXamanSignIn,
  type XamanSignInCreateResponse,
} from "../lib/xamanSignInClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type XamanCenterTabProps = {
  walletAddress?: string;
  onWalletConnected?: (walletAddress: string) => void;
};

type FlowState = "idle" | "creating" | "waiting" | "verifying" | "success" | "error";

function isXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function shortWallet(address: string) {
  return address.length > 14 ? `${address.slice(0, 7)}…${address.slice(-5)}` : address;
}

export function XamanCenterTab({
  walletAddress = "guest",
  onWalletConnected,
}: XamanCenterTabProps) {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const [response, setResponse] = useState<XamanSignInCreateResponse | null>(null);
  const [flow, setFlow] = useState<FlowState>("idle");
  const [message, setMessage] = useState("");
  const [verifiedAccount, setVerifiedAccount] = useState("");

  const uuid = getXamanSignInUuid(response);
  const signingUrl = getXamanSignInUrl(response);
  const qrUrl = getXamanSignInQr(response);
  const alreadyConnected = isXrplAddress(walletAddress);
  const mobile = useMemo(() => isMobileDevice(), []);

  const cleanReturnUrl = useCallback((target = "xaman") => {
    const url = new URL(window.location.href);
    url.searchParams.delete("xaman_signin_return");
    url.searchParams.delete("payload");
    url.searchParams.set("tab", target);
    window.history.replaceState({}, document.title, url.toString());
  }, []);

  const completeConnection = useCallback((account: string) => {
    setVerifiedAccount(account);
    setFlow("success");
    setMessage(en ? "Wallet ownership verified. Opening your wallet profile…" : "Walletbezit geverifieerd. Je walletprofiel wordt geopend…");
    cleanReturnUrl("wallet");
    onWalletConnected?.(account);
  }, [cleanReturnUrl, en, onWalletConnected]);

  const verifyUuid = useCallback(async (payloadUuid: string, showBusy = true) => {
    if (showBusy) setFlow("verifying");

    try {
      const result = await verifyXamanSignIn(payloadUuid);
      if (result.signed && result.account && isXrplAddress(result.account)) {
        completeConnection(result.account);
        return;
      }

      if (result.declined || (result.resolved && !result.signed)) {
        setFlow("error");
        setMessage(en ? "The Xaman SignIn request was declined or expired." : "Het Xaman SignIn-verzoek is geweigerd of verlopen.");
        cleanReturnUrl();
        return;
      }

      setFlow("waiting");
      setMessage(en ? "Waiting for your signature in Xaman…" : "Wachten op je handtekening in Xaman…");
    } catch (error) {
      setFlow("error");
      setMessage(error instanceof Error ? error.message : (en ? "Xaman SignIn verification failed." : "Xaman SignIn-verificatie is mislukt."));
    }
  }, [cleanReturnUrl, completeConnection, en]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedUuid = params.get("payload")?.trim() ?? "";
    if (params.get("xaman_signin_return") !== "1" || !returnedUuid) return;

    setResponse({ ok: true, mode: "xaman-signin", payload: { uuid: returnedUuid } });
    void verifyUuid(returnedUuid);
  }, [verifyUuid]);

  useEffect(() => {
    if (!uuid || flow !== "waiting") return;
    const timer = window.setInterval(() => void verifyUuid(uuid, false), 4500);
    return () => window.clearInterval(timer);
  }, [flow, uuid, verifyUuid]);

  async function startSignIn() {
    setFlow("creating");
    setMessage(en ? "Creating a signature-only Xaman request…" : "Een Xaman-verzoek zonder betaling wordt gemaakt…");
    setVerifiedAccount("");

    try {
      const created = await createXamanSignIn();
      const createdUuid = getXamanSignInUuid(created);
      const createdUrl = getXamanSignInUrl(created);
      if (!created.ok || !createdUuid || !createdUrl) {
        throw new Error(en ? "Xaman did not return a complete SignIn request." : "Xaman gaf geen volledig SignIn-verzoek terug.");
      }

      setResponse(created);
      setFlow("waiting");
      setMessage(en
        ? (mobile ? "Opening Xaman. Return here after signing." : "Scan the QR code with Xaman or open the signing link.")
        : (mobile ? "Xaman wordt geopend. Kom na ondertekening hier terug." : "Scan de QR-code met Xaman of open de ondertekenlink."));

      if (mobile) {
        const opened = openXamanMobileDeepLink(createdUrl);
        if (!opened) {
          setMessage(en ? "The request is ready, but Xaman could not be opened automatically." : "Het verzoek is klaar, maar Xaman kon niet automatisch worden geopend.");
        }
      }
    } catch (error) {
      setFlow("error");
      setMessage(error instanceof Error ? error.message : (en ? "Could not create Xaman SignIn." : "Xaman SignIn kon niet worden gemaakt."));
    }
  }

  function openSigningRequest() {
    if (!signingUrl) return;
    if (mobile) {
      openXamanMobileDeepLink(signingUrl);
    } else {
      window.open(signingUrl, "_blank", "noopener,noreferrer");
    }
  }

  function reset() {
    setResponse(null);
    setVerifiedAccount("");
    setFlow("idle");
    setMessage("");
    cleanReturnUrl();
  }

  return (
    <div className="ott-nft-page min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="ott-nft-orb ott-nft-orb-blue" />
        <div className="ott-nft-orb ott-nft-orb-pink" />
        <div className="ott-nft-grid" />

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="ott-nft-logo-shell"><OTTLogoMark size={40} /></span>
                <div>
                  <p className="ott-nft-kicker">OTT Terminal · XRPL Wallet Hub</p>
                  <p className="ott-nft-muted mt-1 text-xs">Signature-only wallet verification</p>
                </div>
              </div>

              <h1 className="ott-nft-title mt-8 max-w-3xl text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
                {en ? "Sync Xaman. Prove ownership. Keep custody." : "Synchroniseer Xaman. Bewijs bezit. Behoud custody."}
              </h1>
              <p className="ott-nft-copy mt-6 max-w-2xl text-base leading-7 sm:text-lg">
                {en
                  ? "This connection uses Xaman SignIn: one signature to verify the XRPL account. No XRP payment, trustline or transaction is created just to connect."
                  : "Deze koppeling gebruikt Xaman SignIn: één handtekening om het XRPL-account te verifiëren. Er wordt geen XRP-betaling, trustline of transactie gemaakt om alleen te koppelen."}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <TrustPoint icon={Fingerprint} title={en ? "Signature only" : "Alleen handtekening"} />
                <TrustPoint icon={ShieldCheck} title={en ? "Self-custody" : "Self-custody"} />
                <TrustPoint icon={Wallet} title={en ? "No seed phrase" : "Geen seed phrase"} />
              </div>
            </div>

            <section className="ott-nft-card p-5 sm:p-7" aria-labelledby="xaman-signin-title">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="ott-nft-kicker">Xaman SignIn</p>
                  <h2 id="xaman-signin-title" className="ott-nft-heading mt-2 text-2xl font-semibold">
                    {alreadyConnected ? (en ? "Wallet synchronized" : "Wallet gesynchroniseerd") : (en ? "Initialize wallet link" : "Initialiseer walletkoppeling")}
                  </h2>
                </div>
                <FlowIcon flow={flow} />
              </div>

              {alreadyConnected && flow === "idle" && (
                <div className="ott-nft-success mt-6 rounded-2xl p-4">
                  <p className="text-xs font-semibold">XRPL Mainnet · verified session</p>
                  <p className="mt-2 font-data text-sm">{shortWallet(walletAddress)}</p>
                </div>
              )}

              {message && (
                <div className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${flow === "error" ? "ott-nft-error" : flow === "success" ? "ott-nft-success" : "ott-nft-status"}`} role="status" aria-live="polite">
                  <div className="flex gap-3">
                    {flow === "creating" || flow === "verifying" || flow === "waiting" ? <Loader2 className="mt-0.5 shrink-0 animate-spin" size={18} /> : flow === "error" ? <XCircle className="mt-0.5 shrink-0" size={18} /> : <CheckCircle2 className="mt-0.5 shrink-0" size={18} />}
                    <span>{message}</span>
                  </div>
                </div>
              )}

              {qrUrl && flow !== "success" && (
                <div className="mt-6 grid gap-5 sm:grid-cols-[160px_1fr] sm:items-center">
                  <div className="rounded-2xl bg-white p-3 shadow-xl">
                    <img src={qrUrl} alt={en ? "Xaman SignIn QR code" : "Xaman SignIn QR-code"} className="aspect-square w-full" />
                  </div>
                  <div>
                    <p className="ott-nft-heading text-sm font-semibold">{en ? "Desktop QR" : "Desktop-QR"}</p>
                    <p className="ott-nft-muted mt-2 text-sm leading-6">
                      {en ? "Open Xaman on your phone, scan the code and approve the SignIn request." : "Open Xaman op je telefoon, scan de code en keur het SignIn-verzoek goed."}
                    </p>
                    {uuid && <p className="ott-nft-muted mt-3 break-all font-data text-[11px]">{uuid}</p>}
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {!uuid ? (
                  <button type="button" onClick={() => void startSignIn()} disabled={flow === "creating"} className="ott-nft-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60">
                    {flow === "creating" ? <Loader2 className="animate-spin" size={18} /> : mobile ? <Smartphone size={18} /> : <QrCode size={18} />}
                    {flow === "creating" ? (en ? "Creating request…" : "Verzoek maken…") : (en ? "Connect with Xaman" : "Koppel met Xaman")}
                    {flow !== "creating" && <ArrowRight size={17} />}
                  </button>
                ) : flow !== "success" ? (
                  <>
                    <button type="button" onClick={openSigningRequest} className="ott-nft-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold">
                      <ExternalLink size={17} />
                      {en ? "Open Xaman" : "Open Xaman"}
                    </button>
                    <button type="button" onClick={() => uuid && void verifyUuid(uuid)} disabled={flow === "verifying"} className="ott-nft-secondary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60">
                      {flow === "verifying" ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}
                      {en ? "Verify" : "Verifieer"}
                    </button>
                  </>
                ) : (
                  <div className="ott-nft-success flex w-full items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold">
                    <CheckCircle2 size={18} />
                    {shortWallet(verifiedAccount)}
                  </div>
                )}
              </div>

              {(flow === "error" || alreadyConnected) && (
                <button type="button" onClick={reset} className="ott-nft-link mt-4 text-xs font-semibold">
                  {en ? "Create a new SignIn request" : "Maak een nieuw SignIn-verzoek"}
                </button>
              )}
            </section>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <Step number="01" title={en ? "Create SignIn" : "Maak SignIn"} text={en ? "OTT requests a signature, not a payment." : "OTT vraagt een handtekening, geen betaling."} />
          <Step number="02" title={en ? "Approve in Xaman" : "Keur goed in Xaman"} text={en ? "Review the request inside your self-custody wallet." : "Controleer het verzoek in je self-custody wallet."} />
          <Step number="03" title={en ? "Return verified" : "Keer geverifieerd terug"} text={en ? "OTT links the signed XRPL account to this browser session." : "OTT koppelt het ondertekende XRPL-account aan deze browsersessie."} />
        </div>

        <div className="ott-nft-note mt-6 rounded-2xl p-5 text-sm leading-7">
          <strong>{en ? "After connection:" : "Na het koppelen:"}</strong>{" "}
          {en
            ? "SourceTag Proof, Daily Proof, voting and payments remain separate actions. You always see the exact action before Xaman asks you to sign."
            : "SourceTag Proof, Daily Proof, stemmen en betalingen blijven aparte acties. Je ziet altijd de exacte actie voordat Xaman om een handtekening vraagt."}
        </div>
      </section>
    </div>
  );
}

function TrustPoint({ icon: Icon, title }: { icon: typeof ShieldCheck; title: string }) {
  return (
    <div className="ott-nft-mini-card flex items-center gap-3 rounded-2xl p-3">
      <span className="ott-nft-icon-small"><Icon size={17} /></span>
      <span className="text-xs font-semibold">{title}</span>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="ott-nft-card rounded-2xl p-5">
      <span className="ott-nft-kicker font-data">{number}</span>
      <h3 className="ott-nft-heading mt-3 text-lg font-semibold">{title}</h3>
      <p className="ott-nft-muted mt-2 text-sm leading-6">{text}</p>
    </article>
  );
}

function FlowIcon({ flow }: { flow: FlowState }) {
  const busy = flow === "creating" || flow === "waiting" || flow === "verifying";
  return (
    <span className="ott-nft-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
      {busy ? <Loader2 className="animate-spin" size={22} /> : flow === "success" ? <CheckCircle2 size={22} /> : flow === "error" ? <XCircle size={22} /> : <Fingerprint size={22} />}
    </span>
  );
}
