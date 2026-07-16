import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Loader2,
  QrCode,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  OTT_ACCESS_PASS_ISSUER,
  OTT_ACCESS_PASS_METADATA_CID,
  OTT_ACCESS_PASS_METADATA_URI,
  OTT_ACCESS_PASS_TAXON,
  encodeNftUri,
  isLikelyXrplAddress,
  shortNftId,
} from "../lib/accessNftPass";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type FounderNftMintConsoleProps = {
  walletAddress?: string;
};

type MintPayloadResponse = {
  ok: boolean;
  mode?: string;
  sourceTag?: number;
  nft?: {
    issuerWallet: string;
    taxon: number;
    metadataCid: string;
    metadataUri: string;
    uriHex: string;
    flags: number;
    accessTier: string;
  };
  payload?: {
    uuid?: string;
    refs?: {
      qr_png?: string;
      qr_matrix?: string;
      websocket_status?: string;
    };
    next?: {
      always?: string;
      no_push_msg_received?: string;
    };
  };
  transactionMeta?: {
    transactionType: string;
    sourceTag: number;
    memoText: string;
  };
  error?: string;
  details?: unknown;
};

type NftPayloadVerificationResponse = {
  ok: boolean;
  mode?: string;
  sourceTag?: number;
  verified?: {
    signed: boolean;
    resolved: boolean;
    account: string | null;
    txid: string | null;
  };
  error?: string;
  details?: unknown;
};

type VerifiedAccessPassNft = {
  nftokenId: string;
  issuer: string;
  taxon: number;
  uri: string;
  decodedUri: string;
  flags?: number;
  serial?: number;
};

type AccessPassMintVerificationResponse = {
  ok: boolean;
  mode?: string;
  txHash?: string;
  verified?: {
    accessPassMintVerified: boolean;
    txValidated: boolean;
    txSuccess: boolean;
    transactionResult: string;
    isNftMint: boolean;
    issuerMatches: boolean;
    sourceTagMatches: boolean;
    taxonMatches: boolean;
    uriMatches: boolean;
    flagsMatch: boolean;
    issuerWallet: string;
    ledgerIndex: number | null;
  };
  mintedNftsFromMeta?: VerifiedAccessPassNft[];
  matchedIssuerNfts?: VerifiedAccessPassNft[];
  newestAccessPass?: VerifiedAccessPassNft | null;
  error?: string;
  details?: unknown;
};

const TF_TRANSFERABLE = 8;
const HASH_PATTERN = /^[A-Fa-f0-9]{64}$/;

function getPayloadUrl(response: MintPayloadResponse | null) {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}

function getPayloadUuid(response: MintPayloadResponse | null) {
  return response?.payload?.uuid ?? "";
}

function hasDiscoveredAccessPass(response: AccessPassMintVerificationResponse | null) {
  return Boolean(
    response?.newestAccessPass ||
      response?.matchedIssuerNfts?.length ||
      response?.mintedNftsFromMeta?.length,
  );
}

function isMintVerified(response: AccessPassMintVerificationResponse | null) {
  return Boolean(response?.verified?.accessPassMintVerified || hasDiscoveredAccessPass(response));
}

