export type IssuerAuditHolder = {
  account: string;
  balance: string;
  limit: string | null;
  freeze: boolean;
  authorized: boolean | null;
};

export type IssuerAuditTransaction = {
  hash: string;
  type: string;
  result: string;
  ledgerIndex: number | null;
  date: string | null;
  account: string | null;
  destination: string | null;
};

export type IssuerAuditResponse = {
  ok: boolean;
  checkedAt: string;
  ledgerIndex: number | null;
  issuer: string;
  currency: string;
  account: {
    balanceXrp: string;
    ownerCount: number;
    sequence: number;
    domain: string | null;
    regularKey: string | null;
    flags: Record<string, boolean>;
  };
  blackhole: {
    disableMaster: boolean;
    regularKeyIsKnownBlackhole: boolean;
    noSignerList: boolean;
    noDelegates: boolean;
    accountObjectsComplete: boolean;
    conditionsMet: boolean;
    status: "conditions-met" | "not-established" | "incomplete";
    explanation: string;
  };
  token: {
    obligation: string | null;
    holderCount: number;
    trustlineCount: number;
    holderScanComplete: boolean;
    topHolders: IssuerAuditHolder[];
  };
  liquidity: {
    orderBook: {
      askCount: number;
      bidCount: number;
      bestAskXrp: number | null;
      bestBidXrp: number | null;
      spreadPercent: number | null;
      askTokenDepth: number;
      bidTokenDepth: number;
    };
    amm: {
      exists: boolean;
      account: string | null;
      xrpAmount: string | null;
      tokenAmount: string | null;
      tradingFee: number | null;
      error: string | null;
    };
  };
  recentTransactions: IssuerAuditTransaction[];
  sourceStatus: {
    gatewayBalances: string;
    accountLines: string;
    accountObjects: string;
    orderBooks: string;
    amm: string;
    accountTransactions: string;
  };
  limitations: string[];
  error?: string;
};

export async function auditXrplIssuer(issuer: string, currency: string) {
  const response = await fetch("/api/ott", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "xrpl.auditIssuer",
      issuer,
      currency,
    }),
  });

  let data: IssuerAuditResponse;
  try {
    data = await response.json() as IssuerAuditResponse;
  } catch {
    throw new Error(`Issuer audit response could not be read (${response.status}).`);
  }

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Issuer audit failed.");
  }

  return data;
}
