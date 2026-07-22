import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Library,
  Loader2,
  Lock,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Wallet,
  XCircle,
} from "lucide-react";
import { ACADEMY_LEARNING_CONTENT } from "../lib/academyLearningContent";
import {
  ACADEMY_ANSWER_PASS_SCORE,
  ACADEMY_COURSES,
  ACADEMY_NFT_MINIMUM_AVERAGE,
  ACADEMY_PATHS,
  type AcademyCourse,
  type AcademyPathId,
} from "../lib/academyCourseCatalog";
import {
  loadAcademyLessonAttempt,
  saveAcademyLessonAttempt,
} from "../lib/academyAttemptStore";
import {
  assessAcademyModule,
  checkAcademyAnswer,
} from "../lib/academyAssessmentClient";
import { reserveAcademyFoundationCertificate } from "../lib/academyCertificateClient";
import {
  migrateLegacyWalletProgressToAccount,
  saveAccountAcademyCompletion,
} from "../lib/accountAcademyStore";
import {
  getAcademyProgressSummary,
  type AcademyAnswerAssessment,
} from "../lib/academyProgressStore";
import { isAccessVerified, loadAccessState } from "../lib/accessStore";
import { NFT_EDITION_REGISTRY, formatEditionSerial } from "../lib/nftEditionRegistry";
import { getOttAccountName } from "../lib/ottAuth";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AcademyTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type AcademyView = "hub" | "library" | "course" | "certificate";

const MAX_ANSWER_LENGTH = 200;
const MIN_ANSWER_LENGTH = 18;

function isWalletAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function errorText(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

export function AcademyTab({ walletAddress = "guest", onNavigate }: AcademyTabProps) {
  const { language } = useTerminalLanguage();
  const { user, signedIn, loading: authLoading } = useOttAuthSession();
  const isEnglish = language === "en";
  const hasWallet = isWalletAddress(walletAddress);
  const accessUnlocked = hasWallet && isAccessVerified(loadAccessState(walletAddress));
  const accountName = getOttAccountName(user);
  const ownerKey = user?.id ? `account:${user.id}` : hasWallet ? `wallet:${walletAddress}` : "guest";

  const [view, setView] = useState<AcademyView>("hub");
  const [selectedPath, setSelectedPath] = useState<AcademyPathId | "all">("all");
  const [selectedCourseId, setSelectedCourseId] = useState(ACADEMY_COURSES[0].id);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [answersByCourse, setAnswersByCourse] = useState<Record<string, Record<string, string>>>({});
  const [assessmentsByCourse, setAssessmentsByCourse] = useState<Record<string, AcademyAnswerAssessment[]>>({});
  const [latestScores, setLatestScores] = useState<Record<string, number>>({});
  const [checkingTaskId, setCheckingTaskId] = useState("");
  const [isAssessing, setIsAssessing] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimSerial, setClaimSerial] = useState("");
  const [progressVersion, setProgressVersion] = useState(0);
  const [status, setStatus] = useState("");

  const progress = useMemo(
    () => getAcademyProgressSummary(walletAddress),
    [walletAddress, progressVersion, signedIn],
  );
  const selectedCourse = ACADEMY_COURSES.find((course) => course.id === selectedCourseId) ?? ACADEMY_COURSES[0];
  const selectedContent = ACADEMY_LEARNING_CONTENT[selectedCourse.id];
  const selectedCompletion = progress.completions.find((item) => item.lessonId === selectedCourse.id);
  const selectedAnswers = answersByCourse[selectedCourse.id] ?? {};
  const selectedAssessments = assessmentsByCourse[selectedCourse.id] ?? selectedCompletion?.assessments ?? [];
  const selectedLatestScore = latestScores[selectedCourse.id] ?? selectedCompletion?.overallScore ?? 0;
  const visibleCourses = selectedPath === "all"
    ? ACADEMY_COURSES
    : ACADEMY_COURSES.filter((course) => course.path === selectedPath);
  const completionPercent = Math.round((progress.completedCount / ACADEMY_COURSES.length) * 100);
  const allCoursesComplete = progress.completedCount === ACADEMY_COURSES.length;
  const scoreQualified = progress.averageScore >= ACADEMY_NFT_MINIMUM_AVERAGE;
  const certificateEligible = signedIn && hasWallet && allCoursesComplete && scoreQualified;
  const foundation = NFT_EDITION_REGISTRY.foundationCertificate;

  const libraryCourses = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase();
    if (!query) return ACADEMY_COURSES;
    return ACADEMY_COURSES.filter((course) => {
      const content = ACADEMY_LEARNING_CONTENT[course.id];
      return [
        course.title,
        ...course.topics,
        content?.summaryEn,
        content?.summaryNl,
        ...(content?.glossary.flatMap((item) => [item.term, item.definitionEn, item.definitionNl]) ?? []),
      ].join(" ").toLowerCase().includes(query);
    });
  }, [libraryQuery]);

  useEffect(() => {
    const refresh = () => setProgressVersion((value) => value + 1);
    window.addEventListener("ott-academy-progress-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ott-academy-progress-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !hasWallet || authLoading) return;
    void migrateLegacyWalletProgressToAccount(user.id, walletAddress)
      .then(() => setProgressVersion((value) => value + 1))
      .catch(() => undefined);
  }, [authLoading, hasWallet, user?.id, walletAddress]);

  useEffect(() => {
    const attempt = loadAcademyLessonAttempt(ownerKey, selectedCourseId);
    setAnswersByCourse((current) => ({ ...current, [selectedCourseId]: attempt.answers }));
    setAssessmentsByCourse((current) => ({ ...current, [selectedCourseId]: attempt.assessments }));
    setLatestScores((current) => ({ ...current, [selectedCourseId]: attempt.latestScore }));
  }, [ownerKey, selectedCourseId]);

  function persistAttempt(
    courseId: string,
    answers: Record<string, string>,
    assessments: AcademyAnswerAssessment[],
    latestScore: number,
  ) {
    saveAcademyLessonAttempt({ ownerKey, lessonId: courseId, answers, assessments, latestScore, updatedAt: Date.now() });
  }

  function openCourse(course: AcademyCourse) {
    if (course.access === "access" && !accessUnlocked) {
      setStatus(isEnglish
        ? "This course requires a verified OTT Access Pass."
        : "Deze cursus vereist een geverifieerde OTT Access Pass.");
      onNavigate?.("accessgate");
      return;
    }
    setSelectedCourseId(course.id);
    setStatus("");
    setView("course");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateAnswer(taskId: string, value: string) {
    const answers = {
      ...selectedAnswers,
      [taskId]: value.slice(0, MAX_ANSWER_LENGTH),
    };
    const assessments = selectedAssessments.filter((item) => item.taskId !== taskId);
    setAnswersByCourse((current) => ({ ...current, [selectedCourse.id]: answers }));
    setAssessmentsByCourse((current) => ({ ...current, [selectedCourse.id]: assessments }));
    persistAttempt(selectedCourse.id, answers, assessments, selectedLatestScore);
  }

  function lessonContext() {
    return [
      isEnglish ? selectedContent?.summaryEn : selectedContent?.summaryNl,
      ...(selectedContent?.sections.map((section) => isEnglish ? section.bodyEn : section.bodyNl) ?? []),
      isEnglish ? selectedContent?.exampleEn : selectedContent?.exampleNl,
    ].filter(Boolean).join("\n").slice(0, 5000);
  }

  async function checkOneAnswer(task: AcademyCourse["tasks"][number]) {
    const answer = selectedAnswers[task.id]?.trim() ?? "";
    if (answer.length < MIN_ANSWER_LENGTH) {
      setStatus(isEnglish
        ? `Write at least ${MIN_ANSWER_LENGTH} meaningful characters before checking this answer.`
        : `Schrijf minimaal ${MIN_ANSWER_LENGTH} betekenisvolle tekens voordat je dit antwoord controleert.`);
      return;
    }

    setCheckingTaskId(task.id);
    setStatus(isEnglish ? "Checking this answer…" : "Dit antwoord wordt gecontroleerd…");
    try {
      const response = await checkAcademyAnswer({
        lessonId: selectedCourse.id,
        taskId: task.id,
        question: isEnglish ? task.promptEn : task.promptNl,
        answer,
        lessonContext: lessonContext(),
        language,
      });
      if (!response.assessment) throw new Error("No assessment was returned.");
      const assessments = [
        ...selectedAssessments.filter((item) => item.taskId !== task.id),
        response.assessment,
      ];
      const latestScore = Math.round(
        assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length,
      );
      setAssessmentsByCourse((current) => ({ ...current, [selectedCourse.id]: assessments }));
      setLatestScores((current) => ({ ...current, [selectedCourse.id]: latestScore }));
      persistAttempt(selectedCourse.id, selectedAnswers, assessments, latestScore);
      setStatus(response.assessment.passed
        ? (isEnglish ? `Answer passed with ${response.assessment.score}%.` : `Antwoord geslaagd met ${response.assessment.score}%.`)
        : (isEnglish ? `Answer scored ${response.assessment.score}%. Improve it and check again.` : `Antwoord scoorde ${response.assessment.score}%. Verbeter het en controleer opnieuw.`));
    } catch (error) {
      setStatus(errorText(error, isEnglish ? "Answer check failed." : "Antwoordcontrole is mislukt."));
    } finally {
      setCheckingTaskId("");
    }
  }

  async function assessAndSave() {
    const answers = selectedCourse.tasks.map((task) => ({
      taskId: task.id,
      answer: selectedAnswers[task.id]?.trim() ?? "",
    }));
    if (answers.some((item) => item.answer.length < MIN_ANSWER_LENGTH)) {
      setStatus(isEnglish
        ? "Answer every question before calculating and saving the lesson percentage."
        : "Beantwoord iedere vraag voordat het lespercentage wordt berekend en opgeslagen.");
      return;
    }

    setIsAssessing(true);
    setStatus(isEnglish ? "Calculating the verified lesson score…" : "De geverifieerde lesscore wordt berekend…");
    try {
      const response = await assessAcademyModule({
        lessonId: selectedCourse.id,
        language,
        walletAddress: hasWallet ? walletAddress : "guest",
        answers,
      });
      const assessments = response.assessments ?? [];
      const score = response.overallScore ?? 0;
      setAssessmentsByCourse((current) => ({ ...current, [selectedCourse.id]: assessments }));
      setLatestScores((current) => ({ ...current, [selectedCourse.id]: score }));
      persistAttempt(selectedCourse.id, selectedAnswers, assessments, score);

      if (!response.overallPassed || assessments.some((item) => !item.passed)) {
        setStatus(isEnglish
          ? `Lesson result: ${score}%. Every answer must reach ${ACADEMY_ANSWER_PASS_SCORE}% before the lesson is completed.`
          : `Lesresultaat: ${score}%. Ieder antwoord moet minimaal ${ACADEMY_ANSWER_PASS_SCORE}% behalen voordat de les is afgerond.`);
        return;
      }

      if (!user?.id) {
        setStatus(isEnglish
          ? `Lesson result: ${score}%. Sign in to save it permanently to your OTT account.`
          : `Lesresultaat: ${score}%. Log in om dit permanent in je OTT-account op te slaan.`);
        return;
      }

      await saveAccountAcademyCompletion({
        userId: user.id,
        lessonId: selectedCourse.id,
        lessonTitle: selectedCourse.title,
        completedAt: Date.now(),
        xp: selectedCourse.xp,
        credits: selectedCourse.credits,
        overallScore: score,
        assessments,
        sourceWallet: hasWallet ? walletAddress : undefined,
      });
      setProgressVersion((value) => value + 1);
      setStatus(isEnglish
        ? `Lesson saved with ${score}%. Your highest verified score remains on your OTT account.`
        : `Les opgeslagen met ${score}%. Je hoogste geverifieerde score blijft in je OTT-account bewaard.`);
    } catch (error) {
      setStatus(errorText(error, isEnglish
        ? "The lesson score could not be calculated or saved."
        : "De lesscore kon niet worden berekend of opgeslagen."));
    } finally {
      setIsAssessing(false);
    }
  }

  async function reserveCertificate() {
    if (!signedIn) {
      onNavigate?.("wallet");
      return;
    }
    if (!hasWallet) {
      onNavigate?.("xaman");
      return;
    }
    if (!certificateEligible) return;

    setClaimBusy(true);
    setStatus(isEnglish ? "Rechecking Academy eligibility on the server…" : "Academy-geschiktheid wordt opnieuw op de server gecontroleerd…");
    try {
      const response = await reserveAcademyFoundationCertificate(walletAddress);
      const serial = response.claim?.serial ?? "";
      setClaimSerial(serial);
      setStatus(isEnglish
        ? `${serial || "Certificate"} is reserved for the OTT issuer mint workflow.`
        : `${serial || "Certificaat"} is gereserveerd voor de OTT issuer-mintflow.`);
    } catch (error) {
      setStatus(errorText(error, isEnglish ? "Certificate reservation failed." : "Certificaatreservering is mislukt."));
    } finally {
      setClaimBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">OTT Academy</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                {isEnglish ? "Learn, check each answer and build your verified score." : "Leer, controleer ieder antwoord en bouw je geverifieerde score op."}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                {isEnglish
                  ? "Every lesson stores its highest verified result. Complete all lessons with an Academy average of at least 75% to qualify for the Foundation Certificate NFT."
                  : "Iedere les bewaart het hoogste geverifieerde resultaat. Rond alle lessen af met een Academy-gemiddelde van minimaal 75% om voor het Foundation Certificate NFT in aanmerking te komen."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ViewButton active={view === "hub"} onClick={() => setView("hub")}>{isEnglish ? "Courses" : "Cursussen"}</ViewButton>
              <ViewButton active={view === "library"} onClick={() => setView("library")}>{isEnglish ? "Library" : "Bibliotheek"}</ViewButton>
              <ViewButton active={view === "certificate"} onClick={() => setView("certificate")}>{isEnglish ? "NFT certificate" : "NFT-certificaat"}</ViewButton>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label={isEnglish ? "Completed lessons" : "Afgeronde lessen"} value={`${progress.completedCount}/${ACADEMY_COURSES.length}`} text={`${completionPercent}% ${isEnglish ? "complete" : "voltooid"}`} />
            <SummaryCard label={isEnglish ? "Academy average" : "Academy-gemiddelde"} value={progress.completedCount ? `${progress.averageScore}%` : "—"} text={`${ACADEMY_NFT_MINIMUM_AVERAGE}% ${isEnglish ? "needed for NFT" : "nodig voor NFT"}`} />
            <SummaryCard label={isEnglish ? "Verified learning" : "Geverifieerd leren"} value={`${progress.totalXp} XP`} text={signedIn ? accountName || user?.email || "OTT account" : (isEnglish ? "Sign in to save" : "Log in om op te slaan")} />
            <SummaryCard label="Foundation NFT" value={claimSerial || (certificateEligible ? (isEnglish ? "Eligible" : "Geschikt") : (isEnglish ? "Locked" : "Vergrendeld"))} text="#0001–#5000" />
          </div>
        </div>
      </section>

      {status && <div className="border-b border-blue-100 bg-blue-50"><div className="mx-auto max-w-6xl px-5 py-3 text-sm text-blue-950 sm:px-8">{status}</div></div>}

      {view === "hub" && (
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Scoring system" : "Scoresysteem"}</p>
                <h2 className="mt-3 text-2xl font-semibold">{isEnglish ? "Check one answer, then verify the full lesson." : "Controleer één antwoord en verifieer daarna de volledige les."}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish
                  ? `Each answer needs ${ACADEMY_ANSWER_PASS_SCORE}%. The lesson percentage is the average of all answers. The NFT threshold is a ${ACADEMY_NFT_MINIMUM_AVERAGE}% average across all completed lessons.`
                  : `Ieder antwoord heeft ${ACADEMY_ANSWER_PASS_SCORE}% nodig. Het lespercentage is het gemiddelde van alle antwoorden. De NFT-grens is een gemiddelde van ${ACADEMY_NFT_MINIMUM_AVERAGE}% over alle afgeronde lessen.`}</p>
              </div>
              <button type="button" onClick={() => setView("library")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-100"><Library size={17} />{isEnglish ? "Open Library" : "Open bibliotheek"}</button>
            </div>
          </section>

          {!signedIn && <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><UserCircle className="mt-0.5 text-blue-700" size={21} /><div><p className="font-semibold text-blue-950">{isEnglish ? "Create a free OTT account" : "Maak een gratis OTT-account"}</p><p className="mt-1 text-sm text-blue-900/75">{isEnglish ? "Only verified account results count toward the NFT." : "Alleen geverifieerde accountresultaten tellen mee voor het NFT."}</p></div></div><button type="button" onClick={() => onNavigate?.("wallet")} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">{isEnglish ? "Sign in" : "Inloggen"}</button></section>}

          <section className="mt-14">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Learning paths" : "Leerpaden"}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{isEnglish ? "Choose one lesson at a time." : "Kies één les tegelijk."}</h2>
            <div className="mt-7 flex flex-wrap gap-2">
              <FilterButton active={selectedPath === "all"} onClick={() => setSelectedPath("all")}>{isEnglish ? "All courses" : "Alle cursussen"}</FilterButton>
              {ACADEMY_PATHS.map((path) => <FilterButton key={path.id} active={selectedPath === path.id} onClick={() => setSelectedPath(path.id)}>{isEnglish ? path.en : path.nl}</FilterButton>)}
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {visibleCourses.map((course) => {
                const completion = progress.completions.find((item) => item.lessonId === course.id);
                return <CourseCard key={course.id} course={course} isEnglish={isEnglish} locked={course.access === "access" && !accessUnlocked} score={completion?.overallScore} onClick={() => openCourse(course)} />;
              })}
            </div>
          </section>
        </main>
      )}

      {view === "library" && (
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">XRPL Library</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">{isEnglish ? "Search before answering." : "Zoek voordat je antwoordt."}</h2><p className="mt-4 text-base leading-7 text-slate-600">{isEnglish ? "Every knowledge-check answer is supported by the lesson and glossary." : "Ieder antwoord voor de kennistoets wordt ondersteund door de les en begrippenlijst."}</p></div>
          <div className="relative mt-8 max-w-2xl"><Search className="absolute left-4 top-3.5 text-slate-400" size={19} /><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder={isEnglish ? "Search wallet, trustline, AMM, validation…" : "Zoek wallet, trustline, AMM, validatie…"} className="w-full rounded-2xl border border-slate-200 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-blue-500" /></div>
          <div className="mt-9 space-y-5">
            {libraryCourses.map((course) => {
              const content = ACADEMY_LEARNING_CONTENT[course.id];
              return <article key={course.id} className="rounded-3xl border border-slate-200 p-6 sm:p-8"><div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{isEnglish ? "Course" : "Cursus"} {course.module}</p><h3 className="mt-2 text-xl font-semibold">{course.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish ? content?.summaryEn : content?.summaryNl}</p></div><button type="button" onClick={() => openCourse(course)} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">{isEnglish ? "Open lesson" : "Open les"}<ChevronRight size={16} /></button></div><div className="mt-6 grid gap-3 md:grid-cols-3">{content?.glossary.map((item) => <div key={item.term} className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold">{item.term}</p><p className="mt-2 text-sm leading-6 text-slate-600">{isEnglish ? item.definitionEn : item.definitionNl}</p></div>)}</div></article>;
            })}
          </div>
        </main>
      )}

      {view === "course" && (
        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <button type="button" onClick={() => setView("hub")} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ChevronLeft size={17} />{isEnglish ? "Back to courses" : "Terug naar cursussen"}</button>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{isEnglish ? "Course" : "Cursus"} {selectedCourse.module} · {selectedCourse.difficulty} · {selectedCourse.minutes} min</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{selectedCourse.title}</h2>

              <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Learn first" : "Leer eerst"}</p><p className="mt-4 text-lg leading-8 text-slate-800">{isEnglish ? selectedContent?.summaryEn : selectedContent?.summaryNl}</p></section>
              <div className="mt-6 space-y-4">{selectedContent?.sections.map((section, index) => <article key={section.titleEn} className="rounded-2xl border border-slate-200 p-6"><div className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{index + 1}</span><div><h3 className="text-lg font-semibold">{isEnglish ? section.titleEn : section.titleNl}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{isEnglish ? section.bodyEn : section.bodyNl}</p></div></div></article>)}</div>
              <section className="mt-6 rounded-2xl bg-slate-950 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">{isEnglish ? "Example" : "Voorbeeld"}</p><p className="mt-3 text-sm leading-7 text-slate-200">{isEnglish ? selectedContent?.exampleEn : selectedContent?.exampleNl}</p></section>
              <section className="mt-6"><h3 className="text-lg font-semibold">{isEnglish ? "Key terms" : "Kernbegrippen"}</h3><div className="mt-4 grid gap-3 sm:grid-cols-3">{selectedContent?.glossary.map((item) => <div key={item.term} className="rounded-2xl border border-slate-200 p-4"><p className="text-sm font-semibold">{item.term}</p><p className="mt-2 text-sm leading-6 text-slate-600">{isEnglish ? item.definitionEn : item.definitionNl}</p></div>)}</div></section>

              <div className="mt-12 border-t border-slate-200 pt-10"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Knowledge check" : "Kennistoets"}</p><h3 className="mt-3 text-2xl font-semibold">{isEnglish ? "Check every answer before saving the lesson." : "Controleer ieder antwoord voordat je de les opslaat."}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish ? "The individual check is practice feedback. The final button recalculates every answer using the trusted lesson rubric." : "De individuele controle is oefenfeedback. De laatste knop berekent ieder antwoord opnieuw met het vertrouwde lesbeoordelingsmodel."}</p></div>

              <div className="mt-7 space-y-5">
                {selectedCourse.tasks.map((task, index) => {
                  const answer = selectedAnswers[task.id] ?? "";
                  const assessment = selectedAssessments.find((item) => item.taskId === task.id);
                  return <article key={task.id} className={`rounded-2xl border p-5 sm:p-6 ${assessment?.passed ? "border-emerald-200 bg-emerald-50/40" : assessment ? "border-amber-200 bg-amber-50/40" : "border-slate-200"}`}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{isEnglish ? `Question ${index + 1}` : `Vraag ${index + 1}`}</p><h3 className="mt-2 text-base font-semibold leading-6">{isEnglish ? task.promptEn : task.promptNl}</h3></div>{assessment && <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold">{assessment.score}%</span>}</div><textarea value={answer} onChange={(event) => updateAnswer(task.id, event.target.value)} maxLength={MAX_ANSWER_LENGTH} rows={4} placeholder={isEnglish ? "Explain this in your own words…" : "Leg dit in je eigen woorden uit…"} className="mt-5 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none focus:border-blue-500" /><div className="mt-2 flex justify-between text-xs text-slate-500"><span>{isEnglish ? `Minimum ${MIN_ANSWER_LENGTH} meaningful characters` : `Minimaal ${MIN_ANSWER_LENGTH} betekenisvolle tekens`}</span><span>{answer.length}/{MAX_ANSWER_LENGTH}</span></div><button type="button" onClick={() => void checkOneAnswer(task)} disabled={checkingTaskId === task.id || isAssessing} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">{checkingTaskId === task.id ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}{isEnglish ? "Check this answer" : "Controleer dit antwoord"}</button>{assessment && <div className="mt-4 flex gap-3 rounded-xl border border-slate-200 bg-white p-4">{assessment.passed ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={18} /> : <XCircle className="mt-0.5 shrink-0 text-amber-700" size={18} />}<div><p className="text-sm leading-6 text-slate-700">{assessment.feedback}</p>{assessment.missingConcepts.length > 0 && <p className="mt-2 text-xs text-slate-500">{isEnglish ? "Review: " : "Controleer: "}{assessment.missingConcepts.join(", ")}</p>}</div></div>}</article>;
                })}
              </div>
            </section>

            <aside><div className="sticky top-24 rounded-2xl border border-slate-200 p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{isEnglish ? "Lesson result" : "Lesresultaat"}</p><p className="mt-3 text-4xl font-semibold">{selectedLatestScore ? `${selectedLatestScore}%` : "—"}</p>{selectedCompletion && <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"><BadgeCheck size={16} />{isEnglish ? `Saved best: ${selectedCompletion.overallScore}%` : `Opgeslagen beste: ${selectedCompletion.overallScore}%`}</div>}<div className="mt-5 space-y-4 text-sm"><InfoRow label={isEnglish ? "Answer pass mark" : "Slagingsgrens antwoord"} value={`${ACADEMY_ANSWER_PASS_SCORE}%`} /><InfoRow label={isEnglish ? "NFT average" : "NFT-gemiddelde"} value={`${ACADEMY_NFT_MINIMUM_AVERAGE}%`} /><InfoRow label={isEnglish ? "Stored under" : "Opgeslagen onder"} value={signedIn ? accountName || "OTT account" : (isEnglish ? "Practice only" : "Alleen oefenen")} /><InfoRow label={isEnglish ? "Reward" : "Beloning"} value={`+${selectedCourse.xp} XP`} /></div><button type="button" onClick={() => void assessAndSave()} disabled={isAssessing || Boolean(checkingTaskId)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{isAssessing ? <Loader2 className="animate-spin" size={17} /> : selectedCompletion ? <RefreshCcw size={17} /> : <ShieldCheck size={17} />}{isAssessing ? (isEnglish ? "Calculating score" : "Score berekenen") : selectedCompletion ? (isEnglish ? "Recheck and improve score" : "Opnieuw controleren en verbeteren") : (isEnglish ? "Calculate and save lesson" : "Les berekenen en opslaan")}</button>{!signedIn && <button type="button" onClick={() => onNavigate?.("wallet")} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"><UserCircle size={17} />{isEnglish ? "Sign in to save" : "Log in om op te slaan"}</button>}<a href={selectedCourse.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm text-slate-600 hover:text-slate-950"><span><span className="block text-xs text-slate-400">{isEnglish ? "Official source" : "Officiële bron"}</span><span className="mt-1 block font-medium">{selectedCourse.sourceLabel}</span></span><ExternalLink size={17} /></a></div></aside>
          </div>
        </main>
      )}

      {view === "certificate" && (
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Verified Academy achievement" : "Geverifieerde Academy-prestatie"}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">OTT XRPL Foundation Certificate NFT</h2><p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">{isEnglish ? "The server recalculates eligibility from saved Academy results before reserving a unique certificate number." : "De server berekent de geschiktheid opnieuw op basis van opgeslagen Academy-resultaten voordat een uniek certificaatnummer wordt gereserveerd."}</p><div className="mt-10 rounded-2xl border border-slate-200 p-6 sm:p-8"><h3 className="text-xl font-semibold">{isEnglish ? "NFT requirements" : "NFT-voorwaarden"}</h3><div className="mt-6 space-y-4"><Requirement done={allCoursesComplete} text={isEnglish ? `Complete all ${ACADEMY_COURSES.length} lessons (${progress.completedCount}/${ACADEMY_COURSES.length})` : `Rond alle ${ACADEMY_COURSES.length} lessen af (${progress.completedCount}/${ACADEMY_COURSES.length})`} /><Requirement done={scoreQualified} text={isEnglish ? `Reach at least ${ACADEMY_NFT_MINIMUM_AVERAGE}% overall (${progress.averageScore || 0}%)` : `Behaal minimaal ${ACADEMY_NFT_MINIMUM_AVERAGE}% gemiddeld (${progress.averageScore || 0}%)`} /><Requirement done={signedIn} text={isEnglish ? "Use a verified OTT account" : "Gebruik een geverifieerd OTT-account"} /><Requirement done={hasWallet} text={isEnglish ? "Connect the receiving XRPL wallet" : "Koppel de ontvangende XRPL-wallet"} /></div><div className="mt-8"><div className="flex justify-between text-sm font-medium"><span>{isEnglish ? "Course completion" : "Lesvoortgang"}</span><span>{completionPercent}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700" style={{ width: `${completionPercent}%` }} /></div></div><div className="mt-5 flex justify-between text-sm font-medium"><span>{isEnglish ? "Academy average" : "Academy-gemiddelde"}</span><span>{progress.averageScore || 0}% / {ACADEMY_NFT_MINIMUM_AVERAGE}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${scoreQualified ? "bg-emerald-600" : "bg-amber-500"}`} style={{ width: `${Math.min(100, progress.averageScore || 0)}%` }} /></div></div></div><button type="button" onClick={() => void reserveCertificate()} disabled={claimBusy || (!certificateEligible && signedIn && hasWallet)} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{claimBusy ? <Loader2 className="animate-spin" size={17} /> : <Award size={17} />}{claimSerial ? `${isEnglish ? "Reserved" : "Gereserveerd"} ${claimSerial}` : !signedIn ? (isEnglish ? "Sign in first" : "Eerst inloggen") : !hasWallet ? (isEnglish ? "Connect wallet first" : "Eerst wallet koppelen") : certificateEligible ? (isEnglish ? "Start NFT mint claim" : "Start NFT-mintclaim") : (isEnglish ? "Complete requirements" : "Voltooi de voorwaarden")}</button><p className="mt-4 text-xs leading-5 text-slate-500">{isEnglish ? "This reserves the verified claim and edition number. The final on-ledger mint remains an OTT issuer transaction and cannot be self-approved from the browser." : "Dit reserveert de geverifieerde claim en het editienummer. De definitieve on-ledger mint blijft een OTT issuer-transactie en kan niet vanuit de browser zelf worden goedgekeurd."}</p></div></section>
            <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white"><Award size={32} className="text-blue-300" /><p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">{isEnglish ? "Certificate edition" : "Certificaat-editie"}</p><p className="mt-3 text-3xl font-semibold">{formatEditionSerial("foundationCertificate", foundation.serialStart)}–{formatEditionSerial("foundationCertificate", foundation.serialEnd)}</p><div className="mt-7 space-y-3"><DarkStat label={isEnglish ? "Completed" : "Afgerond"} value={`${progress.completedCount}/${ACADEMY_COURSES.length}`} /><DarkStat label={isEnglish ? "Average" : "Gemiddelde"} value={`${progress.averageScore || 0}%`} /><DarkStat label={isEnglish ? "NFT status" : "NFT-status"} value={claimSerial || (certificateEligible ? (isEnglish ? "Eligible" : "Geschikt") : (isEnglish ? "Locked" : "Vergrendeld"))} /></div></aside>
          </div>
        </main>
      )}
    </div>
  );
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${active ? "bg-slate-950 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{children}</button>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-blue-700 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{children}</button>;
}

function SummaryCard({ label, value, text }: { label: string; value: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{text}</p></div>;
}

function CourseCard({ course, isEnglish, locked, score, onClick }: { course: AcademyCourse; isEnglish: boolean; locked: boolean; score?: number; onClick: () => void }) {
  return <article className="rounded-3xl border border-slate-200 p-6 transition hover:border-slate-300 hover:shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100"><BookOpen size={21} /></div>{score !== undefined ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{score}%</span> : locked ? <Lock size={17} className="text-slate-400" /> : <span className="text-xs font-medium text-blue-700">{course.access === "free" ? "Free" : "Access"}</span>}</div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{isEnglish ? "Course" : "Cursus"} {course.module} · {course.minutes} min</p><h3 className="mt-2 text-xl font-semibold">{course.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish ? course.outcomeEn : course.outcomeNl}</p><div className="mt-5 flex flex-wrap gap-2">{course.topics.slice(0, 3).map((topic) => <span key={topic} className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">{topic}</span>)}</div><button type="button" onClick={onClick} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">{score !== undefined ? (isEnglish ? "Review or improve" : "Bekijken of verbeteren") : locked ? (isEnglish ? "Verify Access" : "Verifieer Access") : (isEnglish ? "Start learning" : "Start met leren")}<ChevronRight size={16} /></button></article>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-900">{value}</span></div>;
}

function Requirement({ done, text }: { done: boolean; text: string }) {
  return <div className="flex items-center gap-3"><span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{done ? <CheckCircle2 size={15} /> : <Lock size={13} />}</span><span className="text-sm text-slate-700">{text}</span></div>;
}

function DarkStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 font-semibold">{value}</p></div>;
}
