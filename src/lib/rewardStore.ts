import {
  MAKE_WAVES_ACTIONS,
  MAKE_WAVES_SOURCE_TAG,
  getMakeWavesAction,
  type MakeWavesActionId,
} from "./makeWaves";

export type RewardEventType =
  | "xp-earned"
  | "ott-token-eligible"
  | "testnet-token-simulated"
  | "mainnet-token-locked"
  | "partner-proof-stamp";

export type RewardEvent = {
  id: string;
  walletAddress: string;
  actionId: MakeWavesActionId | string;
  type: RewardEventType;
  xp: number;
  ottCredits: number;
  ottTokenEligible: boolean;
  sourceTag: number;
  txHash?: string | null;
  note: string;
  createdAt: string;
};

export type RewardState = {
  walletAddress: string;
  totalXp: number;
  ottCredits: number;
  /**
   * Kept for backwards compatibility only.
   * V1 does not promise automatic conversion from XP to a future OTT token.
   */
  ottTokenEligibleXp: number;
  testnetTokenSimulated: number;
  mainnetTokenLocked: boolean;
  sourceTag: number;
  events: RewardEvent[];
  updatedAt: string;
};

export type AddRewardEventInput = {
  walletAddress: string;
  actionId: MakeWavesActionId;
  txHash?: string | null;
  note?: string;
};

export type AddPartnerProofStampInput = {
  walletAddress: string;
  partnerId: string;
  routeName: string;
  xp: number;
  ottCredits?: number;
  txHash?: string | null;
  note?: string;
};

const REWARD_STORE_KEY = "ott-terminal-reward-store-v1";

/**
 * Internal V1 credits policy.
 * This intentionally lives in rewardStore so the working Make Waves/Xaman
 * files do not need to change.
 */
const OTT_CREDITS_BY_ACTION: Partial<Record<MakeWavesActionId, number>> = {
  "daily-checkin": 1,
  "source-tag-proof": 2,
  "wallet-safety": 2,
  "academy-lesson": 3,
  "xrpl-verify": 2,
  "ott-token-eligibility": 0,
};

function hasLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `reward-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function cleanWalletAddress(walletAddress: string) {
  return walletAddress.trim();
}

function cleanTxHash(txHash?: string | null) {
  const cleanHash = txHash?.trim().toUpperCase() ?? "";

  return cleanHash || null;
}

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function normalizeRewardEvent(
  event: Partial<RewardEvent>,
  walletAddress: string,
): RewardEvent {
  return {
    id:
      typeof event.id === "string" && event.id
        ? event.id
        : createEventId(),
    walletAddress:
      typeof event.walletAddress === "string" && event.walletAddress
        ? event.walletAddress
        : walletAddress,
    actionId:
      typeof event.actionId === "string" && event.actionId
        ? event.actionId
        : "daily-checkin",
    type:
      typeof event.type === "string"
        ? (event.type as RewardEventType)
        : "xp-earned",
    xp: toSafeNumber(event.xp),
    ottCredits: toSafeNumber(event.ottCredits),
    ottTokenEligible: Boolean(event.ottTokenEligible),
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash: cleanTxHash(event.txHash),
    note: typeof event.note === "string" ? event.note : "",
    createdAt:
      typeof event.createdAt === "string" && event.createdAt
        ? event.createdAt
        : nowIso(),
  };
}

function normalizeRewardState(
  state: Partial<RewardState> | undefined,
  walletAddress: string,
): RewardState {
  const cleanWallet = cleanWalletAddress(walletAddress);
  const rawEvents = Array.isArray(state?.events) ? state.events : [];
  const events = rawEvents.map((event) =>
    normalizeRewardEvent(event, cleanWallet),
  );

  /*
   * Existing V1 users may already have XP events from before ottCredits existed.
   * We do not retroactively mint credits from old events because that would
   * silently change balances. New verified rewards receive credits.
   */
  return {
    walletAddress: cleanWallet,
    totalXp: toSafeNumber(state?.totalXp),
    ottCredits: toSafeNumber(state?.ottCredits),
    ottTokenEligibleXp: toSafeNumber(state?.ottTokenEligibleXp),
    testnetTokenSimulated: toSafeNumber(state?.testnetTokenSimulated),
    mainnetTokenLocked:
      typeof state?.mainnetTokenLocked === "boolean"
        ? state.mainnetTokenLocked
        : true,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    events,
    updatedAt:
      typeof state?.updatedAt === "string" && state.updatedAt
        ? state.updatedAt
        : nowIso(),
  };
}

function getAllStates(): Record<string, RewardState> {
  if (!hasLocalStorage()) {
    return {};
  }

  const raw = window.localStorage.getItem(REWARD_STORE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<RewardState>>;
    const normalized: Record<string, RewardState> = {};

    Object.entries(parsed).forEach(([walletAddress, state]) => {
      const cleanWallet = cleanWalletAddress(walletAddress);

      if (!cleanWallet) {
        return;
      }

      normalized[cleanWallet] = normalizeRewardState(state, cleanWallet);
    });

    return normalized;
  } catch {
    return {};
  }
}

function saveAllStates(states: Record<string, RewardState>) {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(REWARD_STORE_KEY, JSON.stringify(states));
}

function hasDuplicateEvent(
  state: RewardState,
  input: {
    type: RewardEventType;
    actionId: string;
    txHash?: string | null;
  },
) {
  const txHash = cleanTxHash(input.txHash);

  if (!txHash) {
    return false;
  }

  return state.events.some(
    (event) =>
      event.type === input.type &&
      event.actionId === input.actionId &&
      cleanTxHash(event.txHash) === txHash,
  );
}

export function getOttCreditsForAction(actionId: MakeWavesActionId) {
  return OTT_CREDITS_BY_ACTION[actionId] ?? 0;
}

export function createEmptyRewardState(walletAddress: string): RewardState {
  return {
    walletAddress: cleanWalletAddress(walletAddress),
    totalXp: 0,
    ottCredits: 0,
    ottTokenEligibleXp: 0,
    testnetTokenSimulated: 0,
    mainnetTokenLocked: true,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    events: [],
    updatedAt: nowIso(),
  };
}

export function loadRewardState(walletAddress: string): RewardState {
  const cleanWallet = cleanWalletAddress(walletAddress);
  const states = getAllStates();

  return normalizeRewardState(states[cleanWallet], cleanWallet);
}

export function saveRewardState(state: RewardState) {
  const cleanWallet = cleanWalletAddress(state.walletAddress);
  const states = getAllStates();
  const normalizedState = normalizeRewardState(
    {
      ...state,
      walletAddress: cleanWallet,
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      updatedAt: nowIso(),
    },
    cleanWallet,
  );

  states[cleanWallet] = normalizedState;
  saveAllStates(states);

  return normalizedState;
}

export function addXpRewardEvent(input: AddRewardEventInput): RewardState {
  const cleanWallet = cleanWalletAddress(input.walletAddress);
  const txHash = cleanTxHash(input.txHash);
  const action = getMakeWavesAction(input.actionId);
  const current = loadRewardState(cleanWallet);

  if (
    hasDuplicateEvent(current, {
      type: "xp-earned",
      actionId: input.actionId,
      txHash,
    })
  ) {
    return current;
  }

  const ottCredits = getOttCreditsForAction(input.actionId);

  const event: RewardEvent = {
    id: createEventId(),
    walletAddress: cleanWallet,
    actionId: input.actionId,
    type: "xp-earned",
    xp: action.xp,
    ottCredits,
    /*
     * Credits are usable inside OTT Terminal.
     * They are not automatic eligibility for a future tradable token.
     */
    ottTokenEligible: false,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash,
    note:
      input.note ??
      `${action.title} verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}. +${action.xp} XP and +${ottCredits} OTT Credits.`,
    createdAt: nowIso(),
  };

  return saveRewardState({
    ...current,
    totalXp: current.totalXp + event.xp,
    ottCredits: current.ottCredits + event.ottCredits,
    mainnetTokenLocked: true,
    events: [event, ...current.events],
  });
}

export function addPartnerProofStampReward(
  input: AddPartnerProofStampInput,
): RewardState {
  const cleanWallet = cleanWalletAddress(input.walletAddress);
  const txHash = cleanTxHash(input.txHash);
  const actionId = `partner-${input.partnerId}`;
  const current = loadRewardState(cleanWallet);

  if (
    hasDuplicateEvent(current, {
      type: "partner-proof-stamp",
      actionId,
      txHash,
    })
  ) {
    return current;
  }

  const ottCredits = Math.max(0, input.ottCredits ?? 0);

  const event: RewardEvent = {
    id: createEventId(),
    walletAddress: cleanWallet,
    actionId,
    type: "partner-proof-stamp",
    xp: Math.max(0, input.xp),
    ottCredits,
    ottTokenEligible: false,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash,
    note:
      input.note ??
      `${input.routeName} Proof Stamp verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    createdAt: nowIso(),
  };

  return saveRewardState({
    ...current,
    totalXp: current.totalXp + event.xp,
    ottCredits: current.ottCredits + event.ottCredits,
    mainnetTokenLocked: true,
    events: [event, ...current.events],
  });
}

