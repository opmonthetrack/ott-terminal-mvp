export const MAKE_WAVES_SOURCE_TAG = 2606170002;

export type MakeWavesActionId =
  | "daily-checkin"
  | "source-tag-proof"
  | "wallet-safety"
  | "academy-lesson"
  | "xrpl-verify"
  | "roadmap-vote"
  | "ott-token-eligibility";

export type MakeWavesAction = {
  id: MakeWavesActionId;
  title: string;
  xp: number;
  memo: string;
  description: string;
};

export const MAKE_WAVES_DAILY_CHECKIN_MEMO =
  "OTT Make Waves Daily Check-In";

export const MAKE_WAVES_ACTIONS: MakeWavesAction[] = [
  {
    id: "daily-checkin",
    title: "Daily Check-In",
    xp: 10,
    memo: MAKE_WAVES_DAILY_CHECKIN_MEMO,
    description: "Daily activity proof for the XRPL OnTheTrack Terminal.",
  },
  {
    id: "source-tag-proof",
    title: "SourceTag Proof",
    xp: 15,
    memo: "OTT Make Waves SourceTag Proof",
    description:
      "Proof that a payload or transaction uses the Make Waves SourceTag.",
  },
  {
    id: "wallet-safety",
    title: "Wallet Safety",
    xp: 15,
    memo: "OTT Make Waves Wallet Safety",
    description: "User completed wallet safety awareness flow.",
  },
  {
    id: "academy-lesson",
    title: "Academy Lesson",
    xp: 20,
    memo: "OTT Make Waves Academy Lesson",
    description: "User completed a learning action inside the terminal.",
  },
  {
    id: "xrpl-verify",
    title: "XRPL Verify",
    xp: 25,
    memo: "OTT Make Waves XRPL Verify",
    description:
      "User verified a live XRPL transaction with the correct SourceTag.",
  },
  {
    id: "roadmap-vote",
    title: "Roadmap Vote",
    xp: 0,
    memo: "OTT Make Waves Roadmap Vote",
    description: "Access Pass holder voted for the next public roadmap phase.",
  },
  {
    id: "ott-token-eligibility",
    title: "OTT Token Eligibility",
    xp: 0,
    memo: "OTT Token Reward Eligibility",
    description:
      "Legal-gated eligibility marker for future OTT token rewards.",
  },
];

export function getMakeWavesAction(actionId: MakeWavesActionId) {
  return (
    MAKE_WAVES_ACTIONS.find((action) => action.id === actionId) ??
    MAKE_WAVES_ACTIONS[0]
  );
}

export function getMakeWavesMemo(actionId: MakeWavesActionId) {
  return getMakeWavesAction(actionId).memo;
}

export function getMakeWavesXp(actionId: MakeWavesActionId) {
  return getMakeWavesAction(actionId).xp;
}

export function isMakeWavesSourceTag(
  sourceTag: number | null | undefined,
) {
  return sourceTag === MAKE_WAVES_SOURCE_TAG;
}

export function buildMakeWavesStatusLine(
  actionId: MakeWavesActionId,
) {
  const action = getMakeWavesAction(actionId);

  return `${action.title} • SourceTag ${MAKE_WAVES_SOURCE_TAG} • +${action.xp} XP`;
}

export function buildMakeWavesMemoData(
  actionId: MakeWavesActionId,
) {
  const action = getMakeWavesAction(actionId);

  return {
    memo: action.memo,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    xp: action.xp,
    title: action.title,
  };
}
