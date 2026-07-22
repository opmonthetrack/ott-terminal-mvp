import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import {
  ACADEMY_COACH_EVENT,
  type AcademyCoachEventDetail,
} from "../lib/academyAssessmentClient";

type CoachEvent = CustomEvent<AcademyCoachEventDetail>;

export function AcademyCoachPopup() {
  const [detail, setDetail] = useState<AcademyCoachEventDetail | null>(null);

  useEffect(() => {
    const onCoachResult = (event: Event) => {
      setDetail((event as CoachEvent).detail);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetail(null);
    };

    window.addEventListener(ACADEMY_COACH_EVENT, onCoachResult);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(ACADEMY_COACH_EVENT, onCoachResult);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const assessment = detail?.response?.assessment;
  const coach = detail?.response?.coach;
  const isDutch = detail?.language === "nl";
  const score = assessment?.score ?? 0;
  const passed = Boolean(assessment?.passed);
  const modeLabel = useMemo(() => {
    if (!detail) return "";
    if (coach?.provider === "gemini") return "Gemini AI Coach";
    return isDutch ? "OTT oefencoach" : "OTT practice coach";
  }, [coach?.provider, detail, isDutch]);

  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) setDetail(null);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="academy-coach-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/70 bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur sm:px-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-pink-600 text-white shadow-lg">
              <Bot size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                {modeLabel}
              </p>
              <h2 id="academy-coach-title" className="mt-1 text-xl font-semibold text-slate-950">
                {isDutch ? "Antwoordcontrole" : "Answer review"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDetail(null)}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            aria-label={isDutch ? "Sluiten" : "Close"}
          >
            <X size={19} />
          </button>
        </header>

        <div className="space-y-5 px-5 py-6 sm:px-7 sm:py-7">
          <div className="rounded-2xl bg-slate-100 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {isDutch ? "Vraag" : "Question"}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{detail.question}</p>
            <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {isDutch ? "Jouw antwoord" : "Your answer"}
              </p>
              {detail.answer}
            </div>
          </div>

          {detail.error ? (
            <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
              <XCircle className="mt-0.5 shrink-0" size={21} />
              <div>
                <p className="font-semibold">{isDutch ? "Controle mislukt" : "Review failed"}</p>
                <p className="mt-2 text-sm leading-6">{detail.error}</p>
              </div>
            </div>
          ) : assessment ? (
            <>
              <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
                <div className={`rounded-2xl border p-5 text-center ${passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="flex items-center justify-center">
                    {passed ? <CheckCircle2 className="text-emerald-700" size={28} /> : <XCircle className="text-amber-700" size={28} />}
                  </div>
                  <p className="mt-3 text-4xl font-bold text-slate-950">{score}%</p>
                  <p className={`mt-2 text-sm font-semibold ${passed ? "text-emerald-800" : "text-amber-800"}`}>
                    {passed
                      ? isDutch ? "Geslaagd" : "Passed"
                      : isDutch ? "Nog verbeteren" : "Needs improvement"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">70% {isDutch ? "nodig" : "required"}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Sparkles size={17} className="text-violet-600" />
                    {isDutch ? "Feedback van de coach" : "Coach feedback"}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{assessment.feedback}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${passed ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.max(4, score)}%` }}
                    />
                  </div>
                </div>
              </div>

              {coach?.strengths && coach.strengths.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                  <div className="flex items-center gap-2 font-semibold text-emerald-950">
                    <ShieldCheck size={18} />
                    {isDutch ? "Wat al goed is" : "What is already good"}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coach.strengths.map((item) => (
                      <span key={item} className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-900">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {assessment.missingConcepts.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                  <div className="flex items-center gap-2 font-semibold text-amber-950">
                    <Lightbulb size={18} />
                    {isDutch ? "Nog toevoegen" : "Still add"}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {assessment.missingConcepts.map((item) => (
                      <span key={item} className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {coach?.suggestedAnswer && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
                  <p className="font-semibold text-blue-950">
                    {isDutch ? "Voorbeeld van een sterker antwoord" : "Example of a stronger answer"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-blue-950/80">{coach.suggestedAnswer}</p>
                  <p className="mt-3 text-xs leading-5 text-blue-800">
                    {isDutch
                      ? "Gebruik dit als uitleg en schrijf daarna opnieuw in je eigen woorden."
                      : "Use this as guidance and then rewrite it in your own words."}
                  </p>
                </div>
              )}

              {coach?.note && (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                  {coach.note}
                </p>
              )}
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setDetail(null)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {isDutch ? "Antwoord verbeteren" : "Improve answer"}
          </button>
        </div>
      </section>
    </div>
  );
}
