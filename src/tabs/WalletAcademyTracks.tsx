import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  KeyRound,
  Lock,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";
import {
  WALLET_ACADEMY_TRACKS,
  type WalletAcademySection,
  type WalletAcademyTrack,
} from "../lib/academyWalletCurriculum";

type WalletAcademyTracksProps = {
  isEnglish: boolean;
  accessUnlocked: boolean;
  onNavigate?: (target: string) => void;
};

const STORAGE_KEY = "ott-wallet-academy-navigation-v1";

function loadNavigation() {
  if (typeof window === "undefined") return { walletId: WALLET_ACADEMY_TRACKS[0].id, step: 0 };

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as {
      walletId?: string;
      step?: number;
    };
    const walletId = WALLET_ACADEMY_TRACKS.some((track) => track.id === parsed.walletId)
      ? parsed.walletId as string
      : WALLET_ACADEMY_TRACKS[0].id;
    return {
      walletId,
      step: Number.isInteger(parsed.step) && Number(parsed.step) >= 0 ? Number(parsed.step) : 0,
    };
  } catch {
    return { walletId: WALLET_ACADEMY_TRACKS[0].id, step: 0 };
  }
}

export function WalletAcademyTracks({
  isEnglish,
  accessUnlocked,
  onNavigate,
}: WalletAcademyTracksProps) {
  const initial = useMemo(loadNavigation, []);
  const [selectedWalletId, setSelectedWalletId] = useState(initial.walletId);
  const [stepIndex, setStepIndex] = useState(initial.step);
  const [copied, setCopied] = useState(false);

  const selectedWallet = WALLET_ACADEMY_TRACKS.find((track) => track.id === selectedWalletId)
    ?? WALLET_ACADEMY_TRACKS[0];
  const safeStepIndex = Math.min(stepIndex, Math.max(0, selectedWallet.sections.length - 1));
  const section = selectedWallet.sections[safeStepIndex];
  const progress = Math.round(((safeStepIndex + 1) / selectedWallet.sections.length) * 100);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      walletId: selectedWallet.id,
      step: safeStepIndex,
    }));
  }, [safeStepIndex, selectedWallet.id]);

  useEffect(() => {
    if (stepIndex !== safeStepIndex) setStepIndex(safeStepIndex);
  }, [safeStepIndex, stepIndex]);

  function selectWallet(walletId: string) {
    setSelectedWalletId(walletId);
    setStepIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrevious() {
    setStepIndex((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    setStepIndex((current) => Math.min(selectedWallet.sections.length - 1, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyPractice() {
    const practice = isEnglish ? section.practiceEn : section.practiceNl;
    await navigator.clipboard.writeText([
      `OTT Wallet Academy — ${selectedWallet.name}`,
      isEnglish ? section.titleEn : section.titleNl,
      practice,
      `${isEnglish ? "Official source" : "Officiële bron"}: ${selectedWallet.sourceUrl}`,
    ].join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div data-page-region="true" className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <section className="rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.12),transparent_35%),#fff] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              <WalletCards size={17} /> Premium Wallet Academy
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {isEnglish
                ? "Know the wallet before it controls a valuable account."
                : "Ken de wallet voordat die een waardevol account beheert."}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              {isEnglish
                ? "Compare security models, setup, signing, XRPL support, recovery, strengths and limitations. Every track links to an official source and records when the content was last verified."
                : "Vergelijk beveiligingsmodellen, setup, signing, XRPL-ondersteuning, herstel, sterke punten en beperkingen. Iedere track koppelt naar een officiële bron en vermeldt wanneer de inhoud voor het laatst is gecontroleerd."}
            </p>
          </div>
          <div className={`rounded-2xl border px-5 py-4 ${accessUnlocked ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-center gap-3">
              {accessUnlocked
                ? <CheckCircle2 className="text-emerald-700" size={22} />
                : <Lock className="text-amber-700" size={22} />}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {isEnglish ? "Access state" : "Toegangsstatus"}
                </p>
                <p className="mt-1 font-semibold">
                  {accessUnlocked
                    ? (isEnglish ? "Verified Access Pass" : "Geverifieerde Access Pass")
                    : (isEnglish ? "Premium lessons locked" : "Premiumlessen vergrendeld")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              {isEnglish ? "Choose a wallet" : "Kies een wallet"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {WALLET_ACADEMY_TRACKS.length} {isEnglish ? "complete wallet tracks" : "volledige wallettracks"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x">
          {WALLET_ACADEMY_TRACKS.map((track) => {
            const active = track.id === selectedWallet.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => selectWallet(track.id)}
                className={`min-w-[190px] snap-start rounded-2xl border p-4 text-left transition ${active ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{track.name}</span>
                  {!accessUnlocked && <Lock size={15} className="text-slate-400" />}
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                  {isEnglish ? track.categoryEn : track.categoryNl}
                </p>
                <p className="mt-3 text-xs font-medium text-blue-700">{track.platforms}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_310px]">
        <div>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  {selectedWallet.name} · {isEnglish ? selectedWallet.categoryEn : selectedWallet.categoryNl}
                </p>
                <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  {isEnglish ? "Is this wallet appropriate for your role?" : "Past deze wallet bij jouw rol?"}
                </h3>
              </div>
              <Smartphone className="shrink-0 text-slate-700" size={30} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <DecisionCard
                positive
                title={isEnglish ? "Best suited for" : "Meest geschikt voor"}
                text={isEnglish ? selectedWallet.bestForEn : selectedWallet.bestForNl}
              />
              <DecisionCard
                title={isEnglish ? "Less suitable for" : "Minder geschikt voor"}
                text={isEnglish ? selectedWallet.notIdealForEn : selectedWallet.notIdealForNl}
              />
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <ListCard
                title={isEnglish ? "Strengths" : "Sterke punten"}
                items={isEnglish ? selectedWallet.strengthsEn : selectedWallet.strengthsNl}
                positive
              />
              <ListCard
                title={isEnglish ? "Limitations" : "Beperkingen"}
                items={isEnglish ? selectedWallet.limitationsEn : selectedWallet.limitationsNl}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  {isEnglish ? "Content last verified" : "Inhoud laatst gecontroleerd"}
                </p>
                <p className="mt-1 text-sm font-semibold">{selectedWallet.verifiedOn}</p>
              </div>
              <a
                href={selectedWallet.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
              >
                {selectedWallet.sourceLabel} <ExternalLink size={16} />
              </a>
            </div>
          </article>

          {!accessUnlocked ? (
            <LockedWalletLesson
              isEnglish={isEnglish}
              wallet={selectedWallet}
              onUnlock={() => onNavigate?.("accessgate")}
            />
          ) : (
            <WalletLessonStep
              isEnglish={isEnglish}
              wallet={selectedWallet}
              section={section}
              stepIndex={safeStepIndex}
              progress={progress}
              copied={copied}
              onCopy={() => void copyPractice()}
            />
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-300" size={22} />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  {isEnglish ? "Wallet rule" : "Walletregel"}
                </p>
                <p className="mt-1 font-semibold">
                  {isEnglish ? "Verify before signing" : "Controleer vóór ondertekening"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {isEnglish
                ? "OTT does not call one wallet universally safest. The correct choice depends on account role, signing frequency, recovery plan, device exposure and consequence of loss."
                : "OTT noemt geen enkele wallet universeel het veiligst. De juiste keuze hangt af van accountrol, ondertekenfrequentie, herstelplan, apparaatblootstelling en gevolgen van verlies."}
            </p>

            <div className="mt-5 space-y-3">
              <MiniRule text={isEnglish ? "Never share a seed or recovery secret." : "Deel nooit een seed of herstelgeheim."} />
              <MiniRule text={isEnglish ? "Verify network, account and transaction type." : "Controleer netwerk, account en transactietype."} />
              <MiniRule text={isEnglish ? "Use an explorer after signing." : "Gebruik na signing een explorer."} />
              <MiniRule text={isEnglish ? "Separate daily and treasury roles." : "Scheid dagelijkse en treasuryrollen."} />
            </div>
          </div>
        </aside>
      </section>

      {accessUnlocked && (
        <nav className="sticky bottom-3 z-20 mt-6 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <button
              type="button"
              onClick={goPrevious}
              disabled={safeStepIndex === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-35"
            >
              <ArrowLeft size={17} />
              <span className="hidden sm:inline">{isEnglish ? "Previous" : "Vorige"}</span>
            </button>
            <span className="text-xs font-semibold text-slate-500">
              {safeStepIndex + 1}/{selectedWallet.sections.length}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={safeStepIndex === selectedWallet.sections.length - 1}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-35"
            >
              <span className="hidden sm:inline">{isEnglish ? "Next" : "Volgende"}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

function WalletLessonStep({
  isEnglish,
  wallet,
  section,
  stepIndex,
  progress,
  copied,
  onCopy,
}: {
  isEnglish: boolean;
  wallet: WalletAcademyTrack;
  section: WalletAcademySection;
  stepIndex: number;
  progress: number;
  copied: boolean;
  onCopy: () => void;
}) {
  const points = isEnglish ? section.pointsEn : section.pointsNl;
  const warning = isEnglish ? section.warningEn : section.warningNl;

  return (
    <article className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/30 p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {wallet.name} · {isEnglish ? "Lesson step" : "Lesstap"} {stepIndex + 1}/{wallet.sections.length}
          </p>
          <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
            {isEnglish ? section.titleEn : section.titleNl}
          </h3>
        </div>
        <KeyRound className="shrink-0 text-blue-700" size={28} />
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <p className="mt-6 text-base leading-8 text-slate-700">
        {isEnglish ? section.summaryEn : section.summaryNl}
      </p>

      <div className="mt-6 space-y-3">
        {points.map((point) => (
          <div key={point} className="flex gap-3 rounded-2xl border border-blue-100 bg-white p-4">
            <CheckCircle2 className="mt-0.5 shrink-0 text-blue-700" size={18} />
            <p className="text-sm leading-6 text-slate-700">{point}</p>
          </div>
        ))}
      </div>

      {warning && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
          <div>
            <p className="font-semibold text-amber-950">{isEnglish ? "Current limitation" : "Actuele beperking"}</p>
            <p className="mt-2 text-sm leading-6 text-amber-900">{warning}</p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
          {isEnglish ? "Practical assignment" : "Praktijkopdracht"}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-200">
          {isEnglish ? section.practiceEn : section.practiceNl}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
        >
          {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
          {copied
            ? (isEnglish ? "Assignment copied" : "Opdracht gekopieerd")
            : (isEnglish ? "Copy assignment" : "Kopieer opdracht")}
        </button>
      </div>
    </article>
  );
}

function LockedWalletLesson({
  isEnglish,
  wallet,
  onUnlock,
}: {
  isEnglish: boolean;
  wallet: WalletAcademyTrack;
  onUnlock: () => void;
}) {
  return (
    <article className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-900 text-white">
          <Lock size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
            {isEnglish ? "Premium course" : "Premiumcursus"}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-amber-950">
            {wallet.sections.length} {isEnglish ? "full training steps are locked" : "volledige lesstappen zijn vergrendeld"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-amber-900">
            {isEnglish
              ? "A verified OTT Access Pass unlocks the complete security model, setup, signing, XRPL functions, recovery planning and practical assignments."
              : "Een geverifieerde OTT Access Pass opent het volledige beveiligingsmodel, setup, signing, XRPL-functies, herstelplanning en praktijkopdrachten."}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onUnlock}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-amber-900"
      >
        <ShieldCheck size={18} />
        {isEnglish ? "Open Access Pass" : "Open Access Pass"}
      </button>
    </article>
  );
}

function DecisionCard({
  title,
  text,
  positive = false,
}: {
  title: string;
  text: string;
  positive?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${positive ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${positive ? "text-emerald-800" : "text-amber-800"}`}>{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function ListCard({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <p className="font-semibold">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3">
            {positive
              ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={17} />
              : <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={17} />}
            <p className="text-sm leading-6 text-slate-600">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniRule({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-white/5 p-3">
      <CheckCircle2 className="mt-0.5 shrink-0 text-blue-300" size={16} />
      <p className="text-xs leading-5 text-slate-300">{text}</p>
    </div>
  );
}
