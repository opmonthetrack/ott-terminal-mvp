import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Apple,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  Chrome,
  Copy,
  Github,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
  UserCircle,
  Wallet,
} from "lucide-react";
import { getAcademyProgressSummary } from "../lib/academyProgressStore";
import {
  getEnabledOttAuthProviders,
  getFriendlyOttAuthError,
  getOttAccountName,
  isOttAuthConfigured,
  resetOttPassword,
  signInOttAccount,
  signInOttProvider,
  signOutOttAccount,
  signUpOttAccount,
  updateOttDisplayName,
  type OttAuthProvider,
} from "../lib/ottAuth";
import {
  formatNftSerial,
  getNftIssuanceSummary,
  NFT_ISSUANCE_LIMITS,
} from "../lib/nftIssuanceStore";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type WalletTabProps = {
  walletAddress?: string;
  onDisconnect?: () => void;
};

type AuthMode = "sign-in" | "create";

type WalletSnapshot = {
  balanceXrp: string;
  sequence: number;
  ownerCount: number;
  ledgerIndex: number;
};

type XrplResponse = {
  id?: number;
  result?: {
    error?: string;
    ledger_index?: number;
    account_data?: {
      Balance?: string;
      Sequence?: number;
      OwnerCount?: number;
    };
  };
};

const XRPL_ENDPOINT = "wss://xrplcluster.com/";

const providerIcons: Record<OttAuthProvider, ElementType> = {
  google: Chrome,
  apple: Apple,
  azure: Building2,
  github: Github,
};

function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function shortWallet(value: string) {
  return value.length > 22 ? `${value.slice(0, 11)}…${value.slice(-8)}` : value;
}

function dropsToXrp(value: string) {
  const drops = Number(value);
  return Number.isFinite(drops)
    ? (drops / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })
    : "0";
}

function loadWalletSnapshot(walletAddress: string) {
  return new Promise<WalletSnapshot>((resolve, reject) => {
    const socket = new WebSocket(XRPL_ENDPOINT);
    const id = Date.now();
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("XRPL request timed out."));
    }, 15_000);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        id,
        command: "account_info",
        account: walletAddress,
        ledger_index: "validated",
      }));
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data) as XrplResponse;
        if (response.id !== id) {
          return;
        }

        window.clearTimeout(timeout);
        socket.close();
        const account = response.result?.account_data;

        if (response.result?.error || !account) {
          reject(new Error(response.result?.error || "No validated wallet data found."));
          return;
        }

        resolve({
          balanceXrp: dropsToXrp(account.Balance ?? "0"),
          sequence: account.Sequence ?? 0,
          ownerCount: account.OwnerCount ?? 0,
          ledgerIndex: response.result?.ledger_index ?? 0,
        });
      } catch (error) {
        window.clearTimeout(timeout);
        socket.close();
        reject(error);
      }
    };

    socket.onerror = () => {
      window.clearTimeout(timeout);
      socket.close();
      reject(new Error("Could not reach the XRP Ledger."));
    };
  });
}