export function addMainnetLockedEvent(
  input: AddRewardEventInput,
): RewardState {
  const cleanWallet = cleanWalletAddress(input.walletAddress);
  const txHash = cleanTxHash(input.txHash);
  const current = loadRewardState(cleanWallet);

  if (
    hasDuplicateEvent(current, {
      type: "mainnet-token-locked",
      actionId: input.actionId,
      txHash,
    })
  ) {
    return current;
  }

  const event: RewardEvent = {
    id: createEventId(),
    walletAddress: cleanWallet,
    actionId: input.actionId,
    type: "mainnet-token-locked",
    xp: 0,
    ottCredits: 0,
    ottTokenEligible: false,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash,
    note:
      input.note ??
      "Future on-chain OTT token remains inactive until legal and business review.",
    createdAt: nowIso(),
  };

  return saveRewardState({
    ...current,
    mainnetTokenLocked: true,
    events: [event, ...current.events],
  });
}

export function addTestnetTokenSimulation(
  input: AddRewardEventInput,
): RewardState {
  const cleanWallet = cleanWalletAddress(input.walletAddress);
  const txHash = cleanTxHash(input.txHash);
  const action = getMakeWavesAction(input.actionId);
  const current = loadRewardState(cleanWallet);

  if (
    hasDuplicateEvent(current, {
      type: "testnet-token-simulated",
      actionId: input.actionId,
      txHash,
    })
  ) {
    return current;
  }

  const event: RewardEvent = {
    id: createEventId(),
    walletAddress: cleanWallet,
    actionId: input.actionId,
    type: "testnet-token-simulated",
    xp: action.xp,
    ottCredits: 0,
    ottTokenEligible: false,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash,
    note:
      input.note ??
      `${action.title} simulated as an OTT testnet token reward.`,
    createdAt: nowIso(),
  };

  return saveRewardState({
    ...current,
    testnetTokenSimulated:
      current.testnetTokenSimulated + action.xp,
    events: [event, ...current.events],
  });
}

export function hasProcessedReward(
  walletAddress: string,
  actionId: string,
  txHash: string,
) {
  const state = loadRewardState(walletAddress);
  const cleanHash = cleanTxHash(txHash);

  if (!cleanHash) {
    return false;
  }

  return state.events.some(
    (event) =>
      event.actionId === actionId &&
      cleanTxHash(event.txHash) === cleanHash,
  );
}

export function clearRewardState(walletAddress: string): RewardState {
  const cleanWallet = cleanWalletAddress(walletAddress);
  const states = getAllStates();
  const emptyState = createEmptyRewardState(cleanWallet);

  states[cleanWallet] = emptyState;
  saveAllStates(states);

  return emptyState;
}

export function getRewardSummary(state: RewardState) {
  const normalizedState = normalizeRewardState(
    state,
    state.walletAddress,
  );

  const proofStampXp = normalizedState.events
    .filter((event) => event.type === "partner-proof-stamp")
    .reduce((total, event) => total + event.xp, 0);

  const verifiedProofStamps = normalizedState.events.filter(
    (event) => event.type === "partner-proof-stamp",
  ).length;

  return {
    walletAddress: normalizedState.walletAddress,
    totalXp: normalizedState.totalXp,
    ottCredits: normalizedState.ottCredits,
    ottTokenEligibleXp: normalizedState.ottTokenEligibleXp,
    testnetTokenSimulated:
      normalizedState.testnetTokenSimulated,
    mainnetTokenLocked: normalizedState.mainnetTokenLocked,
    proofStampXp,
    verifiedProofStamps,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    eventCount: normalizedState.events.length,
    lastEvent: normalizedState.events[0] ?? null,
  };
}

export function getAvailableRewardActions() {
  return MAKE_WAVES_ACTIONS.map((action) => ({
    id: action.id,
    title: action.title,
    xp: action.xp,
    ottCredits: getOttCreditsForAction(action.id),
    sourceTag: MAKE_WAVES_SOURCE_TAG,
  }));
}
