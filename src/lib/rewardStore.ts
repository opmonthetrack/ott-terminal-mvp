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
  | "mainnet-token-locked";

export type RewardEvent = {
  id: string;
  walletAddress: string;
  actionId: MakeWavesActionId;
  type: RewardEventType;
  xp: number;
  ottTokenEligible: boolean;
  sourceTag: number;
  txHash?: string | null;
  note: string;
  createdAt: string;
};

export type RewardState = {
  walletAddress: string;
  totalXp: number;
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

const REWARD_STORE_KEY = "ott-terminal-reward-store-v1";

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

function getAllStates(): Record<string, RewardState> {
  if (!hasLocalStorage()) {
    return {};
  }

  const raw = window.localStorage.getItem(REWARD_STORE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, RewardState>;
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

export function createEmptyRewardState(walletAddress: string): RewardState {
  return {
    walletAddress,
    totalXp: 0,
    ottTokenEligibleXp: 0,
    testnetTokenSimulated: 0,
    mainnetTokenLocked: true,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    events: [],
    updatedAt: nowIso(),
  };
}

export function loadRewardState(walletAddress: string): RewardState {
  const cleanWallet = walletAddress.trim();
  const states = getAllStates();

  return states[cleanWallet] ?? createEmptyRewardState(cleanWallet);
}

export function saveRewardState(state: RewardState) {
  const states = getAllStates();

  states[state.walletAddress] = {
    ...state,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    updatedAt: nowIso(),
  };

  saveAllStates(states);

  return states[state.walletAddress];
}

export function addXpRewardEvent(input: AddRewardEventInput): RewardState {
  const action = getMakeWavesAction(input.actionId);
  const current = loadRewardState(input.walletAddress);

  const event: RewardEvent = {
    id: createEventId(),
    walletAddress: input.walletAddress,
    actionId: input.actionId,
    type: "xp-earned",
    xp: action.xp,
    ottTokenEligible: true,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash: input.txHash ?? null,
    note:
      input.note ??
      `${action.title} verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
    createdAt: nowIso(),
  };

  return saveRewardState({
    ...current,
    totalXp: current.totalXp + event.xp,
    ottTokenEligibleXp: current.ottTokenEligibleXp + event.xp,
    mainnetTokenLocked: true,
    events: [event, ...current.events],
  });
}

export function addMainnetLockedEvent(input: AddRewardEventInput): RewardState {
  const action = getMakeWavesAction(input.actionId);
  const current = loadRewardState(input.walletAddress);

  const event: RewardEvent = {
    id: createEventId(),
    walletAddress: input.walletAddress,
    actionId: input.actionId,
    type: "mainnet-token-locked",
    xp: 0,
    ottTokenEligible: false,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash: input.txHash ?? null,
    note:
      input.note ??
      "Mainnet OTT token reward locked until legal review is complete.",
    createdAt: nowIso(),
  };

  return saveRewardState({
    ...current,
    mainnetTokenLocked: true,
    events: [event, ...current.events],
  });
}

export function addTestnetTokenSimulation(input: AddRewardEventInput): RewardState {
  const action = getMakeWavesAction(input.actionId);
  const current = loadRewardState(input.walletAddress);

  const event: RewardEvent = {
    id: createEventId(),
    walletAddress: input.walletAddress,
    actionId: input.actionId,
    type: "testnet-token-simulated",
    xp: action.xp,
    ottTokenEligible: true,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash: input.txHash ?? null,
    note:
      input.note ??
      `${action.title} simulated as OTT testnet token reward.`,
    createdAt: nowIso(),
  };

  return saveRewardState({
    ...current,
    testnetTokenSimulated: current.testnetTokenSimulated + action.xp,
    events: [event, ...current.events],
  });
}

export function clearRewardState(walletAddress: string) {
  const cleanWallet = walletAddress.trim();
  const states = getAllStates();

  delete states[cleanWallet];
  saveAllStates(states);
}

export function getRewardSummary(state: RewardState) {
  return {
    walletAddress: state.walletAddress,
    totalXp: state.totalXp,
    ottTokenEligibleXp: state.ottTokenEligibleXp,
    testnetTokenSimulated: state.testnetTokenSimulated,
    mainnetTokenLocked: state.mainnetTokenLocked,
    sourceTag: state.sourceTag,
    eventCount: state.events.length,
  };
}

export function getAvailableRewardActions() {
  return MAKE_WAVES_ACTIONS.map((action) => ({
    id: action.id,
    title: action.title,
    xp: action.xp,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
  }));
}