export function WalletTab({ walletAddress = "guest", onDisconnect }: WalletTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const { user, loading: authLoading, signedIn } = useOttAuthSession();
  const hasWallet = isLikelyXrplAddress(walletAddress);
  const enabledProviders = useMemo(() => getEnabledOttAuthProviders(), []);
  const academy = useMemo(() => getAcademyProgressSummary(walletAddress), [walletAddress]);
  const accessPass = useMemo(() => getNftIssuanceSummary("access-pass"), []);
  const certificate = useMemo(() => getNftIssuanceSummary("foundation-certificate"), []);

  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [walletSnapshot, setWalletSnapshot] = useState<WalletSnapshot | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    setProfileName(getOttAccountName(user));
  }, [user]);

  useEffect(() => {
    if (!hasWallet) {
      setWalletSnapshot(null);
      setWalletError("");
      return;
    }

    void refreshWallet();
  }, [walletAddress, hasWallet]);

  async function refreshWallet() {
    if (!hasWallet) {
      return;
    }

    setWalletBusy(true);
    setWalletError("");

    try {
      setWalletSnapshot(await loadWalletSnapshot(walletAddress));
    } catch (error) {
      setWalletError(getFriendlyOttAuthError(error, language));
    } finally {
      setWalletBusy(false);
    }
  }

  async function submitEmailAuth() {
    if (!email.trim() || password.length < 8) {
      setAuthStatus(
        isEnglish
          ? "Enter a valid email address and a password of at least 8 characters."
          : "Vul een geldig e-mailadres en een wachtwoord van minimaal 8 tekens in.",
      );
      return;
    }

    setAuthBusy(true);
    setAuthStatus("");

    try {
      if (authMode === "create") {
        const result = await signUpOttAccount({ email, password, displayName });
        setAuthStatus(
          result.session
            ? (isEnglish ? "Account created and signed in." : "Account aangemaakt en ingelogd.")
            : (isEnglish
                ? "Account created. Check your email to confirm your address."
                : "Account aangemaakt. Controleer je e-mail om je adres te bevestigen."),
        );
      } else {
        await signInOttAccount(email, password);
        setAuthStatus(isEnglish ? "Signed in successfully." : "Je bent ingelogd.");
      }
    } catch (error) {
      setAuthStatus(getFriendlyOttAuthError(error, language));
    } finally {
      setAuthBusy(false);
    }
  }

  async function useProvider(provider: OttAuthProvider) {
    setAuthBusy(true);
    setAuthStatus("");

    try {
      await signInOttProvider(provider);
    } catch (error) {
      setAuthStatus(getFriendlyOttAuthError(error, language));
      setAuthBusy(false);
    }
  }

  async function sendReset() {
    if (!email.trim()) {
      setAuthStatus(isEnglish ? "Enter your email address first." : "Vul eerst je e-mailadres in.");
      return;
    }

    setAuthBusy(true);
    try {
      await resetOttPassword(email);
      setAuthStatus(
        isEnglish
          ? "Password reset instructions were sent when the account exists."
          : "Instructies voor wachtwoordherstel zijn verzonden wanneer het account bestaat.",
      );
    } catch (error) {
      setAuthStatus(getFriendlyOttAuthError(error, language));
    } finally {
      setAuthBusy(false);
    }
  }

  async function saveAccountName() {
    if (!profileName.trim()) {
      return;
    }

    setProfileBusy(true);
    setAuthStatus("");
    try {
      await updateOttDisplayName(profileName);
      setAuthStatus(isEnglish ? "Profile name saved." : "Profielnaam opgeslagen.");
    } catch (error) {
      setAuthStatus(getFriendlyOttAuthError(error, language));
    } finally {
      setProfileBusy(false);
    }
  }

  async function signOut() {
    setAuthBusy(true);
    try {
      await signOutOttAccount();
      setEmail("");
      setPassword("");
      setAuthStatus(isEnglish ? "Signed out." : "Uitgelogd.");
    } catch (error) {
      setAuthStatus(getFriendlyOttAuthError(error, language));
    } finally {
      setAuthBusy(false);
    }
  }

  function copyWallet() {
    if (hasWallet) {
      void navigator.clipboard?.writeText(walletAddress);
      setAuthStatus(isEnglish ? "Wallet address copied." : "Walletadres gekopieerd.");
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            {isEnglish ? "Account and profile" : "Account en profiel"}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {isEnglish
              ? "One normal account. A wallet only when an on-chain action needs it."
              : "Eén normaal account. Alleen een wallet wanneer een on-chain actie die nodig heeft."}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            {isEnglish
              ? "Your account stores your profile and learning journey. Your wallet remains self-custodied and is used for signatures, access proofs and achievement NFTs."
              : "Je account bewaart je profiel en leertraject. Je wallet blijft self-custody en wordt gebruikt voor handtekeningen, toegangsbewijs en achievement-NFT’s."}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {authStatus && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
            {authStatus}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-3xl border border-slate-200 p-6 sm:p-8">
            {authLoading ? (
              <div className="flex min-h-80 items-center justify-center">
                <Loader2 className="animate-spin text-slate-500" size={26} />
              </div>
            ) : signedIn && user ? (
              <SignedInAccount
                userEmail={user.email ?? ""}
                provider={String(user.app_metadata?.provider ?? "email")}
                profileName={profileName}
                setProfileName={setProfileName}
                profileBusy={profileBusy}
                authBusy={authBusy}
                onSaveName={() => void saveAccountName()}
                onSignOut={() => void signOut()}
                isEnglish={isEnglish}
              />
            ) : (
              <AccountAccess
                configured={isOttAuthConfigured}
                enabledProviders={enabledProviders}
                mode={authMode}
                setMode={setAuthMode}
                displayName={displayName}
                setDisplayName={setDisplayName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                busy={authBusy}
                onEmailSubmit={() => void submitEmailAuth()}
                onProvider={(provider) => void useProvider(provider)}
                onReset={() => void sendReset()}
                isEnglish={isEnglish}
              />
            )}
          </section>

          <div className="space-y-6">
            <WalletConnectionCard
              walletAddress={walletAddress}
              hasWallet={hasWallet}
              snapshot={walletSnapshot}
              busy={walletBusy}
              error={walletError}
              onRefresh={() => void refreshWallet()}
              onCopy={copyWallet}
              onDisconnect={onDisconnect}
              isEnglish={isEnglish}
            />

            <section className="rounded-3xl border border-slate-200 p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <BookOpen className="text-blue-700" size={21} />
                <h2 className="text-lg font-semibold">
                  {isEnglish ? "Learning progress" : "Leervoortgang"}
                </h2>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Metric label={isEnglish ? "Courses" : "Cursussen"} value={String(academy.completedCount)} />
                <Metric label="XP" value={String(academy.totalXp)} />
                <Metric label={isEnglish ? "Average" : "Gemiddeld"} value={academy.averageScore ? `${academy.averageScore}%` : "—"} />
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                {signedIn
                  ? (isEnglish
                      ? "Verified progress is linked to the OTT account. Legacy wallet progress remains visible during migration."
                      : "Geverifieerde voortgang wordt aan het OTT-account gekoppeld. Oude walletvoortgang blijft tijdens migratie zichtbaar.")
                  : (isEnglish
                      ? "Create an OTT account so verified progress can follow you across devices."
                      : "Maak een OTT-account zodat geverifieerde voortgang je op meerdere apparaten kan volgen.")}
              </p>
            </section>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                {isEnglish ? "NFT issuance foundation" : "NFT-uitgiftefundament"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {isEnglish ? "Separate editions, controlled status and no duplicate serials." : "Gescheiden edities, gecontroleerde status en geen dubbele nummers."}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              {isEnglish
                ? "An NFT is never created merely by pressing a UI button. Eligibility, wallet ownership, metadata and the validated mint transaction must agree."
                : "Een NFT ontstaat nooit alleen door op een knop te drukken. Geschiktheid, walletbezit, metadata en de gevalideerde minttransactie moeten overeenkomen."}
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <EditionCard
              title={NFT_ISSUANCE_LIMITS["access-pass"].label}
              range="#001–#500"
              nextSerial={accessPass.nextSerial ? formatNftSerial("access-pass", accessPass.nextSerial) : "Full"}
              issued={accessPass.issued}
              reserved={accessPass.reserved}
              available={accessPass.available}
              isEnglish={isEnglish}
            />
            <EditionCard
              title={NFT_ISSUANCE_LIMITS["foundation-certificate"].label}
              range="#0001–#5000"
              nextSerial={certificate.nextSerial ? formatNftSerial("foundation-certificate", certificate.nextSerial) : "Full"}
              issued={certificate.issued}
              reserved={certificate.reserved}
              available={certificate.available}
              isEnglish={isEnglish}
            />
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <TrustCard
            icon={ShieldCheck}
            title={isEnglish ? "Account is not a wallet" : "Account is geen wallet"}
            text={isEnglish ? "Your login never gives OTT control over funds." : "Je login geeft OTT nooit controle over je geld."}
          />
          <TrustCard
            icon={LockKeyhole}
            title={isEnglish ? "No recovery secrets" : "Geen herstelgeheimen"}
            text={isEnglish ? "OTT never asks for a seed phrase or private key." : "OTT vraagt nooit om een seed phrase of private key."}
          />
          <TrustCard
            icon={BadgeCheck}
            title={isEnglish ? "Proof when required" : "Bewijs wanneer nodig"}
            text={isEnglish ? "Wallet ownership is proven only for a specific on-chain action." : "Walletbezit wordt alleen bewezen voor een specifieke on-chain actie."}
          />
        </section>
      </main>
    </div>
  );
}

function AccountAccess({
  configured,
  enabledProviders,
  mode,
  setMode,
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  busy,
  onEmailSubmit,
  onProvider,
  onReset,
  isEnglish,
}: {
  configured: boolean;
  enabledProviders: ReturnType<typeof getEnabledOttAuthProviders>;
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  busy: boolean;
  onEmailSubmit: () => void;
  onProvider: (provider: OttAuthProvider) => void;
  onReset: () => void;
  isEnglish: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {isEnglish ? "OTT account" : "OTT-account"}
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {mode === "sign-in"
              ? (isEnglish ? "Welcome back" : "Welkom terug")
              : (isEnglish ? "Create your free account" : "Maak je gratis account")}
          </h2>
        </div>
        <UserCircle size={30} className="text-slate-300" />
      </div>

      {!configured && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          {isEnglish
            ? "The account UI is ready. Add the Supabase browser keys in Vercel before login can be used."
            : "De accountinterface is klaar. Voeg de Supabase-browsersleutels toe in Vercel voordat inloggen werkt."}
        </div>
      )}

      {enabledProviders.length > 0 && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {enabledProviders.map((provider) => {
              const Icon = providerIcons[provider.id];
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => onProvider(provider.id)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Icon size={18} />
                  {provider.label}
                </button>
              );
            })}
          </div>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">{isEnglish ? "or use email" : "of gebruik e-mail"}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

      {enabledProviders.length === 0 && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {isEnglish
            ? "Only providers explicitly activated in Vercel are shown. Email remains the reliable default."
            : "Alleen providers die expliciet in Vercel zijn geactiveerd worden getoond. E-mail blijft de betrouwbare standaard."}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {mode === "create" && (
          <label className="block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "Display name" : "Weergavenaam"}</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              maxLength={60}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
        )}
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Email</span>
          <div className="relative mt-2">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={17} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">{isEnglish ? "Password" : "Wachtwoord"}</span>
          <div className="relative mt-2">
            <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={17} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={onEmailSubmit}
        disabled={!configured || busy}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />}
        {mode === "create"
          ? (isEnglish ? "Create account" : "Account maken")
          : (isEnglish ? "Sign in" : "Inloggen")}
      </button>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "create" : "sign-in")}
          className="font-medium text-blue-700 hover:text-blue-900"
        >
          {mode === "sign-in"
            ? (isEnglish ? "Create a free account" : "Maak een gratis account")
            : (isEnglish ? "I already have an account" : "Ik heb al een account")}
        </button>
        {mode === "sign-in" && (
          <button type="button" onClick={onReset} className="text-slate-500 hover:text-slate-900">
            {isEnglish ? "Forgot password?" : "Wachtwoord vergeten?"}
          </button>
        )}
      </div>
    </>
  );
}

