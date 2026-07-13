export const MAKE_WAVES_SOURCE_TAG = 2606170002 as const;
export const MAKE_WAVES_SOURCE_TAG_LABEL = "2606170002";
export const MAKE_WAVES_CAMPAIGN = "Make Waves";
export const MAKE_WAVES_PROJECT = "XRPL OnTheTrack Terminal";
export const MAKE_WAVES_MEMO_TYPE = "OTT_MAKE_WAVES";

export type MakeWavesActionId =
  | "daily-checkin"
  | "source-tag-proof"
  | "wallet-safety"
  | "academy-lesson"
  | "xrpl-verify"
  | "ott-token-eligibility";

export type MakeWavesAction = {
  id: MakeWavesActionId;
  title: string;
  xp: number;
  ottCredits: number;
  memo: string;
  description: string;
  public: boolean;
};

const MAKE_WAVES_ACTION_REGISTRY: Record<MakeWavesActionId, MakeWavesAction> = {
  "daily-checkin": {
    id: "daily-checkin",
    title: "Daily Check-In",
    xp: 10,
    ottCredits: 1,
    memo: "OTT_MAKE_WAVES | Daily Check-In | SourceTag 2606170002",
    description: "Daily user activation proof on XRPL Mainnet.",
    public: true,
  },
  "source-tag-proof": {
    id: "source-tag-proof",
    title: "SourceTag Proof",
    xp: 15,
    ottCredits: 2,
    memo: "OTT_MAKE_WAVES | SourceTag Proof | SourceTag 2606170002",
    description: "Proof that a successful Mainnet transaction carries the official OTT SourceTag.",
    public: true,
  },
  "wallet-safety": {
    id: "wallet-safety",
    title: "Wallet Safety",
    xp: 20,
    ottCredits: 2,
    memo: "OTT_MAKE_WAVES | Wallet Safety | SourceTag 2606170002",
    description: "Wallet safety learning action completed before a live XRPL action.",
    public: true,
  },
  "academy-lesson": {
    id: "academy-lesson",
    title: "Academy Lesson",
    xp: 25,
    ottCredits: 3,
    memo: "OTT_MAKE_WAVES | Academy Lesson | SourceTag 2606170002",
    description: "Verified Academy learning milestone with an optional Mainnet proof.",
    public: true,
  },
  "xrpl-verify": {
    id: "xrpl-verify",
    title: "XRPL Verify",
    xp: 20,
    ottCredits: 2,
    memo: "OTT_MAKE_WAVES | XRPL Verify | SourceTag 2606170002",
    description: "User verified a live XRPL transaction and its SourceTag.",
    public: true,
  },
  "ott-token-eligibility": {
    id: "ott-token-eligibility",
    title: "Future OTT Token Review",
    xp: 30,
    ottCredits: 0,
    memo: "OTT_MAKE_WAVES | OTT Token Eligibility | SourceTag 2606170002",
    description: "Internal legal-gated marker. Not exposed as a public earning action.",
    public: false,
  },
};

export const MAKE_WAVES_DAILY_CHECKIN_MEMO =
  MAKE_WAVES_ACTION_REGISTRY["daily-checkin"].memo;

/**
 * Only these actions should appear in public V1 user interfaces.
 * Future token eligibility remains hidden until legal and business review.
 */
export const MAKE_WAVES_ACTIONS: MakeWavesAction[] = Object.values(
  MAKE_WAVES_ACTION_REGISTRY,
).filter((action) => action.public);

export function findMakeWavesAction(actionId: MakeWavesActionId) {
  return MAKE_WAVES_ACTION_REGISTRY[actionId] ?? null;
}

export function getMakeWavesAction(actionId: MakeWavesActionId) {
  return (
    MAKE_WAVES_ACTION_REGISTRY[actionId] ??
    MAKE_WAVES_ACTION_REGISTRY["daily-checkin"]
  );
}

export function getMakeWavesMemo(actionId: MakeWavesActionId) {
  return getMakeWavesAction(actionId).memo;
}

export function getMakeWavesXp(actionId: MakeWavesActionId) {
  return getMakeWavesAction(actionId).xp;
}

export function getMakeWavesCredits(actionId: MakeWavesActionId) {
  return getMakeWavesAction(actionId).ottCredits;
}

export function getMakeWavesSourceTag() {
  return MAKE_WAVES_SOURCE_TAG;
}

export function getMakeWavesSourceTagLabel() {
  return MAKE_WAVES_SOURCE_TAG_LABEL;
}

export function isMakeWavesSourceTag(value: unknown) {
  return Number(value) === MAKE_WAVES_SOURCE_TAG;
}

export function buildMakeWavesTransactionMeta(actionId: MakeWavesActionId) {
  const action = getMakeWavesAction(actionId);

  return {
    project: MAKE_WAVES_PROJECT,
    campaign: MAKE_WAVES_CAMPAIGN,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    actionId,
    actionTitle: action.title,
    memo: action.memo,
    memoType: MAKE_WAVES_MEMO_TYPE,
    xp: action.xp,
    ottCredits: action.ottCredits,
  };
}

export function buildMakeWavesStatusLine(actionId: MakeWavesActionId) {
  const action = getMakeWavesAction(actionId);

  return `${action.title} • SourceTag ${MAKE_WAVES_SOURCE_TAG_LABEL} • +${action.xp} XP • +${action.ottCredits} OTT Credits`;
}

export function buildMakeWavesMemoData(actionId: MakeWavesActionId) {
  const action = getMakeWavesAction(actionId);

  return {
    memo: action.memo,
    memoType: MAKE_WAVES_MEMO_TYPE,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    xp: action.xp,
    ottCredits: action.ottCredits,
    title: action.title,
  };
}
