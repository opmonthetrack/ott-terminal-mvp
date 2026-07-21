const XRPL_ENDPOINT = "wss://xrplcluster.com/";

const LSF_DISABLE_MASTER = 0x00100000;
const LSF_GLOBAL_FREEZE = 0x00400000;
const LSF_DEFAULT_RIPPLE = 0x00800000;
const LSF_DEPOSIT_AUTH = 0x01000000;

const KNOWN_BLACKHOLE_ADDRESSES = new Set([
  "rrrrrrrrrrrrrrrrrrrrBZbvji",
  "rrrrrrrrrrrrrrrrrrrrrhoLvTp",
  "rrrrrrrrrrrrrrrrrNAMEtxvNvQ",
]);

type XrplEnvelope<T> = {
  id?: number;
  status?: string;
  type?: string;
  result?: T & { error?: string; error_message?: string };
};

type AccountInfoResult = {
  ledger_index?: number;
  account_data?: {
    Account?: string;
    Balance?: string;
    Flags?: number;
    OwnerCount?: number;
    RegularKey?: string;
    Sequence?: number;
    TickSize?: number;
    TransferRate?: number;
    Domain?: string;
  };
};

type AccountLine = {
  account?: string;
  balance?: string;
  currency?: string;
  limit?: string;
  limit_peer?: string;
  no_ripple?: boolean;
  no_ripple_peer?: boolean;
  freeze?: boolean;
  freeze_peer?: boolean;
  authorized?: boolean;
};

type AccountLinesResult = {
  ledger_index?: number;
  lines?: AccountLine[];
};

type BookOffer = {
  Account?: string;
  TakerGets?: string | { currency?: string; issuer?: string; value?: string };
  TakerPays?: string | { currency?: string; issuer?: string; value?: string };
  quality?: string;
};

type BookOffersResult = {
  ledger_index?: number;
  offers?: BookOffer[];
};

export type TokenResearchCategory = {
  id: "issuer-control" | "distribution" | "liquidity" | "documentation" | "technical";
  label: string;
  score: number;
  status: "strong" | "mixed" | "limited";
  explanation: string;
};

export type TokenHolderObservation = {
  account: string;
  balance: number;
  sharePercent: number;
};

export type TokenResearchResult = {
  issuer: string;
  currency: string;
  ledgerIndex: number;
  observedAt: string;
  accountExists: boolean;
  issuerBalanceXrp: number;
  ownerCount: number;
  sequence: number;
  flags: {
    disableMaster: boolean;
    globalFreeze: boolean;
    defaultRipple: boolean;
    depositAuth: boolean;
  };
  regularKey: string;
  blackholeHeuristic: boolean;
  trustlineCount: number;
  nonZeroHolderCount: number;
  totalObservedSupply: number;
  topTenSharePercent: number;
  topHolders: TokenHolderObservation[];
  offerCount: number;
  uniqueOfferAccounts: number;
  categories: TokenResearchCategory[];
  overallScore: number;
  overallStatus: "more-transparent" | "mixed-evidence" | "limited-evidence";
  observations: string[];
  limitations: string[];
};

function isXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function normalizeCurrency(value: string) {
  const trimmed = value.trim();
  return /^[a-fA-F0-9]{40}$/.test(trimmed) ? trimmed.toUpperCase() : trimmed.toUpperCase().slice(0, 20);
}

function isSupportedCurrencyCode(value: string) {
  return /^[A-F0-9]{40}$/.test(value) || /^[A-Z0-9?!@#$%^&*<>{}]{3,20}$/.test(value);
}

function toFiniteNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function dropsToXrp(value: unknown) {
  return toFiniteNumber(value) / 1_000_000;
}

function scoreStatus(score: number): TokenResearchCategory["status"] {
  if (score >= 75) return "strong";
  if (score >= 45) return "mixed";
  return "limited";
}

function overallStatus(score: number): TokenResearchResult["overallStatus"] {
  if (score >= 75) return "more-transparent";
  if (score >= 45) return "mixed-evidence";
  return "limited-evidence";
}

function requestXrpl<T>(command: string, parameters: Record<string, unknown>) {
  return new Promise<T>((resolve, reject) => {
    const socket = new WebSocket(XRPL_ENDPOINT);
    const id = Date.now() + Math.floor(Math.random() * 10_000);
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("XRPL request timed out."));
    }, 18_000);

    socket.onopen = () => {
      socket.send(JSON.stringify({ id, command, ...parameters }));
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data) as XrplEnvelope<T>;
        if (response.id !== id) return;

        window.clearTimeout(timeout);
        socket.close();

        if (!response.result || response.result.error) {
          reject(new Error(response.result?.error_message || response.result?.error || "XRPL request failed."));
          return;
        }

        resolve(response.result);
      } catch (error) {
        window.clearTimeout(timeout);
        socket.close();
        reject(error);
      }
    };

    socket.onerror = () => {
      window.clearTimeout(timeout);
      socket.close();
      reject(new Error("Could not reach the XRP Ledger."));
    };
  });
}

