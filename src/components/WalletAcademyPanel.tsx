import { Award, BookOpen, CheckCircle2, ShieldCheck } from "lucide-react";
import { getWalletAcademyStats, WALLET_ACADEMY_MODULES } from "../lib/walletAcademy";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

export function WalletAcademyPanel() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const stats = getWalletAcademyStats();

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-blue-700">
              <BookOpen size={21} />
              <p className="text-sm font-semibold">{isEnglish ? "XRPL Wallet Academy" : "XRPL Wallet Academy"}</p>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {isEnglish
                ? "Learn the account first. Choose the wallet second. Sign only after you understand the transaction."
                : "Leer eerst het account. Kies daarna de wallet. Onderteken pas wanneer je de transactie begrijpt."}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {isEnglish
                ? "Every supported wallet follows the same XRPL foundation, security and Testnet practice path. A wallet brand never replaces ledger knowledge."
                : "Iedere ondersteunde wallet volgt hetzelfde XRPL-fundament, beveiligingspad en Testnet-praktijktraject. Een walletmerk vervangt nooit ledgerkennis."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label={isEnglish ? "Modules" : "Modules"} value={stats.moduleCount} />
            <Stat label={isEnglish ? "Lessons" : "Lessen"} value={stats.lessonCount} />
            <Stat label="XP" value={stats.totalXp} />
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {WALLET_ACADEMY_MODULES.map((module, index) => (
            <article key={module.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    {isEnglish ? `Module ${index + 1}` : `Module ${index + 1}`}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{module.title[language]}</h3>
                </div>
                {index === 1 ? <ShieldCheck className="text-blue-700" /> : index === 2 ? <Award className="text-blue-700" /> : <BookOpen className="text-blue-700" />}
              </div>

              <ol className="mt-6 space-y-4">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{lesson.title[language]}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{lesson.summary[language]}</p>
                      <p className="mt-1 text-xs font-medium text-blue-700">+{lesson.xp} XP</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">{isEnglish ? "Credential after verified completion" : "Credential na geverifieerde voltooiing"}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{module.certificateType}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-2xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
