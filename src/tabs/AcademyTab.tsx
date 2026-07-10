import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  KeyRound,
  Layers,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AcademyTabProps = {
  walletAddress?: string;
};

type LessonStatus = "free" | "premium";
type AcademyView = "path" | "lessons" | "quiz" | "certificate";

type Lesson = {
  id: string;
  module: string;
  titleNl: string;
  titleEn: string;
  goalNl: string;
  goalEn: string;
  minutes: number;
  status: LessonStatus;
  xp: number;
  icon: ElementType;
};

type QuizQuestion = {
  id: string;
  questionNl: string;
  questionEn: string;
  answersNl: string[];
  answersEn: string[];
  correctIndex: number;
};

const progressStorageKey = "ott-academy-progress-v1";

const lessons: Lesson[] = [
  {
    id: "xrpl-starter",
    module: "01",
    titleNl: "XRPL Starter",
    titleEn: "XRPL Starter",
    goalNl: "Leer wat de XRPL is, waarom snelheid en kosten belangrijk zijn, en hoe je veilig begint.",
    goalEn: "Learn what the XRPL is, why speed and costs matter, and how to start safely.",
    minutes: 12,
    status: "free",
    xp: 25,
    icon: BookOpen,
  },
  {
    id: "xaman-safety",
    module: "02",
    titleNl: "Xaman Wallet Safety",
    titleEn: "Xaman Wallet Safety",
    goalNl: "Begrijp self-custody, signing, seeds, recovery en waarom OTT nooit private keys vraagt.",
    goalEn: "Understand self-custody, signing, seeds, recovery, and why OTT never asks for private keys.",
    minutes: 15,
    status: "free",
    xp: 35,
    icon: KeyRound,
  },
  {
    id: "sourcetag-proof",
    module: "03",
    titleNl: "SourceTag & Proof",
    titleEn: "SourceTag & Proof",
    goalNl: "Leer hoe SourceTag 2606170002 proof, tracking en transparantie op XRPL ondersteunt.",
    goalEn: "Learn how SourceTag 2606170002 supports proof, tracking, and transparency on XRPL.",
    minutes: 18,
    status: "premium",
    xp: 50,
    icon: BadgeCheck,
  },
  {
    id: "access-pass",
    module: "04",
    titleNl: "NFT Access Pass",
    titleEn: "NFT Access Pass",
    goalNl: "Leer waarom de Access Pass utility-only is en hoe wallet-based toegang werkt.",
    goalEn: "Learn why the Access Pass is utility-only and how wallet-based access works.",
    minutes: 20,
    status: "premium",
    xp: 60,
    icon: ShieldCheck,
  },
  {
    id: "xrpl-payments",
    module: "05",
    titleNl: "XRPL Payments & Trustlines",
    titleEn: "XRPL Payments & Trustlines",
    goalNl: "Leer het verschil tussen XRP, issued assets, trustlines en veilige betaalroutes.",
    goalEn: "Learn the difference between XRP, issued assets, trustlines, and safe payment routes.",
    minutes: 24,
    status: "premium",
    xp: 75,
    icon: Wallet,
  },
  {
    id: "builder-path",
    module: "06",
    titleNl: "OnTheTrack Builder Path",
    titleEn: "OnTheTrack Builder Path",
    goalNl: "Zet je kennis om in een proof-based opdracht, certificaat en portfolio item.",
    goalEn: "Turn your knowledge into a proof-based assignment, certificate, and portfolio item.",
    minutes: 30,
    status: "premium",
    xp: 100,
    icon: Layers,
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    questionNl: "Wat is de veiligste positie van OTT Terminal?",
    questionEn: "What is the safest position for OTT Terminal?",
    answersNl: [
      "Private keys bewaren voor gebruikers",
      "Education-first, self-custody, geen custody",
      "Automatisch traden namens gebruikers",
    ],
    answersEn: [
      "Store private keys for users",
      "Education-first, self-custody, no custody",
      "Automatically trade on behalf of users",
    ],
    correctIndex: 1,
  },
  {
    id: "q2",
    questionNl: "Waarvoor gebruiken we SourceTag 2606170002?",
    questionEn: "What do we use SourceTag 2606170002 for?",
    answersNl: [
      "Proof en herkenbaarheid van OTT transacties",
      "Geheime wallet-toegang",
      "Prijsvoorspellingen",
    ],
    answersEn: [
      "Proof and recognition of OTT transactions",
      "Secret wallet access",
      "Price predictions",
    ],
    correctIndex: 0,
  },
  {
    id: "q3",
    questionNl: "Wat is de juiste juridische positie van de OTT Access Pass?",
    questionEn: "What is the correct legal position of the OTT Access Pass?",
    answersNl: [
      "Utility access only, geen waarde- of yieldbelofte",
      "Investment met gegarandeerde opbrengst",
      "Broker-account voor trading",
    ],
    answersEn: [
      "Utility access only, no value or yield promise",
      "Investment with guaranteed return",
      "Broker account for trading",
    ],
    correctIndex: 0,
  },
];

