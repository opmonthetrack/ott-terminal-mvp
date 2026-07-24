import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Layers3,
  Loader2,
  Network,
  RefreshCcw,
  ShieldCheck,
  Unplug,
  Wallet,
} from "lucide-react";
import { getScalableNftCollectionSummary } from "../lib/nftIssuanceStore";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";
import { WALLET_PROVIDER_GUIDES } from "../lib/walletAcademy";
import { connectWalletProvider } from "../lib/walletConnectors";
import {
  getWalletProvider,
  getWalletSupportLabel,
  WALLET_REGISTRY,
  type WalletProviderId,
  type WalletVerificationMethod,
  type XrplNetwork,
} from "../lib/walletRegistry";
import {
  isLikelyXrplAddress,
  loadWalletSession,
  saveWalletSession,
} from "../lib/walletSession";
import { loadXrplWalletProfile, type XrplWalletProfile } from "../lib/xrplWalletProfile";

const SOURCE_TAG = "2606170002";

type WalletHubProps = {
  walletAddress?: string;
  onWalletConnected?: (
    address: string,
    providerId: WalletProviderId,
    network: XrplNetwork,
    verificationMethod: WalletVerificationMethod,
  ) => void;
  onUseXaman?: () => void;
  onOpenAcademy?: () => void;
  onDisconnect?: () => void;
};