function SignedInAccount({
  userEmail,
  provider,
  profileName,
  setProfileName,
  profileBusy,
  authBusy,
  onSaveName,
  onSignOut,
  isEnglish,
}: {
  userEmail: string;
  provider: string;
  profileName: string;
  setProfileName: (value: string) => void;
  profileBusy: boolean;
  authBusy: boolean;
  onSaveName: () => void;
  onSignOut: () => void;
  isEnglish: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={14} />
            {isEnglish ? "Signed in" : "Ingelogd"}
          </div>
          <h2 className="mt-5 text-2xl font-semibold">{profileName || "OTT member"}</h2>
          <p className="mt-2 text-sm text-slate-500">{userEmail}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
          <UserCircle size={25} />
        </div>
      </div>

      <div className="mt-7 rounded-2xl bg-slate-50 p-5">
        <p className="text-xs font-medium text-slate-500">{isEnglish ? "Login method" : "Inlogmethode"}</p>
        <p className="mt-2 text-sm font-semibold capitalize">{provider === "azure" ? "Microsoft" : provider}</p>
      </div>

      <label className="mt-6 block">
        <span className="text-xs font-medium text-slate-600">{isEnglish ? "Profile name" : "Profielnaam"}</span>
        <input
          value={profileName}
          onChange={(event) => setProfileName(event.target.value)}
          maxLength={60}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSaveName}
          disabled={profileBusy}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {profileBusy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {isEnglish ? "Save profile" : "Profiel opslaan"}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          disabled={authBusy}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={16} />
          {isEnglish ? "Sign out" : "Uitloggen"}
        </button>
      </div>
    </>
  );
}