export function AcademyTab({ walletAddress = "guest" }: AcademyTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  const [activeView, setActiveView] = useState<AcademyView>("path");
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() =>
    readProgress(),
  );
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);
  const totalXp = lessons
    .filter((lesson) => completedLessonIds.includes(lesson.id))
    .reduce((sum, lesson) => sum + lesson.xp, 0);
  const quizScore = useMemo(() => {
    return quizQuestions.reduce((score, question) => {
      return quizAnswers[question.id] === question.correctIndex ? score + 1 : score;
    }, 0);
  }, [quizAnswers]);

  const premiumLessons = lessons.filter((lesson) => lesson.status === "premium").length;
  const freeLessons = lessons.filter((lesson) => lesson.status === "free").length;

  function toggleLessonComplete(lessonId: string) {
    const next = completedLessonIds.includes(lessonId)
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(next);
    writeProgress(next);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.28),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6">
                <OTTLogo size="lg" subtitle={isEnglish ? "Structured XRPL education" : "Gestructureerde XRPL educatie"} />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <GraduationCap size={15} className="text-[#3898E8]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish ? "OTT Academy V1.0" : "OTT Academie V1.0"}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Learn XRPL." : "Leer XRPL."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Prove Progress." : "Bewijs Progressie."}
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? "A structured learning environment for XRPL onboarding: lessons, assignments, quizzes, XP and proof. Built education-first, self-custody, and without investment promises."
                  : "Een gestructureerde leeromgeving voor XRPL onboarding: lessen, opdrachten, quizzen, XP en proof. Gebouwd education-first, self-custody en zonder investeringsbelofte."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                <MetricCard
                  label={isEnglish ? "Progress" : "Voortgang"}
                  value={`${progressPercent}%`}
                  text={`${completedCount}/${lessons.length} ${isEnglish ? "lessons" : "lessen"}`}
                  icon={Target}
                />
                <MetricCard
                  label="XP"
                  value={String(totalXp)}
                  text={isEnglish ? "Learning score" : "Leerscore"}
                  icon={Sparkles}
                />
                <MetricCard
                  label={isEnglish ? "Free" : "Gratis"}
                  value={String(freeLessons)}
                  text={isEnglish ? "Open modules" : "Open modules"}
                  icon={BookOpen}
                />
                <MetricCard
                  label={isEnglish ? "Premium" : "Betaald"}
                  value={String(premiumLessons)}
                  text={isEnglish ? "Access-gated" : "Achter toegang"}
                  icon={Lock}
                />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {isEnglish ? "Student Status" : "Studentstatus"}
                  </p>

                  <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">
                      V1.0
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <OTTProofBadge sourceTag="2606170002" />
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label="Wallet"
                    value={walletAddress === "guest" ? "Guest / Free Preview" : walletAddress}
                  />
                  <InfoRow
                    label={isEnglish ? "Current Path" : "Huidig leerpad"}
                    value={isEnglish ? "XRPL Starter" : "XRPL Starter"}
                  />
                  <InfoRow
                    label={isEnglish ? "Certificate" : "Certificaat"}
                    value={progressPercent >= 100 ? "Ready" : "Locked"}
                  />
                  <InfoRow
                    label={isEnglish ? "Legal Position" : "Juridische positie"}
                    value={isEnglish ? "Education only" : "Alleen educatie"}
                  />
                </div>

                <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-[#C83888] mt-0.5 shrink-0" />

                    <p className="font-mono text-xs text-black/55 leading-relaxed">
                      {isEnglish
                        ? "No custody. No trading execution. No yield promise. Lessons are for education, wallet safety and XRPL literacy."
                        : "Geen custody. Geen trade-uitvoering. Geen yieldbelofte. Lessen zijn voor educatie, wallet-veiligheid en XRPL-geletterdheid."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            <ViewButton
              active={activeView === "path"}
              label={isEnglish ? "Learning Path" : "Leerpad"}
              onClick={() => setActiveView("path")}
            />
            <ViewButton
              active={activeView === "lessons"}
              label={isEnglish ? "Lesson Room" : "Lesruimte"}
              onClick={() => setActiveView("lessons")}
            />
            <ViewButton
              active={activeView === "quiz"}
              label="Quiz"
              onClick={() => setActiveView("quiz")}
            />
            <ViewButton
              active={activeView === "certificate"}
              label={isEnglish ? "Certificate" : "Certificaat"}
              onClick={() => setActiveView("certificate")}
            />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        {activeView === "path" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel title={isEnglish ? "XRPL Learning Path" : "XRPL Leerpad"} icon={Layers}>
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      language={language}
                      selected={selectedLesson.id === lesson.id}
                      completed={completedLessonIds.includes(lesson.id)}
                      onSelect={() => {
                        setSelectedLessonId(lesson.id);
                        setActiveView("lessons");
                      }}
                      onToggleComplete={() => toggleLessonComplete(lesson.id)}
                    />
                  ))}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel title={isEnglish ? "V1.0 Academy Standard" : "V1.0 Academie Standaard"} icon={GraduationCap}>
                <div className="space-y-3">
                  <StandardLine text={isEnglish ? "Every lesson has a clear learning goal." : "Elke les heeft een helder leerdoel."} />
                  <StandardLine text={isEnglish ? "Each module ends with a task or quiz." : "Elke module eindigt met opdracht of quiz."} />
                  <StandardLine text={isEnglish ? "Progress becomes XP and later proof." : "Voortgang wordt XP en later proof."} />
                  <StandardLine text={isEnglish ? "Free preview + premium path." : "Gratis preview + premium leerpad."} />
                </div>
              </Panel>

              <Panel title={isEnglish ? "Next V1 Build" : "Volgende V1 bouw"} icon={ClipboardCheck}>
                <div className="space-y-3">
                  <RoadmapLine text={isEnglish ? "Add real lesson content pages." : "Echte lescontent pagina's toevoegen."} />
                  <RoadmapLine text={isEnglish ? "Connect premium lessons to Access Gate." : "Premium lessen koppelen aan Access Gate."} />
                  <RoadmapLine text={isEnglish ? "Save progress server-side." : "Voortgang server-side opslaan."} />
                  <RoadmapLine text={isEnglish ? "Generate certificate/proof screen." : "Certificaat/proof scherm genereren."} />
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeView === "lessons" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-4">
              <Panel title={isEnglish ? "Modules" : "Modules"} icon={BookOpen}>
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`w-full border p-4 text-left transition-all ${
                        selectedLesson.id === lesson.id
                          ? "border-[#C83888] bg-[#C83888]/10"
                          : "border-black/10 bg-[#F7F8FC] hover:bg-white"
                      }`}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
                        Module {lesson.module} · {lesson.minutes} min
                      </p>

                      <p className="font-orbitron text-xs font-black uppercase text-black">
                        {isEnglish ? lesson.titleEn : lesson.titleNl}
                      </p>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-8">
              <LessonRoom
                lesson={selectedLesson}
                language={language}
                completed={completedLessonIds.includes(selectedLesson.id)}
                onToggleComplete={() => toggleLessonComplete(selectedLesson.id)}
              />
            </div>
          </div>
        )}

        {activeView === "quiz" && (
          <Panel title={isEnglish ? "Knowledge Check" : "Kennischeck"} icon={Brain}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-8 space-y-4">
                {quizQuestions.map((question) => (
                  <QuizCard
                    key={question.id}
                    question={question}
                    language={language}
                    selectedIndex={quizAnswers[question.id]}
                    onAnswer={(index) =>
                      setQuizAnswers((current) => ({
                        ...current,
                        [question.id]: index,
                      }))
                    }
                  />
                ))}
              </div>

              <div className="col-span-12 xl:col-span-4">
                <div className="border border-black/10 bg-[#F7F8FC] p-6 sticky top-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-4">
                    Quiz Score
                  </p>

                  <p className="font-orbitron text-5xl font-black uppercase mb-4">
                    {quizScore}/{quizQuestions.length}
                  </p>

                  <p className="font-mono text-xs text-black/55 leading-relaxed mb-5">
                    {isEnglish
                      ? "This is the V1 quiz foundation. Next step: save answers server-side and attach proof to course completion."
                      : "Dit is de V1 quiz basis. Volgende stap: antwoorden server-side opslaan en proof koppelen aan cursusafronding."}
                  </p>

                  <button
                    onClick={() => setActiveView("certificate")}
                    className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all"
                  >
                    {isEnglish ? "View Certificate" : "Bekijk Certificaat"}
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {activeView === "certificate" && (
          <Panel title={isEnglish ? "Completion Proof" : "Afronding Proof"} icon={Award}>
            <div className="border border-black/10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,152,232,0.14),transparent_28%),radial-gradient(circle_at_82%_15%,rgba(200,56,136,0.14),transparent_28%),#ffffff] p-6 md:p-10">
              <div className="max-w-3xl mx-auto border border-black/10 bg-white/90 p-6 md:p-10 text-center shadow-xl shadow-black/5">
                <Award size={42} className="mx-auto mb-6 text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-black/35 mb-4">
                  OTT Academy Certificate
                </p>

                <h2 className="font-orbitron text-3xl md:text-5xl font-black uppercase mb-6">
                  {isEnglish ? "XRPL Starter Path" : "XRPL Starter Leerpad"}
                </h2>

                <p className="font-mono text-sm text-black/55 leading-relaxed mb-8">
                  {isEnglish
                    ? "Certificate screen foundation. For V1.0 this becomes a proof-ready completion page with student progress, XP, wallet address and optional XRPL proof."
                    : "Certificaat scherm basis. Voor V1.0 wordt dit een proof-ready afrondingspagina met studentvoortgang, XP, wallet adres en optioneel XRPL proof."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                  <InfoRow label={isEnglish ? "Progress" : "Voortgang"} value={`${progressPercent}%`} />
                  <InfoRow label="XP" value={String(totalXp)} />
                  <InfoRow label="SourceTag" value="2606170002" />
                </div>

                <button
                  disabled={progressPercent < 100}
                  className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-6 py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all disabled:opacity-40"
                >
                  {progressPercent >= 100
                    ? isEnglish
                      ? "Generate Proof"
                      : "Genereer Proof"
                    : isEnglish
                      ? "Complete all lessons first"
                      : "Rond eerst alle lessen af"}
                </button>
              </div>
            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function LessonRoom({
  lesson,
  language,
  completed,
  onToggleComplete,
}: {
  lesson: Lesson;
  language: "nl" | "en";
  completed: boolean;
  onToggleComplete: () => void;
}) {
  const isEnglish = language === "en";
  const Icon = lesson.icon;

  return (
    <Panel title={isEnglish ? lesson.titleEn : lesson.titleNl} icon={Icon}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8">
          <div className="border border-black/10 bg-[#F7F8FC] p-5 md:p-6 mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-4">
              {isEnglish ? "Learning Goal" : "Leerdoel"}
            </p>

            <p className="font-mono text-sm text-black/60 leading-relaxed">
              {isEnglish ? lesson.goalEn : lesson.goalNl}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-5 md:p-6 mb-4">
            <div className="flex items-start gap-4 mb-5">
              <PlayCircle size={24} className="text-[#3898E8] shrink-0" />

              <div>
                <p className="font-orbitron text-lg font-black uppercase mb-2">
                  {isEnglish ? "Lesson Structure" : "Lesstructuur"}
                </p>

                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {isEnglish
                    ? "This is the V1 LOI-style lesson template: clear goal, short explanation, practical task, knowledge check and proof-ready completion."
                    : "Dit is de V1 LOI-achtige lestemplate: helder leerdoel, korte uitleg, praktijkopdracht, kennischeck en proof-ready afronding."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TemplateBlock title={isEnglish ? "1. Explain" : "1. Uitleg"} text={isEnglish ? "Short focused theory." : "Korte gerichte theorie."} />
              <TemplateBlock title={isEnglish ? "2. Practice" : "2. Oefenen"} text={isEnglish ? "Do a wallet/proof task." : "Doe een wallet/proof opdracht."} />
              <TemplateBlock title={isEnglish ? "3. Check" : "3. Check"} text={isEnglish ? "Answer quiz questions." : "Beantwoord quizvragen."} />
              <TemplateBlock title={isEnglish ? "4. Prove" : "4. Bewijs"} text={isEnglish ? "Save progress and XP." : "Sla voortgang en XP op."} />
            </div>
          </div>

          <button
            onClick={onToggleComplete}
            className={`w-full p-5 text-left border transition-all ${
              completed
                ? "border-[#3898E8]/25 bg-[#3898E8]/10"
                : "border-black/10 bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-orbitron text-sm font-black uppercase mb-2">
                  {completed
                    ? isEnglish
                      ? "Lesson Completed"
                      : "Les Afgerond"
                    : isEnglish
                      ? "Mark Lesson Complete"
                      : "Markeer Les Als Afgerond"}
                </p>

                <p className={`font-mono text-xs uppercase tracking-widest ${completed ? "text-black/45" : "text-white/75"}`}>
                  +{lesson.xp} XP
                </p>
              </div>

              <CheckCircle2 size={24} className={completed ? "text-[#3898E8]" : "text-white"} />
            </div>
          </button>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="border border-black/10 bg-[#F7F8FC] p-5 sticky top-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-4">
              {isEnglish ? "Module Data" : "Moduledata"}
            </p>

            <div className="space-y-3">
              <InfoRow label="Module" value={lesson.module} />
              <InfoRow label={isEnglish ? "Duration" : "Duur"} value={`${lesson.minutes} min`} />
              <InfoRow label="XP" value={String(lesson.xp)} />
              <InfoRow label={isEnglish ? "Access" : "Toegang"} value={lesson.status === "free" ? "Free" : "Premium"} />
            </div>

            {lesson.status === "premium" && (
              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                <div className="flex items-start gap-3">
                  <Lock size={16} className="text-[#C83888] mt-0.5 shrink-0" />

                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {isEnglish
                      ? "Premium lesson. V1 next step: connect this to Access Gate and NFT/pass status."
                      : "Premium les. V1 volgende stap: koppelen aan Access Gate en NFT/pass status."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function LessonRow({
  lesson,
  language,
  selected,
  completed,
  onSelect,
  onToggleComplete,
}: {
  lesson: Lesson;
  language: "nl" | "en";
  selected: boolean;
  completed: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
}) {
  const isEnglish = language === "en";
  const Icon = lesson.icon;

  return (
    <div
      className={`border p-4 md:p-5 transition-all ${
        selected
          ? "border-[#C83888] bg-[#C83888]/10"
          : "border-black/10 bg-[#F7F8FC]"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-12 h-12 border border-black/10 bg-white flex items-center justify-center shrink-0">
          <Icon size={20} className={lesson.status === "free" ? "text-[#3898E8]" : "text-[#C83888]"} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
            Module {lesson.module} · {lesson.minutes} min · {lesson.status === "free" ? "Free" : "Premium"}
          </p>

          <p className="font-orbitron text-sm font-black uppercase text-black mb-2">
            {isEnglish ? lesson.titleEn : lesson.titleNl}
          </p>

          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {isEnglish ? lesson.goalEn : lesson.goalNl}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleComplete}
            className={`border px-3 py-3 transition-all ${
              completed
                ? "border-[#3898E8]/25 bg-[#3898E8]/10 text-[#3898E8]"
                : "border-black/10 bg-white text-black/40 hover:text-black"
            }`}
          >
            <CheckCircle2 size={17} />
          </button>

          <button
            onClick={onSelect}
            className="border border-black/10 bg-white px-4 py-3 hover:bg-[#F7F8FC] transition-all flex items-center gap-2"
          >
            <span className="font-orbitron text-[10px] font-black uppercase">
              {isEnglish ? "Open" : "Open"}
            </span>

            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizCard({
  question,
  language,
  selectedIndex,
  onAnswer,
}: {
  question: QuizQuestion;
  language: "nl" | "en";
  selectedIndex?: number;
  onAnswer: (index: number) => void;
}) {
  const isEnglish = language === "en";
  const answers = isEnglish ? question.answersEn : question.answersNl;
  const isAnswered = typeof selectedIndex === "number";

  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
      <p className="font-orbitron text-sm font-black uppercase text-black mb-5">
        {isEnglish ? question.questionEn : question.questionNl}
      </p>

      <div className="space-y-3">
        {answers.map((answer, index) => {
          const selected = selectedIndex === index;
          const correct = question.correctIndex === index;

          return (
            <button
              key={answer}
              onClick={() => onAnswer(index)}
              className={`w-full border p-4 text-left transition-all ${
                selected
                  ? correct
                    ? "border-[#3898E8]/25 bg-[#3898E8]/10"
                    : "border-[#D84858]/25 bg-[#D84858]/10"
                  : "border-black/10 bg-[#F7F8FC] hover:bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-orbitron text-xs font-black text-black/35">
                  {String.fromCharCode(65 + index)}
                </span>

                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  {answer}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-4">
          <p className="font-mono text-xs text-black/45">
            {selectedIndex === question.correctIndex
              ? isEnglish
                ? "Correct. Progress can become XP/proof in V1."
                : "Correct. Voortgang kan in V1 XP/proof worden."
              : isEnglish
                ? "Not correct yet. Review the lesson and try again."
                : "Nog niet correct. Bekijk de les en probeer opnieuw."}
          </p>
        </div>
      )}
    </div>
  );
}

function ViewButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 border font-orbitron text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white border-transparent"
          : "bg-white text-black/50 border-black/10 hover:text-black hover:bg-[#F7F8FC]"
      }`}
    >
      {label}
    </button>
  );
}

function MetricCard({
  label,
  value,
  text,
  icon: Icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
}) {
  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xl font-black uppercase mb-1 break-all">
        {value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">{text}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />

        <p className="font-orbitron text-xs uppercase tracking-widest">
          {title}
        </p>
      </div>

      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function StandardLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <CheckCircle2 size={14} className="text-[#3898E8] shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function RoadmapLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <ClipboardCheck size={14} className="text-[#C83888] shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function TemplateBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {title}
      </p>

      <p className="font-mono text-xs text-black/50 leading-relaxed">{text}</p>
    </div>
  );
}

function readProgress() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeProgress(value: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(progressStorageKey, JSON.stringify(value));
}