function getIssuedAmount(offer: BookOffer, currency: string, issuer: string) {
  const sides = [offer.TakerGets, offer.TakerPays];
  for (const side of sides) {
    if (typeof side === "object" && side?.currency === currency && side?.issuer === issuer) {
      return Math.abs(toFiniteNumber(side.value));
    }
  }
  return 0;
}

export async function analyzeXrplToken(input: {
  issuer: string;
  currency: string;
  documentationCount?: number;
  claimText?: string;
}) {
  const issuer = input.issuer.trim();
  const currency = normalizeCurrency(input.currency);

  if (!isXrplAddress(issuer)) {
    throw new Error("Enter a valid XRPL issuer address.");
  }
  if (!isSupportedCurrencyCode(currency)) {
    throw new Error("Enter a 3–20 character currency code or a 40-character hexadecimal XRPL currency code.");
  }

  const accountInfo = await requestXrpl<AccountInfoResult>("account_info", {
    account: issuer,
    ledger_index: "validated",
    strict: true,
  });

  const [accountLines, bookOffers] = await Promise.all([
    requestXrpl<AccountLinesResult>("account_lines", {
      account: issuer,
      ledger_index: "validated",
      limit: 400,
    }).catch(() => ({ lines: [], ledger_index: accountInfo.ledger_index })),
    requestXrpl<BookOffersResult>("book_offers", {
      taker_gets: { currency, issuer },
      taker_pays: { currency: "XRP" },
      ledger_index: "validated",
      limit: 200,
    }).catch(() => ({ offers: [], ledger_index: accountInfo.ledger_index })),
  ]);

  const account = accountInfo.account_data;
  if (!account) {
    throw new Error("The issuer account was not found in a validated ledger.");
  }

  const flagsValue = account.Flags ?? 0;
  const flags = {
    disableMaster: Boolean(flagsValue & LSF_DISABLE_MASTER),
    globalFreeze: Boolean(flagsValue & LSF_GLOBAL_FREEZE),
    defaultRipple: Boolean(flagsValue & LSF_DEFAULT_RIPPLE),
    depositAuth: Boolean(flagsValue & LSF_DEPOSIT_AUTH),
  };
  const regularKey = account.RegularKey ?? "";
  const blackholeHeuristic = flags.disableMaster && KNOWN_BLACKHOLE_ADDRESSES.has(regularKey);

  const relevantLines = (accountLines.lines ?? []).filter((line) => line.currency === currency);
  const holders = relevantLines
    .map((line) => ({
      account: line.account ?? "unknown",
      balance: Math.abs(toFiniteNumber(line.balance)),
    }))
    .filter((holder) => holder.balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const totalObservedSupply = holders.reduce((sum, holder) => sum + holder.balance, 0);
  const topHolders = holders.slice(0, 10).map((holder) => ({
    ...holder,
    sharePercent: totalObservedSupply > 0 ? (holder.balance / totalObservedSupply) * 100 : 0,
  }));
  const topTenSharePercent = topHolders.reduce((sum, holder) => sum + holder.sharePercent, 0);

  const offers = (bookOffers.offers ?? []).filter((offer) => getIssuedAmount(offer, currency, issuer) > 0);
  const uniqueOfferAccounts = new Set(offers.map((offer) => offer.Account).filter(Boolean)).size;

  let issuerControlScore = blackholeHeuristic ? 95 : flags.disableMaster ? 78 : 42;
  if (flags.globalFreeze) issuerControlScore -= 20;
  issuerControlScore = Math.max(0, Math.min(100, issuerControlScore));

  let distributionScore = 20;
  if (holders.length >= 1000) distributionScore = 85;
  else if (holders.length >= 250) distributionScore = 75;
  else if (holders.length >= 50) distributionScore = 60;
  else if (holders.length >= 10) distributionScore = 45;
  if (topTenSharePercent >= 90) distributionScore -= 30;
  else if (topTenSharePercent >= 75) distributionScore -= 20;
  else if (topTenSharePercent >= 50) distributionScore -= 10;
  distributionScore = Math.max(0, Math.min(100, distributionScore));

  let liquidityScore = 15;
  if (offers.length >= 100 && uniqueOfferAccounts >= 20) liquidityScore = 85;
  else if (offers.length >= 40 && uniqueOfferAccounts >= 10) liquidityScore = 70;
  else if (offers.length >= 10 && uniqueOfferAccounts >= 3) liquidityScore = 50;
  else if (offers.length > 0) liquidityScore = 30;

  const documentationCount = Math.max(0, input.documentationCount ?? 0);
  const claimLength = input.claimText?.trim().length ?? 0;
  let documentationScore = 15;
  if (documentationCount >= 3) documentationScore = 80;
  else if (documentationCount === 2) documentationScore = 65;
  else if (documentationCount === 1) documentationScore = 45;
  if (claimLength >= 200) documentationScore += 10;
  documentationScore = Math.min(100, documentationScore);

  let technicalScore = 55;
  if (account.Domain) technicalScore += 10;
  if (account.TickSize) technicalScore += 5;
  if (account.TransferRate && account.TransferRate > 1_000_000_000) technicalScore -= 10;
  if (relevantLines.some((line) => line.freeze || line.freeze_peer)) technicalScore -= 15;
  technicalScore = Math.max(0, Math.min(100, technicalScore));

  const categories: TokenResearchCategory[] = [
    {
      id: "issuer-control",
      label: "Issuer control",
      score: issuerControlScore,
      status: scoreStatus(issuerControlScore),
      explanation: blackholeHeuristic
        ? "Master signing is disabled and the regular key matches a commonly used blackhole address heuristic."
        : flags.disableMaster
          ? "Master signing is disabled, but the remaining control path still requires review."
          : "The issuer appears to retain a master signing path or the control state cannot be proven irreversible.",
    },
    {
      id: "distribution",
      label: "Observed distribution",
      score: distributionScore,
      status: scoreStatus(distributionScore),
      explanation: `${holders.length} non-zero trustline balances were observed; the top ten account for ${topTenSharePercent.toFixed(1)}% of the observed amount.`,
    },
    {
      id: "liquidity",
      label: "Order-book presence",
      score: liquidityScore,
      status: scoreStatus(liquidityScore),
      explanation: `${offers.length} matching XRP order-book offers from ${uniqueOfferAccounts} observed accounts were returned in the current sample.`,
    },
    {
      id: "documentation",
      label: "Evidence supplied",
      score: documentationScore,
      status: scoreStatus(documentationScore),
      explanation: `${documentationCount} document${documentationCount === 1 ? "" : "s"} and ${claimLength} characters of claim context were supplied for this review.`,
    },
    {
      id: "technical",
      label: "Technical signals",
      score: technicalScore,
      status: scoreStatus(technicalScore),
      explanation: `Account flags, domain, transfer-rate and freeze-related trustline observations were included where available.`,
    },
  ];

  const overallScore = Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length);
  const observations = [
    `Issuer account was found at validated ledger ${accountInfo.ledger_index ?? 0}.`,
    `${relevantLines.length} matching trustlines were returned in the first account_lines page.`,
    `${offers.length} matching XRP order-book offers were returned in the current order-book sample.`,
    flags.globalFreeze ? "The issuer account currently has Global Freeze enabled." : "Global Freeze was not observed on the issuer account.",
    blackholeHeuristic
      ? "A common blackhole configuration heuristic was observed."
      : "A fully irreversible issuer configuration was not proven by this scan.",
  ];
  const limitations = [
    "This scan uses current public XRPL responses and does not prove legal ownership, team identity, solvency or future behaviour.",
    "account_lines and book_offers responses are sampled and may require pagination or independent indexers for complete market history.",
    "Holder concentration can be distorted by exchanges, AMM accounts, treasury wallets, locked wallets or linked addresses.",
    "A high score is not an investment recommendation and a low score is not a fraud determination.",
  ];

  return {
    issuer,
    currency,
    ledgerIndex: accountInfo.ledger_index ?? accountLines.ledger_index ?? bookOffers.ledger_index ?? 0,
    observedAt: new Date().toISOString(),
    accountExists: true,
    issuerBalanceXrp: dropsToXrp(account.Balance),
    ownerCount: account.OwnerCount ?? 0,
    sequence: account.Sequence ?? 0,
    flags,
    regularKey,
    blackholeHeuristic,
    trustlineCount: relevantLines.length,
    nonZeroHolderCount: holders.length,
    totalObservedSupply,
    topTenSharePercent,
    topHolders,
    offerCount: offers.length,
    uniqueOfferAccounts,
    categories,
    overallScore,
    overallStatus: overallStatus(overallScore),
    observations,
    limitations,
  } satisfies TokenResearchResult;
}
