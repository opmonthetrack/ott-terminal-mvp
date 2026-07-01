import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

export type TruthDeskServiceType = "ask-truth" | "one-on-one";

export type TruthDeskPayloadShape = {
  uuid?: string;
  refs?: {
    qr_png?: string;
    qr_matrix?: string;
    websocket_status?: string;
  };
  next?: {
    always?: string;
    no_push_msg_received?: string;
  };
};

export type CreateTruthDeskPayloadInput = {
  walletAddress?: string;
  destinationWallet?: string;
  serviceType: TruthDeskServiceType;
  question?: string;
  meetingGoal?: string;
  durationMinutes?: 15 | 30 | 45 | 60;
  amountDrops?: string;
};

export type TruthDeskPayloadResponse = {
  ok: boolean;
  mode?: "truth-desk-service-payment";
  sourceTag?: number;
  service?: {
    serviceType: TruthDeskServiceType;
    serviceLabel: string;
    question: string;
    meetingGoal: string;
    durationMinutes: number | null;
  };
  payment?: {
    destinationWallet: string;
    amountDrops: string;
  };
  payload?: TruthDeskPayloadShape;
  transactionMeta?: {
    transactionType: string;
    sourceTag: number;
    memoText: string;
  };
  error?: string;
  details?: unknown;
};

export const ASK_TRUTH_MAX_LENGTH = 200;
export const TRUTH_DESK_SOURCE_TAG = MAKE_WAVES_SOURCE_TAG;

export const TRUTH_DESK_DURATIONS = [
  {
    minutes: 15 as const,
    label: "15 min",
    euroValue: 15,
    text: "Quick focus call",
  },
  {
    minutes: 30 as const,
    label: "30 min",
    euroValue: 30,
    text: "Project feedback",
  },
  {
    minutes: 45 as const,
    label: "45 min",
    euroValue: 45,
    text: "Deep dive",
  },
  {
    minutes: 60 as const,
    label: "60 min",
    euroValue: 60,
    text: "Full session",
  },
];

async function postOtt<TResponse, TBody extends Record<string, unknown>>(
  action: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch("/api/ott", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      ...body,
    }),
  });

  const data = (await response.json()) as TResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function createTruthDeskPayload(
  input: CreateTruthDeskPayloadInput
): Promise<TruthDeskPayloadResponse> {
  return postOtt<TruthDeskPayloadResponse, CreateTruthDeskPayloadInput>(
    "xaman.createTruthDeskPayload",
    input
  );
}

export function getAskTruthAmountDrops() {
  return "1000000";
}

export function getOneOnOneAmountDrops(durationMinutes: 15 | 30 | 45 | 60) {
  return String(durationMinutes * 1000000);
}

export function getTruthDeskPayloadUuid(
  response: TruthDeskPayloadResponse | null
): string | null {
  return response?.payload?.uuid ?? null;
}

export function getTruthDeskPayloadUrl(
  response: TruthDeskPayloadResponse | null
): string | null {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}

export function getTruthDeskPayloadQr(
  response: TruthDeskPayloadResponse | null
): string | null {
  return response?.payload?.refs?.qr_png ?? null;
}

export function openTruthDeskPayload(response: TruthDeskPayloadResponse | null) {
  const url = getTruthDeskPayloadUrl(response);

  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function isTruthDeskPayloadReady(
  response: TruthDeskPayloadResponse | null
) {
  return Boolean(
    response?.ok &&
      response.sourceTag === MAKE_WAVES_SOURCE_TAG &&
      response.payload?.uuid
  );
}

export function getTruthDeskStatusLabel(
  response: TruthDeskPayloadResponse | null
) {
  if (!response?.payload?.uuid) {
    return "No Truth Desk payload created yet";
  }

  if (response.sourceTag === MAKE_WAVES_SOURCE_TAG) {
    return `Truth Desk payload ready with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  return `Truth Desk payload created, but SourceTag should be ${MAKE_WAVES_SOURCE_TAG}`;
}

export function getTruthDeskErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error?: unknown };

    if (typeof apiError.error === "string") {
      return apiError.error;
    }
  }

  return "Unknown Truth Desk error.";
}

export function getQuestionCharactersLeft(question: string) {
  return Math.max(0, ASK_TRUTH_MAX_LENGTH - question.length);
}
