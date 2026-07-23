import fs from "node:fs";

const file = "src/tabs/AcademyTabV4.tsx";
let source = fs.readFileSync(file, "utf8");

const startMarker = "function CourseView(props: CourseViewProps) {";
const endMarker = "\ntype AnswerCardProps = {";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

if (start < 0 || end < 0) {
  throw new Error("CourseView markers were not found.");
}

const replacement = `function CourseView(props: CourseViewProps) {
  const {
    isEnglish,
    course,
    content,
    answers,
    assessments,
    latestScore,
    savedScore,
    signedIn,
    accountName,
    checkingTaskId,
    isAssessing,
    onBack,
    onUpdateAnswer,
    onCheckAnswer,
    onAssess,
    onSignIn,
  } = props;

  type LessonStep = {
    id: string;
    kind: "overview" | "section" | "example" | "glossary" | "question" | "result";
    label: string;
    sectionIndex?: number;
    glossaryIndex?: number;
    taskIndex?: number;
  };

  const steps = useMemo<LessonStep[]>(() => [
    {
      id: "overview",
      kind: "overview",
      label: isEnglish ? "Overview" : "Overzicht",
    },
    ...(content?.sections ?? []).map((section, index) => ({
      id: \`section-\${index}\`,
      kind: "section" as const,
      label: isEnglish ? section.titleEn : section.titleNl,
      sectionIndex: index,
    })),
    {
      id: "example",
      kind: "example",
      label: isEnglish ? "Practical example" : "Praktijkvoorbeeld",
    },
    ...(content?.glossary ?? []).map((item, index) => ({
      id: \`glossary-\${index}\`,
      kind: "glossary" as const,
      label: item.term,
      glossaryIndex: index,
    })),
    ...course.tasks.map((task, index) => ({
      id: \`question-\${task.id}\`,
      kind: "question" as const,
      label: isEnglish ? \`Question \${index + 1}\` : \`Vraag \${index + 1}\`,
      taskIndex: index,
    })),
    {
      id: "result",
      kind: "result",
      label: isEnglish ? "Lesson result" : "Lesresultaat",
    },
  ], [content, course.tasks, isEnglish]);

  const [stepIndex, setStepIndex] = useState(0);
  const safeStepIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const step = steps[safeStepIndex];
  const activeTask = step.kind === "question"
    ? course.tasks[step.taskIndex ?? 0]
    : undefined;
  const activeAssessment = activeTask
    ? assessments.find((item) => item.taskId === activeTask.id)
    : undefined;
  const passedQuestionCount = course.tasks.filter((task) => (
    assessments.find((item) => item.taskId === task.id)?.passed
  )).length;
  const allQuestionsPassed = passedQuestionCount === course.tasks.length;
  const firstOpenQuestionStep = steps.findIndex((candidate) => {
    if (candidate.kind !== "question") return false;
    const task = course.tasks[candidate.taskIndex ?? 0];
    return !assessments.find((item) => item.taskId === task?.id)?.passed;
  });
  const canContinue = step.kind !== "question" || Boolean(activeAssessment?.passed);
  const isLastStep = safeStepIndex === steps.length - 1;
  const progressPercent = Math.round(((safeStepIndex + 1) / steps.length) * 100);

  useEffect(() => {
    setStepIndex(0);
  }, [course.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [safeStepIndex]);

  function goPrevious() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    if (!canContinue || isLastStep) return;
    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  }

  function renderStep() {
    if (step.kind === "overview") {
      return (
        <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {isEnglish ? "Learn first" : "Leer eerst"}
          </p>
          <h3 className="mt-3 text-2xl font-semibold">
            {isEnglish ? "What this lesson teaches" : "Wat je in deze les leert"}
          </h3>
          <p className="mt-5 text-base leading-8 text-slate-700">
            {isEnglish ? content?.summaryEn : content?.summaryNl}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InfoTile label={isEnglish ? "Level" : "Niveau"} value={course.difficulty} />
            <InfoTile label={isEnglish ? "Duration" : "Duur"} value={\`\${course.minutes} min\`} />
            <InfoTile label={isEnglish ? "Reward" : "Beloning"} value={\`+\${course.xp} XP\`} />
          </div>
        </section>
      );
    }

    if (step.kind === "section") {
      const section = content?.sections[step.sectionIndex ?? 0];
      return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {isEnglish ? "Lesson section" : "Lesonderdeel"} {(step.sectionIndex ?? 0) + 1}
          </p>
          <h3 className="mt-3 text-2xl font-semibold">
            {isEnglish ? section?.titleEn : section?.titleNl}
          </h3>
          <p className="mt-5 text-base leading-8 text-slate-700">
            {isEnglish ? section?.bodyEn : section?.bodyNl}
          </p>
        </section>
      );
    }

    if (step.kind === "example") {
      return (
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            {isEnglish ? "Practical example" : "Praktijkvoorbeeld"}
          </p>
          <h3 className="mt-3 text-2xl font-semibold">
            {isEnglish ? "See how it works" : "Zo werkt het in de praktijk"}
          </h3>
          <p className="mt-5 text-base leading-8 text-slate-200">
            {isEnglish ? content?.exampleEn : content?.exampleNl}
          </p>
        </section>
      );
    }

    if (step.kind === "glossary") {
      const item = content?.glossary[step.glossaryIndex ?? 0];
      return (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {isEnglish ? "Key term" : "Kernbegrip"} {(step.glossaryIndex ?? 0) + 1}/{content?.glossary.length ?? 0}
          </p>
          <h3 className="mt-4 text-3xl font-semibold">{item?.term}</h3>
          <p className="mt-5 text-base leading-8 text-slate-700">
            {isEnglish ? item?.definitionEn : item?.definitionNl}
          </p>
        </section>
      );
    }

    if (step.kind === "question" && activeTask) {
      return (
        <section>
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
            {isEnglish
              ? "Answer in your own words, check it immediately and continue only after this answer passes."
              : "Antwoord in je eigen woorden, controleer het direct en ga pas verder wanneer dit antwoord slaagt."}
          </div>
          <AnswerCard
            isEnglish={isEnglish}
            index={step.taskIndex ?? 0}
            task={activeTask}
            answer={answers[activeTask.id] ?? ""}
            assessment={activeAssessment}
            busy={checkingTaskId === activeTask.id}
            disabled={isAssessing}
            onChange={(value) => onUpdateAnswer(activeTask.id, value)}
            onCheck={() => onCheckAnswer(activeTask)}
          />
          {activeAssessment && !activeAssessment.passed && (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              {isEnglish
                ? "Improve this answer using the feedback above. The Next button unlocks after the answer passes."
                : "Verbeter dit antwoord met de feedback hierboven. De knop Volgende opent zodra het antwoord slaagt."}
            </p>
          )}
        </section>
      );
    }

    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          {isEnglish ? "Verified lesson result" : "Geverifieerd lesresultaat"}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <InfoTile
            label={isEnglish ? "Questions passed" : "Vragen geslaagd"}
            value={\`\${passedQuestionCount}/\${course.tasks.length}\`}
          />
          <InfoTile
            label={isEnglish ? "Current score" : "Huidige score"}
            value={latestScore ? \`\${latestScore}%\` : "—"}
          />
          <InfoTile
            label={isEnglish ? "Saved best" : "Opgeslagen beste"}
            value={savedScore !== undefined ? \`\${savedScore}%\` : "—"}
          />
        </div>

        {!allQuestionsPassed && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-950">
              {isEnglish ? "Not every answer has passed yet." : "Nog niet ieder antwoord is geslaagd."}
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              {isEnglish
                ? \`Every answer needs at least \${ACADEMY_ANSWER_PASS_SCORE}% before the final lesson score can be saved.\`
                : \`Ieder antwoord moet minimaal \${ACADEMY_ANSWER_PASS_SCORE}% behalen voordat de definitieve lesscore kan worden opgeslagen.\`}
            </p>
            {firstOpenQuestionStep >= 0 && (
              <button
                type="button"
                onClick={() => setStepIndex(firstOpenQuestionStep)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-3 text-sm font-semibold text-white"
              >
                {isEnglish ? "Go to first open question" : "Ga naar eerste open vraag"}
                <ChevronRight size={17} />
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onAssess}
          disabled={isAssessing || Boolean(checkingTaskId) || !allQuestionsPassed}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAssessing
            ? <Loader2 className="animate-spin" size={17} />
            : savedScore !== undefined
              ? <RefreshCcw size={17} />
              : <ShieldCheck size={17} />}
          {isAssessing
            ? isEnglish ? "Calculating score" : "Score berekenen"
            : savedScore !== undefined
              ? isEnglish ? "Recheck and improve score" : "Opnieuw controleren en verbeteren"
              : isEnglish ? "Calculate and save lesson" : "Les berekenen en opslaan"}
        </button>

        {!signedIn && (
          <button
            type="button"
            onClick={onSignIn}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            <UserCircle size={17} />
            {isEnglish ? "Sign in to save permanently" : "Log in om permanent op te slaan"}
          </button>
        )}

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            {isEnglish ? "Stored under: " : "Opgeslagen onder: "}
            <strong>{signedIn ? accountName || "OTT account" : isEnglish ? "practice only" : "alleen oefenen"}</strong>
          </p>
          <p className="mt-2">
            {isEnglish ? "NFT Academy average: " : "NFT Academy-gemiddelde: "}
            <strong>{ACADEMY_NFT_MINIMUM_AVERAGE}%</strong>
          </p>
        </div>

        <a
          href={course.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
        >
          <span>
            <span className="block text-xs text-slate-400">
              {isEnglish ? "Official source" : "Officiële bron"}
            </span>
            <span className="mt-1 block font-medium">{course.sourceLabel}</span>
          </span>
          <ExternalLink size={17} />
        </a>
      </section>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        <ChevronLeft size={17} />
        {isEnglish ? "Back to courses" : "Terug naar cursussen"}
      </button>

      <header className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              {isEnglish ? "Course" : "Cursus"} {course.module} · {course.difficulty} · {course.minutes} min
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{course.title}</h2>
          </div>
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white sm:text-right">
            <p className="text-xs text-slate-300">{isEnglish ? "Lesson score" : "Lesscore"}</p>
            <p className="mt-1 text-2xl font-semibold">{latestScore ? \`\${latestScore}%\` : "—"}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-800">
            {isEnglish ? "Step" : "Stap"} {safeStepIndex + 1}/{steps.length}
          </span>
          <span className="max-w-[60%] truncate text-right text-slate-500">{step.label}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: \`\${progressPercent}%\` }} />
        </div>

        <label className="mt-4 block sm:hidden">
          <span className="sr-only">{isEnglish ? "Select lesson step" : "Selecteer lesstap"}</span>
          <select
            value={safeStepIndex}
            onChange={(event) => setStepIndex(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
          >
            {steps.map((candidate, index) => (
              <option key={candidate.id} value={index}>
                {index + 1}. {candidate.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="mt-5 min-h-[360px]">{renderStep()}</div>

      <nav className="sticky bottom-3 z-20 mt-6 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            type="button"
            onClick={goPrevious}
            disabled={safeStepIndex === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-35"
          >
            <ChevronLeft size={17} />
            <span className="hidden sm:inline">{isEnglish ? "Previous" : "Vorige"}</span>
          </button>

          <span className="text-xs font-semibold text-slate-500">
            {safeStepIndex + 1}/{steps.length}
          </span>

          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue || isLastStep}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span className="hidden sm:inline">{isEnglish ? "Next" : "Volgende"}</span>
            <ChevronRight size={17} />
          </button>
        </div>
        {step.kind === "question" && !activeAssessment?.passed && (
          <p className="mt-2 text-center text-xs text-slate-500">
            {isEnglish ? "Check and pass this answer to unlock Next." : "Controleer en haal dit antwoord om Volgende te openen."}
          </p>
        )}
      </nav>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
`;

source = source.slice(0, start) + replacement + source.slice(end);
source = source.replace("rows={4}", "rows={3}");
source = source.replace(
  'className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"',
  'className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"',
);

fs.writeFileSync(file, source);
console.log("Mobile Academy stepper applied.");
