export type AcademyAnswerAssessment = {
  taskId: string;
  passed: boolean;
  score: number;
  feedback: string;
  missingConcepts: string[];
};

export type AcademyModuleCompletion = {
  lessonId: string;
  lessonTitle: string;
  walletAddress: string;
  completedAt: number;
  xp: number;
  credits: number;
  overallScore: number;
  assessments: AcademyAnswerAssessment[];
  assessmentMode: "ai";
};

export type AcademyWalletProgress = {
  walletAddress: string;
  completions: Record<string, AcademyModuleCompletion>;
  updatedAt: number;
};

const STORAGE_KEY = "ott-academy-wallet-progress-v3";

function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function readAllProgress() {
  if (typeof window === "undefined") {
    return {} as Record<string, AcademyWalletProgress>;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue
      ? (JSON.parse(rawValue) as Record<string, AcademyWalletProgress>)
      : {};
  } catch {
    return {} as Record<string, AcademyWalletProgress>;
  }
}

function writeAllProgress(value: Record<string, AcademyWalletProgress>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("ott-academy-progress-changed"));
}

export function loadAcademyWalletProgress(walletAddress: string) {
  if (!isLikelyXrplAddress(walletAddress)) {
    return {
      walletAddress,
      completions: {},
      updatedAt: 0,
    } satisfies AcademyWalletProgress;
  }

  const allProgress = readAllProgress();
  const existing = allProgress[walletAddress];

  return (
    existing ?? {
      walletAddress,
      completions: {},
      updatedAt: 0,
    }
  );
}

export function saveAcademyModuleCompletion(
  completion: AcademyModuleCompletion,
) {
  if (!isLikelyXrplAddress(completion.walletAddress)) {
    throw new Error("A verified XRPL wallet session is required to save Academy progress.");
  }

  if (!completion.assessments.length || completion.assessments.some((item) => !item.passed)) {
    throw new Error("Every Academy task must pass before completion can be stored.");
  }

  const allProgress = readAllProgress();
  const current = loadAcademyWalletProgress(completion.walletAddress);
  const next: AcademyWalletProgress = {
    walletAddress: completion.walletAddress,
    completions: {
      ...current.completions,
      [completion.lessonId]: completion,
    },
    updatedAt: Date.now(),
  };

  allProgress[completion.walletAddress] = next;
  writeAllProgress(allProgress);

  return next;
}

export function getAcademyProgressSummary(walletAddress: string) {
  const progress = loadAcademyWalletProgress(walletAddress);
  const completions = Object.values(progress.completions).sort(
    (left, right) => right.completedAt - left.completedAt,
  );

  return {
    walletAddress,
    completedLessonIds: completions.map((item) => item.lessonId),
    completedCount: completions.length,
    totalXp: completions.reduce((sum, item) => sum + item.xp, 0),
    totalCredits: completions.reduce((sum, item) => sum + item.credits, 0),
    averageScore:
      completions.length > 0
        ? Math.round(
            completions.reduce((sum, item) => sum + item.overallScore, 0) /
              completions.length,
          )
        : 0,
    completions,
    updatedAt: progress.updatedAt,
  };
}
