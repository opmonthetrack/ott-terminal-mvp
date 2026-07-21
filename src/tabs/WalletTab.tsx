import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  Chrome,
  Copy,
  Github,
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
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

  const academy = useMemo(
    () => getAcademyProgressSummary(walletAddress),
    [walletAddress],
  );

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
      setWalletError(
        getErrorMessage(
          error,
          isEnglish ? "Wallet data could not be loaded." : "Walletdata kon niet worden geladen.",
        ),
      );
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
      setAuthStatus(
        getErrorMessage(error, isEnglish ? "Account action failed." : "Accountactie is mislukt."),
      );
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
      setAuthStatus(
        getErrorMessage(error, isEnglish ? "Provider login failed." : "Inloggen via provider is mislukt."),
      );
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
      setAuthStatus(
        getErrorMessage(error, isEnglish ? "Reset email failed." : "Herstelmail is mislukt."),
      );
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
      setAuthStatus(
        getErrorMessage(error, isEnglish ? "Could not save the profile." : "Profiel kon niet worden opgeslagen."),
      );
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
      setAuthStatus(
        getErrorMessage(error, isEnglish ? "Sign out failed." : "Uitloggen is mislukt."),
      );
    } finally {
      setAuthBusy(false);
    }
  }

  function copyWallet() {
    if (hasWallet) {
      void navigator.clipboard?.writeText(walletAddress);
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
              ? "One normal account. Add a wallet only when you need it."
              : "Eén normaal account. Voeg alleen een wallet toe wanneer je die nodig hebt."}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            {isEnglish
              ? "Your OTT account holds your profile and learning journey. A connected wallet remains separate and is used for signing, access proofs and NFTs."
              : "Je OTT-account bewaart je profiel en leertraject. Een gekoppelde wallet blijft apart en wordt gebruikt voor ondertekening, toegangsbewijs en NFT’s."}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {authStatus && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {authStatus}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200 p-6 sm:p-8">
            {authLoading ? (
              <div className="flex min-h-72 items-center justify-center">
                <Loader2 className="animate-spin text-slate-500" size={24} />
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
            <section className="rounded-3xl border border-slate-200 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    {isEnglish ? "Optional wallet" : "Optionele wallet"}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">
                    {hasWallet
                      ? (isEnglish ? "Wallet connected" : "Wallet gekoppeld")
                      : (isEnglish ? "No wallet connected" : "Geen wallet gekoppeld")}
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                  <Wallet size={21} />
                </div>
              </div>

              {hasWallet ? (
                <>
                  <button
                    type="button"
                    onClick={copyWallet}
                    className="mt-5 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left"
                  >
                    <span className="font-mono text-xs text-slate-700">{shortWallet(walletAddress)}</span>
                    <Copy size={16} className="text-slate-400" />
                  </button>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Metric label="XRP" value={walletSnapshot?.balanceXrp ?? (walletBusy ? "…" : "—")} />
                    <Metric label={isEnglish ? "Objects" : "Objecten"} value={walletSnapshot ? String(walletSnapshot.ownerCount) : "—"} />
                    <Metric label="Sequence" value={walletSnapshot ? String(walletSnapshot.sequence) : "—"} />
                    <Metric label="Ledger" value={walletSnapshot ? String(walletSnapshot.ledgerIndex) : "—"} />
                  </div>

                  {walletError && <p className="mt-4 text-sm text-amber-700">{walletError}</p>}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void refreshWallet()}
                      disabled={walletBusy}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RefreshCcw className={walletBusy ? "animate-spin" : ""} size={16} />
                      {isEnglish ? "Refresh" : "Vernieuwen"}
                    </button>
                    <button
                      type="button"
                      onClick={onDisconnect}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                    >
                      <LogOut size={16} />
                      {isEnglish ? "Disconnect" : "Loskoppelen"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm leading-6 text-slate-600">
                    {isEnglish
                      ? "You can use the Academy and research tools without a wallet. Open the wallet button in the top navigation only when you need to sign or receive an NFT."
                      : "Je kunt de Academy en onderzoekstools zonder wallet gebruiken. Open de walletknop bovenin pas wanneer je wilt ondertekenen of een NFT wilt ontvangen."}
                  </p>
                </div>
              )}
            </section>

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
                      ? "Account-based Academy storage is prepared in the new data layer; existing wallet progress remains visible during migration."
                      : "Accountgebaseerde Academy-opslag is voorbereid in de nieuwe datalaag; bestaande walletvoortgang blijft tijdens de migratie zichtbaar.")
                  : (isEnglish
                      ? "Create an OTT account so future learning progress can follow you across devices."
                      : "Maak een OTT-account zodat toekomstige leervoortgang je op verschillende apparaten kan volgen.")}
              </p>
            </section>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <TrustCard
            icon={ShieldCheck}
            title={isEnglish ? "Account is not a wallet" : "Account is geen wallet"}
            text={isEnglish ? "Your login does not give OTT control over funds." : "Je login geeft OTT geen controle over je geld."}
          />
          <TrustCard
            icon={LockKeyhole}
            title={isEnglish ? "No recovery secrets" : "Geen herstelgeheimen"}
            text={isEnglish ? "OTT never asks for seed phrases or private keys." : "OTT vraagt nooit om seed phrases of private keys."}
          />
          <TrustCard
            icon={BadgeCheck}
            title={isEnglish ? "Proof when needed" : "Bewijs wanneer nodig"}
            text={isEnglish ? "Wallet ownership is proven only for on-chain actions." : "Walletbezit wordt alleen bewezen voor on-chain acties."}
          />
        </section>
      </main>
    </div>
  );
}

function AccountAccess({
  configured,
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
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {isEnglish
            ? "The login interface is ready, but the Supabase project keys still need to be added to Vercel before accounts can be used."
            : "De logininterface is klaar, maar de Supabase-projectsleutels moeten nog aan Vercel worden toegevoegd voordat accounts werken."}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ProviderButton icon={Chrome} label="Google" onClick={() => onProvider("google")} disabled={!configured || busy} />
        <ProviderButton icon={Apple} label="Apple" onClick={() => onProvider("apple")} disabled={!configured || busy} />
        <ProviderButton icon={Building2} label="Microsoft" onClick={() => onProvider("azure")} disabled={!configured || busy} />
        <ProviderButton icon={Github} label="GitHub" onClick={() => onProvider("github")} disabled={!configured || busy} />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">{isEnglish ? "or use email" : "of gebruik e-mail"}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-4">
        {mode === "create" && (
          <label className="block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "Display name" : "Weergavenaam"}</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
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
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "create" ? "new-password" : "current-password"}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
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
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </label>

      <button
        type="button"
        onClick={onSaveName}
        disabled={profileBusy}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {profileBusy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        {isEnglish ? "Save profile" : "Profiel opslaan"}
      </button>

      <div className="mt-8 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onSignOut}
          disabled={authBusy}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950 disabled:opacity-50"
        >
          <LogOut size={16} />
          {isEnglish ? "Sign out of OTT" : "Uitloggen bij OTT"}
        </button>
      </div>
    </>
  );
}

function ProviderButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Chrome;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function TrustCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 p-5">
      <Icon className="text-blue-700" size={20} />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </article>
  );
}