export function FounderNftMintConsole({
  walletAddress = "guest",
}: FounderNftMintConsoleProps) {
  const [issuerWallet, setIssuerWallet] = useState(OTT_ACCESS_PASS_ISSUER);
  const [accessTier, setAccessTier] = useState("Terminal Services");
  const [payloadResponse, setPayloadResponse] = useState<MintPayloadResponse | null>(null);
  const [verification, setVerification] =
    useState<NftPayloadVerificationResponse | null>(null);
  const [mintTxHash, setMintTxHash] = useState("");
  const [mintVerification, setMintVerification] =
    useState<AccessPassMintVerificationResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [mintVerifyBusy, setMintVerifyBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Founder-only. Creates a real XRPL NFTokenMint payload through Xaman; no automatic payment or access unlock runs here.",
  );

  const payloadUrl = getPayloadUrl(payloadResponse);
  const payloadUuid = getPayloadUuid(payloadResponse);
  const uriHex = useMemo(() => encodeNftUri(OTT_ACCESS_PASS_METADATA_URI), []);
  const issuerLooksValid = isLikelyXrplAddress(issuerWallet);
  const mintTxHashLooksValid = HASH_PATTERN.test(mintTxHash.trim());
  const connectedMatchesIssuer =
    walletAddress !== "guest" && walletAddress === issuerWallet;
  const verifiedNft =
    mintVerification?.mintedNftsFromMeta?.[0] ??
    mintVerification?.newestAccessPass ??
    mintVerification?.matchedIssuerNfts?.[0] ??
    null;
  const discoveredAccessPass = hasDiscoveredAccessPass(mintVerification);
  const finalMintVerified = isMintVerified(mintVerification);

  async function createMintPayload() {
    setBusy(true);
    setVerification(null);
    setMintVerification(null);
    setStatusMessage("Creating Xaman NFTokenMint payload...");

    try {
      const response = await fetch("/api/nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "xaman.createAccessPassMintPayload",
          issuerWallet,
          accessTier,
        }),
      });

      const data = (await response.json()) as MintPayloadResponse;

      if (!response.ok || !data.ok) {
        throw data;
      }

      setPayloadResponse(data);
      setStatusMessage(
        "Mint payload created. Open Xaman and sign only if the issuer wallet and metadata are correct.",
      );
    } catch (error) {
      const message =
        error && typeof error === "object" && "error" in error
          ? String((error as { error?: unknown }).error)
          : "Could not create NFT mint payload.";

      setStatusMessage(message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyPayload() {
    if (!payloadUuid) {
      setStatusMessage("Create a mint payload first.");
      return;
    }

    setVerifyBusy(true);
    setStatusMessage("Checking Xaman payload status...");

    try {
      const response = await fetch("/api/nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "xaman.verifyNftPayload",
          uuid: payloadUuid,
        }),
      });

      const data = (await response.json()) as NftPayloadVerificationResponse;

      if (!response.ok || !data.ok) {
        throw data;
      }

      setVerification(data);

      if (data.verified?.signed && data.verified.txid) {
        setMintTxHash(data.verified.txid);
        setStatusMessage("NFT mint signed. Now verify minted NFTokenID from XRPL.");
      } else if (data.verified?.resolved) {
        setStatusMessage("Payload resolved but not signed. Create a new payload when ready.");
      } else {
        setStatusMessage("Payload is still waiting for Xaman signature.");
      }
    } catch (error) {
      const message =
        error && typeof error === "object" && "error" in error
          ? String((error as { error?: unknown }).error)
          : "Could not verify NFT payload.";

      setStatusMessage(message);
    } finally {
      setVerifyBusy(false);
    }
  }

  async function verifyMintedNft() {
    if (!mintTxHashLooksValid) {
      setStatusMessage("Paste a valid 64-character mint tx hash first.");
      return;
    }

    setMintVerifyBusy(true);
    setStatusMessage("Checking XRPL mint transaction and issuer NFTs...");

    try {
      const response = await fetch("/api/nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "xrpl.verifyAccessPassMint",
          txHash: mintTxHash.trim(),
          issuerWallet,
        }),
      });

      const data = (await response.json()) as AccessPassMintVerificationResponse;

      if (!response.ok || !data.ok) {
        throw data;
      }

      setMintVerification(data);

      if (isMintVerified(data)) {
        setStatusMessage(
          "Mint verified. Matching OTT Access Pass NFT found on issuer wallet. Save the NFTokenID before sending.",
        );
      } else {
        setStatusMessage(
          "Mint lookup completed, but no matching OTT Access Pass NFT was found on the issuer wallet.",
        );
      }
    } catch (error) {
      const message =
        error && typeof error === "object" && "error" in error
          ? String((error as { error?: unknown }).error)
          : "Could not verify minted NFT.";

      setStatusMessage(message);
    } finally {
      setMintVerifyBusy(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setStatusMessage("Copied to clipboard.");
  }

  function openPayload() {
    if (!payloadUrl) {
      setStatusMessage("No Xaman payload URL available yet.");
      return;
    }

    window.open(payloadUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="border border-black/10 bg-white p-6 mb-6">
      <div className="grid grid-cols-12 gap-5 items-start">
        <div className="col-span-12 xl:col-span-5">
          <div className="flex items-center gap-2 mb-4 text-black/55">
            <KeyRound size={18} className="text-[#C83888]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
              Founder NFT Mint Console
            </p>
          </div>

          <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
            Mint OTT Access Pass
          </h3>

          <p className="font-mono text-sm text-black/55 leading-relaxed mb-5">
            Deze console maakt een echte Xaman payload voor NFTokenMint. Jij tekent zelf
            met de issuer wallet. Daarna verifieert de console de mint tx en zoekt de NFTokenID.
          </p>

          <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={17} className="text-[#C83888] mt-0.5 shrink-0" />
              <p className="font-mono text-xs text-black/60 leading-relaxed">
                Real mainnet action. Check issuer, metadata CID, taxon and legal wording before signing.
                No investment, yield, resale value or profit promise.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={Fingerprint} label="SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />
            <Metric icon={BadgeCheck} label="Taxon" value={String(OTT_ACCESS_PASS_TAXON)} />
            <Metric icon={ShieldCheck} label="Flags" value={`${TF_TRANSFERABLE} / Transferable`} />
            <Metric icon={Wallet} label="Connected" value={walletAddress === "guest" ? "Guest" : "Wallet"} />
          </div>

          {mintVerification?.verified && (
            <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-4">
              <p className="font-orbitron text-xs font-black uppercase mb-3">
                Mint Checks
              </p>
              <div className="space-y-2">
                <CheckLine ok={mintVerification.verified.txValidated} text="Transaction validated" />
                <CheckLine ok={mintVerification.verified.txSuccess} text={mintVerification.verified.transactionResult} />
                <CheckLine ok={mintVerification.verified.isNftMint} text="TransactionType NFTokenMint" />
                <CheckLine ok={mintVerification.verified.issuerMatches} text="Issuer wallet matched" />
                <CheckLine ok={mintVerification.verified.sourceTagMatches} text="SourceTag matched" />
                <CheckLine ok={mintVerification.verified.taxonMatches} text="Taxon matched" />
                <CheckLine ok={mintVerification.verified.uriMatches} text="Metadata URI/CID matched" />
                <CheckLine ok={mintVerification.verified.flagsMatch} text="Transferable flag matched" />
                <CheckLine ok={discoveredAccessPass} text="Issuer wallet holds matching OTT Access Pass" />
                <CheckLine ok={finalMintVerified} text="Final mint verification accepted" />
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <TextInput label="Issuer wallet" value={issuerWallet} onChange={setIssuerWallet} />
          <TextInput label="Access tier memo" value={accessTier} onChange={setAccessTier} />
          <InfoBox label="Metadata URI" value={OTT_ACCESS_PASS_METADATA_URI} onCopy={() => copyText(OTT_ACCESS_PASS_METADATA_URI)} />
          <InfoBox label="Metadata CID" value={OTT_ACCESS_PASS_METADATA_CID} onCopy={() => copyText(OTT_ACCESS_PASS_METADATA_CID)} />
          <InfoBox label="URI hex" value={uriHex} onCopy={() => copyText(uriHex)} />

          <div className="space-y-2">
            {!issuerLooksValid && <WarningLine text="Issuer wallet format is not valid." />}
            {walletAddress !== "guest" && !connectedMatchesIssuer && (
              <WarningLine text="Connected wallet is not the issuer wallet. Sign only with the issuer Xaman wallet." />
            )}
            {connectedMatchesIssuer && <PassLine text="Connected wallet matches issuer wallet." />}
          </div>

          {verifiedNft && (
            <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 p-4">
              <p className="font-orbitron text-xs font-black uppercase mb-3">
                Minted Access Pass
              </p>
              <div className="space-y-3">
                <InfoMini label="NFTokenID" value={verifiedNft.nftokenId} />
                <InfoMini label="Short ID" value={shortNftId(verifiedNft.nftokenId)} />
                <InfoMini label="Serial" value={verifiedNft.serial ? String(verifiedNft.serial) : "—"} />
                <InfoMini label="Issuer" value={verifiedNft.issuer} />
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <button
            onClick={createMintPayload}
            disabled={busy || !issuerLooksValid}
            className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 text-left hover:brightness-95 disabled:opacity-40 transition-all"
          >
            {busy ? <Loader2 size={18} className="animate-spin mb-3" /> : <Rocket size={18} className="mb-3" />}
            <p className="font-orbitron text-xs font-black uppercase mb-2">Create Mint Payload</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/75">Xaman NFTokenMint</p>
          </button>

          <button
            onClick={openPayload}
            disabled={!payloadUrl}
            className="w-full border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-white disabled:opacity-40 transition-all"
          >
            <ExternalLink size={18} className="text-[#3898E8] mb-3" />
            <p className="font-orbitron text-xs font-bold uppercase mb-2">Open Xaman</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/35">Sign manually</p>
          </button>

          <button
            onClick={verifyPayload}
            disabled={verifyBusy || !payloadUuid}
            className="w-full border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-white disabled:opacity-40 transition-all"
          >
            {verifyBusy ? <Loader2 size={18} className="animate-spin text-[#3898E8] mb-3" /> : <CheckCircle2 size={18} className="text-[#3898E8] mb-3" />}
            <p className="font-orbitron text-xs font-bold uppercase mb-2">Verify Payload</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/35">Get tx hash</p>
          </button>

          <label className="block border border-black/10 bg-[#F7F8FC] p-4">
            <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
              Mint tx hash
            </p>
            <textarea
              value={mintTxHash}
              onChange={(event) => setMintTxHash(event.target.value.trim())}
              className="w-full min-h-20 border border-black/10 bg-white px-3 py-3 font-mono text-[10px] text-black/70 outline-none focus:border-[#3898E8]"
            />
          </label>

          <button
            onClick={verifyMintedNft}
            disabled={mintVerifyBusy || !mintTxHashLooksValid || !issuerLooksValid}
            className="w-full border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-white disabled:opacity-40 transition-all"
          >
            {mintVerifyBusy ? <Loader2 size={18} className="animate-spin text-[#3898E8] mb-3" /> : <SearchCheck size={18} className="text-[#3898E8] mb-3" />}
            <p className="font-orbitron text-xs font-bold uppercase mb-2">Verify Minted NFT</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/35">Find NFTokenID</p>
          </button>

          <div className="border border-black/10 bg-[#F7F8FC] p-4">
            <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
              Status
            </p>
            <p className="font-mono text-xs text-black/60 leading-relaxed">{statusMessage}</p>
          </div>

          {payloadResponse?.payload?.refs?.qr_png && (
            <div className="border border-black/10 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <QrCode size={15} className="text-[#3898E8]" />
                <p className="font-orbitron text-[10px] font-bold uppercase">Xaman QR</p>
              </div>
              <img src={payloadResponse.payload.refs.qr_png} alt="Xaman NFT mint QR" className="w-full border border-black/10" />
            </div>
          )}

          {payloadUuid && <InfoBox label="Payload UUID" value={payloadUuid} onCopy={() => copyText(payloadUuid)} />}
          {verification?.verified?.txid && (
            <InfoBox label="Mint tx hash" value={verification.verified.txid} onCopy={() => copyText(verification.verified?.txid ?? "")} />
          )}
        </div>
      </div>
    </section>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{label}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-black/10 bg-[#F7F8FC] px-4 py-4 font-mono text-xs text-black/70 outline-none focus:border-[#3898E8]"
      />
    </label>
  );
}

function InfoBox({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest">{label}</p>
        <button onClick={onCopy} className="border border-black/10 bg-white px-2 py-1 text-black/45 hover:text-black transition-all">
          <Copy size={13} />
        </button>
      </div>
      <p className="font-mono text-[10px] text-black/60 leading-relaxed break-all">{value}</p>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-white p-3">
      <p className="font-mono text-[9px] text-black/35 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono text-[10px] text-black/60 leading-relaxed break-all">{value}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Fingerprint; label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={17} className="text-[#3898E8] mb-3" />
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{label}</p>
      <p className="font-orbitron text-xs font-black uppercase break-all">{value}</p>
    </div>
  );
}

function WarningLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <AlertTriangle size={14} className="text-[#C83888] mt-0.5 shrink-0" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function PassLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-[#3898E8] mt-0.5 shrink-0" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function CheckLine({ ok, text }: { ok: boolean; text: string }) {
  return ok ? <PassLine text={text} /> : <WarningLine text={text} />;
}