function WalletConnectionCard({
  walletAddress,
  hasWallet,
  snapshot,
  busy,
  error,
  onRefresh,
  onCopy,
  onDisconnect,
  isEnglish,
}: {
  walletAddress: string;
  hasWallet: boolean;
  snapshot: WalletSnapshot | null;
  busy: boolean;
  error: string;
  onRefresh: () => void;
  onCopy: () => void;
  onDisconnect?: () => void;
  isEnglish: boolean;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wallet className="text-blue-700" size={21} />
          <h2 className="text-lg font-semibold">{isEnglish ? "XRPL wallet" : "XRPL-wallet"}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasWallet ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
          {hasWallet ? (isEnglish ? "Connected" : "Gekoppeld") : (isEnglish ? "Optional" : "Optioneel")}
        </span>
      </div>

      {hasWallet ? (
        <>
          <button type="button" onClick={onCopy} className="mt-5 flex items-center gap-2 text-left text-sm font-medium text-slate-700 hover:text-blue-700">
            <span className="break-all">{shortWallet(walletAddress)}</span>
            <Copy size={15} />
          </button>

          {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric label="XRP" value={snapshot?.balanceXrp ?? (busy ? "…" : "—")} />
            <Metric label={isEnglish ? "Objects" : "Objecten"} value={snapshot ? String(snapshot.ownerCount) : (busy ? "…" : "—")} />
            <Metric label="Sequence" value={snapshot ? String(snapshot.sequence) : (busy ? "…" : "—")} />
            <Metric label="Ledger" value={snapshot ? String(snapshot.ledgerIndex) : (busy ? "…" : "—")} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRefresh}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCcw className={busy ? "animate-spin" : ""} size={16} />
              {isEnglish ? "Refresh" : "Vernieuwen"}
            </button>
            {onDisconnect && (
              <button
                type="button"
                onClick={onDisconnect}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                <LogOut size={16} />
                {isEnglish ? "Disconnect" : "Loskoppelen"}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          <p className="text-sm leading-6 text-slate-600">
            {isEnglish
              ? "Learning and research work without a wallet. Connect one only when you need to sign, vote, prove access or receive an NFT."
              : "Leren en onderzoeken werkt zonder wallet. Koppel er alleen één wanneer je wilt ondertekenen, stemmen, toegang bewijzen of een NFT ontvangen."}
          </p>
        </div>
      )}
    </section>
  );
}

function EditionCard({
  title,
  range,
  nextSerial,
  issued,
  reserved,
  available,
  isEnglish,
}: {
  title: string;
  range: string;
  nextSerial: string;
  issued: number;
  reserved: number;
  available: number;
  isEnglish: boolean;
}) {
  return (
    <article className="rounded-2xl bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{range}</p>
        </div>
        <Award className="text-blue-700" size={22} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label={isEnglish ? "Next" : "Volgende"} value={nextSerial} />
        <Metric label={isEnglish ? "Issued" : "Uitgegeven"} value={String(issued)} />
        <Metric label={isEnglish ? "Reserved" : "Gereserveerd"} value={String(reserved)} />
        <Metric label={isEnglish ? "Available" : "Beschikbaar"} value={String(available)} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function TrustCard({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-5">
      <Icon size={20} className="text-blue-700" />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </article>
  );
}
