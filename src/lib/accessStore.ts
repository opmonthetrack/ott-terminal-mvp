import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

export type AccessRouteId = "banxa-fiat" | "xrp-payment" | "rlusd-payment" | "ott-access-pass";

export type AccessRouteType = "external-fiat" | "xrp" | "rlusd" | "nft";

export type AccessStatus =
  | "locked"
  | "route-selected"
  | "payload-created"
  | "verified"
  | "expired";

export type AccessRoute = {
  id: AccessRouteId;
  type: AccessRouteType;
  title: string;
  label: string;
  targetEuroValue: number;
  demoAmountDrops?: string;
  description: string;
  userExplanation: string[];
  riskNotes: string[];
  proofMemo: string;
  ctaLabel: string;
};

export type AccessEvent = {
  id: string;
  routeId: AccessRouteId;
  status: AccessStatus;
  sourceTag: number;
  txHash?: string | null;
  note: string;
  createdAt: string;
};

export type AccessState = {
  walletAddress: string;
  status: AccessStatus;
  selectedRouteId: AccessRouteId | null;
  sourceTag: number;
  verifiedTxHash: string | null;
  unlockedAt: string | null;
  expiresAt: string | null;
  events: AccessEvent[];
  updatedAt: string;
};

const ACCESS_STORE_KEY = "ott-terminal-access-store-v1";

export const ACCESS_SOURCE_TAG = MAKE_WAVES_SOURCE_TAG;

export const ACCESS_ROUTES: AccessRoute[] = [
  {
    id: "banxa-fiat",
    type: "external-fiat",
    title: "Fiat Access via Banxa",
    label: "€3 fiat route",
    targetEuroValue: 3,
    description:
      "Education-first fiat access route. Banxa handles the external fiat/onramp flow; OTT Terminal does not process fiat payments.",
    userExplanation: [
      "Use this route if you do not have XRP yet.",
      "Banxa is the external provider for fiat/onramp flow.",
      "Fees, KYC, limits and availability are handled by the official provider.",
      "Return to OTT Terminal after the external flow if access verification is needed.",
    ],
    riskNotes: [
      "OTT Terminal does not process fiat payments.",
      "Provider fees and KYC may apply.",
      "Access should be treated as app access, not investment.",
    ],
    proofMemo: "OTT_ACCESS_BANXA_FIAT_ROUTE",
    ctaLabel: "Open Banxa Route",
  },
  {
    id: "xrp-payment",
    type: "xrp",
    title: "XRP Access Payment",
    label: "€3 value in XRP",
    targetEuroValue: 3,
    demoAmountDrops: "3000000",
    description:
      "Demo access payment using XRP through Xaman. Later this should be converted from live EUR value to XRP value.",
    userExplanation: [
      "Create a Xaman XRP payment payload.",
      "Payment uses SourceTag 2606170002 for access proof.",
      "After tx hash verification, access is unlocked.",
      "Demo amount is currently 3 XRP until live EUR conversion is connected.",
    ],
    riskNotes: [
      "Demo pricing is not live EUR conversion yet.",
      "XRP price changes over time.",
      "This is access/payment utility, not investment.",
    ],
    proofMemo: "OTT_ACCESS_XRP_PAYMENT",
    ctaLabel: "Create XRP Access Payload",
  },
  {
    id: "rlusd-payment",
    type: "rlusd",
    title: "RLUSD Access Payment",
    label: "€3 value in RLUSD",
    targetEuroValue: 3,
    description:
      "Stable-value access route concept using RLUSD. This needs issued-currency payment verification before production.",
    userExplanation: [
      "Choose this route if you prefer stable-value payment.",
      "The payment should be verified as an issued-currency transaction.",
      "SourceTag 2606170002 links the access proof to OTT Terminal.",
      "Production requires correct RLUSD issuer and compliance checks.",
    ],
    riskNotes: [
      "RLUSD issuer must be verified.",
      "Issued-currency payments are different from XRP drops.",
      "OTT Terminal should not custody or exchange assets.",
    ],
    proofMemo: "OTT_ACCESS_RLUSD_PAYMENT",
    ctaLabel: "Prepare RLUSD Access",
  },
  {
    id: "ott-access-pass",
    type: "nft",
    title: "OTT Access Pass NFT",
    label: "€2 NFT access pass",
    targetEuroValue: 2,
    demoAmountDrops: "2000000",
    description:
      "NFT access pass concept. The NFT is an access credential, not an investment product or value promise.",
    userExplanation: [
      "Buy or hold an OTT Access Pass NFT to unlock the terminal.",
      "The NFT represents access only.",
      "No token price, resale value or yield is promised.",
      "Future NFT verification can check ownership before access unlock.",
    ],
    riskNotes: [
      "NFT access pass is not an investment.",
      "Do not promise resale value.",
      "Future burn/expiry flows need clear confirmations.",
    ],
    proofMemo: "OTT_ACCESS_PASS_NFT",
    ctaLabel: "Prepare Access Pass",
  },
];