export function WalletHub({
  walletAddress = "guest",
  onWalletConnected,
  onUseXaman,
  onOpenAcademy,
  onDisconnect,
}: WalletHubProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const storedSession = loadWalletSession();
  const connectedAddress = isLikelyXrplAddress(walletAddress) ? walletAddress : "";
  const connectedProviderId = storedSession?.walletAddress === connectedAddress
    ? storedSession.providerId
    : "read-only";

  const [selectedProviderId, setSelectedProviderId] = useState<WalletProviderId>(connectedProviderId || "xaman");
  const [busyProviderId, setBusyProviderId] = useState<WalletProviderId | null>(null);
  const [status, setStatus] = useState("");
  const [readOnlyAddress, setReadOnlyAddress] = useState("");
  const [readOnlyProfileAddress, setReadOnlyProfileAddress] = useState("");
  const [readOnlyNetwork, setReadOnlyNetwork] = useState<XrplNetwork>("mainnet");
  const [profile, setProfile] = useState<XrplWalletProfile | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState("");

  const selectedProvider = getWalletProvider(selectedProviderId);
  const selectedGuide = WALLET_PROVIDER_GUIDES[selectedProviderId];
  const profileAddress = connectedAddress || readOnlyProfileAddress;
  const profileNetwork = connectedAddress && storedSession?.walletAddress === connectedAddress
    ? storedSession.network
    : readOnlyNetwork;
  const profileProvider = connectedAddress
    ? getWalletProvider(connectedProviderId)
    : getWalletProvider("read-only");
  const ownershipVerified = Boolean(
    connectedAddress &&
    storedSession?.walletAddress === connectedAddress &&
    storedSession.verificationMethod !== "read-only",
  );
  const nftCollections = useMemo(() => getScalableNftCollectionSummary(), []);

  useEffect(() => {
    setSelectedProviderId(connectedProviderId || "xaman");
  }, [connectedProviderId]);

  useEffect(() => {
    if (!profileAddress) {
      setProfile(null);
      setProfileError("");
      return;
    }
    void refreshProfile(profileAddress, profileNetwork);
  }, [profileAddress, profileNetwork]);

  async function refreshProfile(address = profileAddress, network = profileNetwork) {
    if (!address) return;
    setProfileBusy(true);
    setProfileError("");
    try {
      setProfile(await loadXrplWalletProfile(address, network));
    } catch (error) {
      setProfile(null);
      setProfileError(error instanceof Error ? error.message : "Could not load the XRPL profile.");
    } finally {
      setProfileBusy(false);
    }
  }

  async function connectProvider(providerId: WalletProviderId) {
    setSelectedProviderId(providerId);
    setStatus("");

    if (providerId === "xaman") {
      onUseXaman?.();
      return;
    }

    if (!(["crossmark", "gemwallet"] as WalletProviderId[]).includes(providerId)) {
      setStatus(
        isEnglish
          ? "This connector is listed and documented, but it remains locked until its official signing flow passes an OTT Testnet proof."
          : "Deze connector staat in de registry en Academy, maar blijft vergrendeld totdat de officiële signingflow een OTT-Testnetbewijs heeft doorstaan.",
      );
      return;
    }

    setBusyProviderId(providerId);
    try {
      const result = await connectWalletProvider(providerId);
      saveWalletSession({
        walletAddress: result.walletAddress,
        providerId: result.providerId,
        network: result.network,
        verificationMethod: result.verificationMethod,
      });
      onWalletConnected?.(
        result.walletAddress,
        result.providerId,
        result.network,
        result.verificationMethod,
      );
      setStatus(
        isEnglish
          ? `${getWalletProvider(providerId).name} connected. The public XRPL profile is loading.`
          : `${getWalletProvider(providerId).name} is gekoppeld. Het openbare XRPL-profiel wordt geladen.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet connection failed.");
    } finally {
      setBusyProviderId(null);
    }
  }

  function openReadOnlyProfile() {
    const address = readOnlyAddress.trim();
    if (!isLikelyXrplAddress(address)) {
      setStatus(
        isEnglish
          ? "Enter a valid XRPL classic address beginning with r."
          : "Vul een geldig XRPL classic address in dat met r begint.",
      );
      return;
    }
    setSelectedProviderId("read-only");
    setReadOnlyProfileAddress(address);
    setStatus(
      isEnglish
        ? "Read-only profile opened. This does not prove that you own the account."
        : "Alleen-lezen profiel geopend. Dit bewijst niet dat jij eigenaar bent van het account.",
    );
  }

  function copyAddress() {
    if (profileAddress) void navigator.clipboard?.writeText(profileAddress);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-blue-700">
            <Wallet size={22} />
            <p className="text-sm font-semibold">XRPL Wallet Hub</p>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {isEnglish
              ? "One XRPL profile. Multiple safe ways to connect."
              : "Eén XRPL-profiel. Meerdere veilige manieren om te koppelen."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {isEnglish
              ? "OTT separates the public ledger account from the wallet used to authorize it. Every connector receives the same profile, education and Make Waves verification layer."
              : "OTT scheidt het openbare ledgeraccount van de wallet die het autoriseert. Iedere connector krijgt hetzelfde profiel, dezelfde educatie en dezelfde Make Waves-verificatielaag."}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <p className="text-xs font-medium text-blue-800">Make Waves SourceTag</p>
          <p className="mt-1 text-lg font-semibold text-blue-950">{SOURCE_TAG}</p>
        </div>
      </div>

      {status && (
        <div role="status" className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">
          {status}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {WALLET_REGISTRY.filter((provider) => provider.id !== "read-only").map((provider) => {
          const isSelected = selectedProviderId === provider.id;
          const canConnect = ["xaman", "crossmark", "gemwallet"].includes(provider.id);
          return (
            <article
              key={provider.id}
              className={`rounded-2xl border p-4 transition ${isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
            >
              <button
                type="button"
                onClick={() => setSelectedProviderId(provider.id)}
                className="flex w-full items-start gap-3 text-left"
                aria-pressed={isSelected}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ backgroundColor: provider.accent }}
                  aria-hidden="true"
                >
                  {provider.badge}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-950">{provider.name}</span>
                  <span className="mt-1 block text-xs text-slate-500">{provider.platforms.join(" · ")}</span>
                </span>
              </button>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  provider.supportLevel === "live"
                    ? "bg-emerald-50 text-emerald-800"
                    : provider.supportLevel === "beta"
                      ? "bg-blue-50 text-blue-800"
                      : "bg-slate-100 text-slate-600"
                }`}>
                  {getWalletSupportLabel(provider.supportLevel, language)}
                </span>
                <button
                  type="button"
                  onClick={() => void connectProvider(provider.id)}
                  disabled={busyProviderId !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {busyProviderId === provider.id ? <Loader2 className="animate-spin" size={14} /> : canConnect ? <ArrowRight size={14} /> : <BookOpen size={14} />}
                  {canConnect ? (isEnglish ? "Connect" : "Koppelen") : (isEnglish ? "Learn" : "Leren")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl bg-slate-50 p-6">
          <div className="flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
              style={{ backgroundColor: selectedProvider.accent }}
            >
              {selectedProvider.badge}
            </span>
            <div>
              <p className="text-xs font-semibold text-blue-700">{selectedProvider.custody}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">{selectedProvider.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedProvider.description[language]}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedProvider.capabilities.map((capability) => (
              <span key={capability} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                {capability}
              </span>
            ))}
          </div>

          {selectedProvider.limitation && (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              {selectedProvider.limitation[language]}
            </p>
          )}

          {selectedGuide && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-900">{isEnglish ? "Safe setup" : "Veilige installatie"}</h4>
              <ol className="mt-3 space-y-3">
                {selectedGuide.setup[language].map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-600">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={18} />
                {selectedGuide.safety[language]}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={selectedProvider.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
              {isEnglish ? "Official website" : "Officiële website"} <ExternalLink size={15} />
            </a>
            {selectedProvider.docs && (
              <a href={selectedProvider.docs} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
                {isEnglish ? "Developer docs" : "Developerdocs"} <ExternalLink size={15} />
              </a>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <Eye className="text-blue-700" size={21} />
            <div>
              <h3 className="text-lg font-semibold text-slate-950">{isEnglish ? "Open any XRPL account" : "Open ieder XRPL-account"}</h3>
              <p className="mt-1 text-sm text-slate-500">{isEnglish ? "Public read-only profile without claiming ownership." : "Openbaar alleen-lezen profiel zonder eigendom te claimen."}</p>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-medium text-slate-600">XRPL classic address</span>
            <input
              value={readOnlyAddress}
              onChange={(event) => setReadOnlyAddress(event.target.value)}
              placeholder="r..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "Network" : "Netwerk"}</span>
            <select
              value={readOnlyNetwork}
              onChange={(event) => setReadOnlyNetwork(event.target.value as XrplNetwork)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <option value="mainnet">Mainnet</option>
              <option value="testnet">Testnet</option>
              <option value="devnet">Devnet</option>
            </select>
          </label>
          <button
            type="button"
            onClick={openReadOnlyProfile}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Eye size={17} />
            {isEnglish ? "Open read-only profile" : "Open alleen-lezen profiel"}
          </button>
        </article>
      </div>

      {(profileAddress || profileBusy || profileError) && (
        <div className="mt-8">
          <WalletProfileCard
            address={profileAddress}
            profile={profile}
            busy={profileBusy}
            error={profileError}
            providerName={profileProvider.name}
            providerAccent={profileProvider.accent}
            providerBadge={profileProvider.badge}
            ownershipVerified={ownershipVerified}
            isEnglish={isEnglish}
            onCopy={copyAddress}
            onRefresh={() => void refreshProfile()}
            onDisconnect={connectedAddress ? onDisconnect : undefined}
          />
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3 text-blue-700">
              <Layers3 size={21} />
              <p className="text-sm font-semibold">{isEnglish ? "Scalable NFT credentials" : "Schaalbare NFT-credentials"}</p>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">
              {isEnglish ? "Genesis stays scarce. Public access and Academy can grow." : "Genesis blijft schaars. Publieke toegang en Academy kunnen groeien."}
            </h3>
          </div>
          <button type="button" onClick={onOpenAcademy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <BookOpen size={17} />
            {isEnglish ? "Open Wallet Academy" : "Open Wallet Academy"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nftCollections.map((collection) => (
            <article key={collection.type} className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{collection.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{collection.edition}</p>
                </div>
                {collection.transferable ? <BadgeCheck className="text-blue-700" size={20} /> : <CheckCircle2 className="text-emerald-600" size={20} />}
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-950">{collection.max.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">{isEnglish ? "maximum serial capacity" : "maximale serienummercapaciteit"}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{collection.purpose}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WalletProfileCard({
  address,
  profile,
  busy,
  error,
  providerName,
  providerAccent,
  providerBadge,
  ownershipVerified,
  isEnglish,
  onCopy,
  onRefresh,
  onDisconnect,
}: {
  address: string;
  profile: XrplWalletProfile | null;
  busy: boolean;
  error: string;
  providerName: string;
  providerAccent: string;
  providerBadge: string;
  ownershipVerified: boolean;
  isEnglish: boolean;
  onCopy: () => void;
  onRefresh: () => void;
  onDisconnect?: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-lg">
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 p-6 sm:flex-row sm:items-start sm:p-8">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ backgroundColor: providerAccent }}>
            {providerBadge}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold">XRPL Wallet Profile</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ownershipVerified ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>
                {ownershipVerified
                  ? (isEnglish ? "Ownership verified" : "Eigendom geverifieerd")
                  : (isEnglish ? "Read-only" : "Alleen lezen")}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{providerName} · {profile?.network ?? "—"}</p>
            <button type="button" onClick={onCopy} className="mt-3 flex max-w-full items-center gap-2 text-left text-sm text-slate-200 hover:text-white">
              <span className="truncate sm:max-w-xl">{address}</span>
              <Copy size={15} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onRefresh} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 disabled:opacity-50">
            <RefreshCcw className={busy ? "animate-spin" : ""} size={16} />
            {isEnglish ? "Refresh" : "Vernieuwen"}
          </button>
          {onDisconnect && (
            <button type="button" onClick={onDisconnect} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">
              <Unplug size={16} />
              {isEnglish ? "Disconnect" : "Loskoppelen"}
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="m-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100 sm:m-8">{error}</div>
      ) : busy && !profile ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-slate-300"><Loader2 className="animate-spin" /> {isEnglish ? "Loading validated ledger data…" : "Gevalideerde ledgerdata laden…"}</div>
      ) : profile ? (
        <>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <DarkMetric label="XRP" value={profile.balanceXrp} />
            <DarkMetric label={isEnglish ? "Tokens" : "Tokens"} value={profile.tokenCount} />
            <DarkMetric label="NFTs" value={profile.nftCount} />
            <DarkMetric label={isEnglish ? "Trustlines" : "Trustlines"} value={profile.trustlineCount} />
            <DarkMetric label="DEX offers" value={profile.offerCount} />
            <DarkMetric label="Escrows" value={profile.escrowCount} />
            <DarkMetric label={isEnglish ? "Ledger objects" : "Ledgerobjecten"} value={profile.ownerCount} />
            <DarkMetric label="Sequence" value={profile.sequence} />
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-300" size={20} /><h4 className="font-semibold">{isEnglish ? "Account structure" : "Accountstructuur"}</h4></div>
              <dl className="mt-4 space-y-3 text-sm">
                <ProfileRow label="Domain" value={profile.domain || "—"} />
                <ProfileRow label="Flags" value={String(profile.accountFlags)} />
                <ProfileRow label="Signer lists" value={String(profile.signerListCount)} />
                <ProfileRow label="Payment channels" value={String(profile.paymentChannelCount)} />
                <ProfileRow label="Checks" value={String(profile.checkCount)} />
                <ProfileRow label="Deposit preauth" value={String(profile.depositPreauthCount)} />
              </dl>
            </div>
            <div>
              <div className="flex items-center gap-3"><Network className="text-blue-300" size={20} /><h4 className="font-semibold">{isEnglish ? "Ledger evidence" : "Ledgerbewijs"}</h4></div>
              <dl className="mt-4 space-y-3 text-sm">
                <ProfileRow label={isEnglish ? "Validated ledger" : "Gevalideerde ledger"} value={String(profile.ledgerIndex)} />
                <ProfileRow label={isEnglish ? "Objects loaded" : "Geladen objecten"} value={String(profile.objectCountLoaded)} />
                <ProfileRow label="AMM / LP objects" value={String(profile.ammPositionCount)} />
                <ProfileRow label={isEnglish ? "Data coverage" : "Datadekking"} value={profile.partial ? (isEnglish ? "Partial / paginated" : "Gedeeltelijk / gepagineerd") : (isEnglish ? "Complete first page" : "Volledige eerste pagina")} />
                <ProfileRow label={isEnglish ? "Updated" : "Bijgewerkt"} value={new Date(profile.loadedAt).toLocaleTimeString()} />
                <ProfileRow label="SourceTag" value={SOURCE_TAG} />
              </dl>
            </div>
          </div>
        </>
      ) : null}
    </article>
  );
}

function DarkMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-950 p-5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 truncate text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="max-w-[60%] break-words text-right font-medium text-slate-100">{value}</dd>
    </div>
  );
}
