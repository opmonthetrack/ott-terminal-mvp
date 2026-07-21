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

export type AcademyProgressSummary = {
  walletAddress: string;
  completedLessonIds: string[];
  completedCount: number;
  totalXp: number;
  totalCredits: number;
  averageScore: number;
  completions: AcademyModuleCompletion[];
  updatedAt: number;
};

const WALLET_STORAGE_KEY = "ott-academy-wallet-progress-v3";
const ACCOUNT_CACHE_KEY = "ott-academy-account-cache-v1";
const ACTIVE_ACCOUNT_KEY = "ott-academy-active-account-v1";

function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("ott-academy-progress-changed"));
}

function readAllWalletProgress() {
  return readJson<Record<string, AcademyWalletProgress>>(WALLET_STORAGE_KEY, {});
}

function readAllAccountProgress() {
  return readJson<Record<string, AcademyWalletProgress>>(ACCOUNT_CACHE_KEY, {});
}

export function getActiveAcademyAccountId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(ACTIVE_ACCOUNT_KEY)?.trim() ?? "";
}

export function setActiveAcademyAccount(userId: string | null | undefined) {
  if (typeof window === "undefined") {
    return;
  }

  if (userId?.trim()) {
    window.localStorage.setItem(ACTIVE_ACCOUNT_KEY, userId.trim());
  } else {
    window.localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }

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

  const existing = readAllWalletProgress()[walletAddress];
  return existing ?? {
    walletAddress,
    completions: {},
    updatedAt: 0,
  };
}

export function loadAcademyAccountProgress(userId: string) {
  const ownerKey = `account:${userId}`;
  const existing = readAllAccountProgress()[userId];

  return existing ?? {
    walletAddress: ownerKey,
    completions: {},
    updatedAt: 0,
  };
}

export function cacheAcademyAccountCompletions(
  userId: string,
  completions: AcademyModuleCompletion[],
) {
  if (!userId.trim()) {
    throw new Error("A verified OTT account is required to cache Academy progress.");
  }

  const allProgress = readAllAccountProgress();
  const completionMap = completions.reduce<Record<string, AcademyModuleCompletion>>(
    (result, completion) => {
      result[completion.lessonId] = completion;
      return result;
    },
    {},
  );

  allProgress[userId] = {
    walletAddress: `account:${userId}`,
    completions: completionMap,
    updatedAt: Date.now(),
  };
  writeJson(ACCOUNT_CACHE_KEY, allProgress);
  return allProgress[userId];
}

export function cacheAcademyAccountCompletion(
  userId: string,
  completion: AcademyModuleCompletion,
) {
  if (!completion.assessments.length || completion.assessments.some((item) => !item.passed)) {
    throw new Error("Every Academy task must pass before completion can be stored.");
  }

  const current = loadAcademyAccountProgress(userId);
  const existing = current.completions[completion.lessonId];
  const selected = !existing || completion.overallScore > existing.overallScore
    ? completion
    : existing;

  return cacheAcademyAccountCompletions(userId, [
    ...Object.values(current.completions).filter((item) => item.lessonId !== completion.lessonId),
    selected,
  ]);
}

export function saveAcademyModuleCompletion(completion: AcademyModuleCompletion) {
  if (!isLikelyXrplAddress(completion.walletAddress)) {
    throw new Error("A verified XRPL wallet session is required to save legacy Academy progress.");
  }

  if (!completion.assessments.length || completion.assessments.some((item) => !item.passed)) {
    throw new Error("Every Academy task must pass before completion can be stored.");
  }

  const allProgress = readAllWalletProgress();
  const current = loadAcademyWalletProgress(completion.walletAddress);
  const existing = current.completions[completion.lessonId];
  const selected = !existing || completion.overallScore > existing.overallScore
    ? completion
    : existing;

  const next: AcademyWalletProgress = {
    walletAddress: completion.walletAddress,
    completions: {
      ...current.completions,
      [completion.lessonId]: selected,
    },
    updatedAt: Date.now(),
  };

  allProgress[completion.walletAddress] = next;
  writeJson(WALLET_STORAGE_KEY, allProgress);
  return next;
}

export function summarizeAcademyCompletions(
  ownerKey: string,
  completions: AcademyModuleCompletion[],
  updatedAt = 0,
): AcademyProgressSummary {
  const ordered = [...completions].sort((left, right) => right.completedAt - left.completedAt);

  return {
    walletAddress: ownerKey,
    completedLessonIds: ordered.map((item) => item.lessonId),
    completedCount: ordered.length,
    totalXp: ordered.reduce((sum, item) => sum + item.xp, 0),
    totalCredits: ordered.reduce((sum, item) => sum + item.credits, 0),
    averageScore:
      ordered.length > 0
        ? Math.round(
            ordered.reduce((sum, item) => sum + item.overallScore, 0) / ordered.length,
          )
        : 0,
    completions: ordered,
    updatedAt,
  };
}

export function getAcademyWalletProgressSummary(walletAddress: string) {
  const progress = loadAcademyWalletProgress(walletAddress);
  return summarizeAcademyCompletions(
    walletAddress,
    Object.values(progress.completions),
    progress.updatedAt,
  );
}

export function getAcademyProgressSummary(walletAddress: string) {
  const activeAccountId = getActiveAcademyAccountId();

  if (activeAccountId) {
    const progress = loadAcademyAccountProgress(activeAccountId);
    return summarizeAcademyCompletions(
      progress.walletAddress,
      Object.values(progress.completions),
      progress.updatedAt,
    );
  }

  return getAcademyWalletProgressSummary(walletAddress);
}
