export const MAKE_WAVES_SOURCE_TAG = 2606170002 as const;
export const MAKE_WAVES_SOURCE_TAG_LABEL = "2606170002";
export const MAKE_WAVES_CAMPAIGN = "Make Waves";
export const MAKE_WAVES_PROJECT = "XRPL OnTheTrack Terminal";
export const MAKE_WAVES_MEMO_TYPE = "MakeWaves";
export const MAKE_WAVES_DAILY_CHECKIN_MEMO = "OTT_DAILY_CHECKIN";

export type MakeWavesActionId =
  | "daily-checkin"
  | "source-tag-proof"
  | "academy-lesson"
  | "wallet-safety"
  | "xaman-payload"
  | "demo-action";

export type MakeWavesAction = {
  id: MakeWavesActionId;
  title: string;
  xp: number;
  memo: string;
  description: string;
};

export const MAKE_WAVES_ACTIONS: MakeWavesAction[] = [
  {
    id: "daily-checkin",
    title: "Daily Check-In",
    xp: 10,
    memo: "OTT_DAILY_CHECKIN",
    description: "Daily user activation flow for Make Waves.",
  },
  {
    id: "source-tag-proof",
    title: "Source Tag Proof",
    xp: 26,
    memo: "OTT_SOURCE_TAG_PROOF",
    description: "Proof action linked to Make Waves SourceTag 2606170002.",
  },
  {
    id: "academy-lesson",
    title: "Academy Lesson",
    xp: 15,
    memo: "OTT_ACADEMY_LESSON",
    description: "Learning action inside the XRPL Academy flow.",
  },
  {
    id: "wallet-safety",
    title: "Wallet Safety",
    xp: 15,
    memo: "OTT_WALLET_SAFETY",
    description: "Wallet safety review before real XRPL actions.",
  },
  {
    id: "xaman-payload",
    title: "Xaman Payload",
    xp: 20,
    memo: "OTT_XAMAN_PAYLOAD",
    description: "User-signed Xaman payload with verified SourceTag.",
  },
  {
    id: "demo-action",
    title: "Demo Action",
    xp: 5,
    memo: "OTT_DEMO_ACTION",
    description: "Safe MVP demo action without financial promise.",
  },
];

export function getMakeWavesSourceTag() {
  return MAKE_WAVES_SOURCE_TAG;
}

export function getMakeWavesSourceTagLabel() {
  return MAKE_WAVES_SOURCE_TAG_LABEL;
}

export function isMakeWavesSourceTag(value: unknown) {
  return Number(value) === MAKE_WAVES_SOURCE_TAG;
}

export function findMakeWavesAction(actionId: MakeWavesActionId) {
  return MAKE_WAVES_ACTIONS.find((action) => action.id === actionId) ?? null;
}

export function getMakeWavesMemo(actionId: MakeWavesActionId) {
  return findMakeWavesAction(actionId)?.memo ?? MAKE_WAVES_DAILY_CHECKIN_MEMO;
}

export function getMakeWavesXp(actionId: MakeWavesActionId) {
  return findMakeWavesAction(actionId)?.xp ?? 0;
}

export function buildMakeWavesTransactionMeta(actionId: MakeWavesActionId) {
  const action = findMakeWavesAction(actionId);

  return {
    project: MAKE_WAVES_PROJECT,
    campaign: MAKE_WAVES_CAMPAIGN,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    actionId,
    actionTitle: action?.title ?? "Make Waves Action",
    memo: action?.memo ?? MAKE_WAVES_DAILY_CHECKIN_MEMO,
    xp: action?.xp ?? 0,
  };
}

export function buildMakeWavesStatusLine(actionId: MakeWavesActionId) {
  const action = findMakeWavesAction(actionId);

  if (!action) {
    return `Make Waves SourceTag ${MAKE_WAVES_SOURCE_TAG_LABEL}`;
  }

  return `${action.title} • SourceTag ${MAKE_WAVES_SOURCE_TAG_LABEL} • +${action.xp} XP`;
}