function nowIso() {
  return new Date().toISOString();
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `access-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hasLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function getAllStates(): Record<string, AccessState> {
  if (!hasLocalStorage()) {
    return {};
  }

  const raw = window.localStorage.getItem(ACCESS_STORE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, AccessState>;
  } catch {
    return {};
  }
}

function saveAllStates(states: Record<string, AccessState>) {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_STORE_KEY, JSON.stringify(states));
}

export function createEmptyAccessState(walletAddress: string): AccessState {
  return {
    walletAddress,
    status: "locked",
    selectedRouteId: null,
    sourceTag: ACCESS_SOURCE_TAG,
    verifiedTxHash: null,
    unlockedAt: null,
    expiresAt: null,
    events: [],
    updatedAt: nowIso(),
  };
}

export function loadAccessState(walletAddress: string): AccessState {
  const cleanWallet = walletAddress.trim() || "guest";
  const states = getAllStates();

  return states[cleanWallet] ?? createEmptyAccessState(cleanWallet);
}

export function saveAccessState(state: AccessState) {
  const states = getAllStates();

  states[state.walletAddress] = {
    ...state,
    sourceTag: ACCESS_SOURCE_TAG,
    updatedAt: nowIso(),
  };

  saveAllStates(states);

  return states[state.walletAddress];
}

export function getAccessRoute(routeId: AccessRouteId | null) {
  if (!routeId) {
    return null;
  }

  return ACCESS_ROUTES.find((route) => route.id === routeId) ?? null;
}

export function selectAccessRoute(
  walletAddress: string,
  routeId: AccessRouteId
): AccessState {
  const current = loadAccessState(walletAddress);
  const route = getAccessRoute(routeId);

  const event: AccessEvent = {
    id: createEventId(),
    routeId,
    status: "route-selected",
    sourceTag: ACCESS_SOURCE_TAG,
    txHash: null,
    note: route
      ? `${route.title} selected for terminal access.`
      : "Access route selected.",
    createdAt: nowIso(),
  };

  return saveAccessState({
    ...current,
    selectedRouteId: routeId,
    status: "route-selected",
    events: [event, ...current.events],
  });
}

export function markAccessPayloadCreated(
  walletAddress: string,
  routeId: AccessRouteId,
  note?: string
): AccessState {
  const current = loadAccessState(walletAddress);

  const event: AccessEvent = {
    id: createEventId(),
    routeId,
    status: "payload-created",
    sourceTag: ACCESS_SOURCE_TAG,
    txHash: null,
    note: note ?? "Access payment payload created.",
    createdAt: nowIso(),
  };

  return saveAccessState({
    ...current,
    selectedRouteId: routeId,
    status: "payload-created",
    events: [event, ...current.events],
  });
}

export function markAccessVerified({
  walletAddress,
  routeId,
  txHash,
  durationDays = 30,
  note,
}: {
  walletAddress: string;
  routeId: AccessRouteId;
  txHash?: string | null;
  durationDays?: number;
  note?: string;
}): AccessState {
  const current = loadAccessState(walletAddress);
  const unlockedAt = new Date();
  const expiresAt = new Date(unlockedAt);
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  const event: AccessEvent = {
    id: createEventId(),
    routeId,
    status: "verified",
    sourceTag: ACCESS_SOURCE_TAG,
    txHash: txHash ?? null,
    note:
      note ??
      `Terminal access verified with SourceTag ${ACCESS_SOURCE_TAG}.`,
    createdAt: unlockedAt.toISOString(),
  };

  return saveAccessState({
    ...current,
    selectedRouteId: routeId,
    status: "verified",
    verifiedTxHash: txHash ?? null,
    unlockedAt: unlockedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    events: [event, ...current.events],
  });
}

export function clearAccessState(walletAddress: string): AccessState {
  const states = getAllStates();
  const emptyState = createEmptyAccessState(walletAddress);

  states[walletAddress] = emptyState;
  saveAllStates(states);

  return emptyState;
}

export function isAccessVerified(state: AccessState) {
  if (state.status !== "verified") {
    return false;
  }

  if (!state.expiresAt) {
    return true;
  }

  return new Date(state.expiresAt).getTime() > Date.now();
}

export function getAccessSummary(state: AccessState) {
  const selectedRoute = getAccessRoute(state.selectedRouteId);

  return {
    walletAddress: state.walletAddress,
    status: isAccessVerified(state) ? "verified" : state.status,
    selectedRoute,
    sourceTag: ACCESS_SOURCE_TAG,
    verifiedTxHash: state.verifiedTxHash,
    unlockedAt: state.unlockedAt,
    expiresAt: state.expiresAt,
    eventCount: state.events.length,
    lastEvent: state.events[0] ?? null,
  };
}
