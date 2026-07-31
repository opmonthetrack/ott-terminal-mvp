import type { XrplNetwork } from "./walletRegistry";

export type XrplWalletProfile = {
  address: string;
  network: XrplNetwork;
  ledgerIndex: number;
  balanceXrp: string;
  sequence: number;
  ownerCount: number;
  domain: string;
  accountFlags: number;
  trustlineCount: number;
  tokenCount: number;
  nftCount: number;
  offerCount: number;
  escrowCount: number;
  signerListCount: number;
  paymentChannelCount: number;
  checkCount: number;
  depositPreauthCount: number;
  ammPositionCount: number;
  objectCountLoaded: number;
  partial: boolean;
  loadedAt: string;
};

export type XrplTransactionSnapshot = {
  hash: string;
  network: XrplNetwork;
  validated: boolean;
  successful: boolean;
  result: string;
  transactionType: string;
  account: string;
  destination: string;
  amount: string;
  feeXrp: string;
  sourceTag: number | null;
  destinationTag: number | null;
  ledgerIndex: number;
};

type XrplResponse = {
  id?: number;
  status?: string;
  type?: string;
  result?: {
    error?: string;
    error_message?: string;
    ledger_index?: number;
    marker?: unknown;
    account_data?: {
      Account?: string;
      Balance?: string;
      Sequence?: number;
      OwnerCount?: number;
      Domain?: string;
      Flags?: number;
    };
    lines?: Array<{ currency?: string; balance?: string; account?: string }>;
    account_objects?: Array<{ LedgerEntryType?: string; [key: string]: unknown }>;
    account_nfts?: Array<{ NFTokenID?: string }>;
    hash?: string;
    validated?: boolean;
    TransactionType?: string;
    Account?: string;
    Destination?: string;
    Amount?: string | { currency?: string; issuer?: string; value?: string };
    Fee?: string;
    SourceTag?: number;
    DestinationTag?: number;
    tx_json?: {
      hash?: string;
      TransactionType?: string;
      Account?: string;
      Destination?: string;
      Amount?: string | { currency?: string; issuer?: string; value?: string };
      Fee?: string;
      SourceTag?: number;
      DestinationTag?: number;
    };
    meta?: {
      TransactionResult?: string;
    };
  };
};

const NETWORK_ENDPOINTS: Record<XrplNetwork, string> = {
  mainnet: "wss://xrplcluster.com/",
  testnet: "wss://s.altnet.rippletest.net:51233",
  devnet: "wss://s.devnet.rippletest.net:51233",
};

function requestXrpl(network: XrplNetwork, request: Record<string, unknown>) {
  return new Promise<XrplResponse>((resolve, reject) => {
    const socket = new WebSocket(NETWORK_ENDPOINTS[network]);
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("XRPL profile request timed out."));
    }, 15_000);

    socket.onopen = () => {
      socket.send(JSON.stringify({ id, ...request }));
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(String(event.data)) as XrplResponse;
        if (response.id !== id) return;
        window.clearTimeout(timeout);
        socket.close();
        if (response.result?.error) {
          reject(new Error(response.result.error_message || response.result.error));
          return;
        }
        resolve(response);
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

function dropsToXrp(value: string) {
  try {
    const drops = BigInt(value || "0");
    const whole = drops / 1_000_000n;
    const fraction = (drops % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
    return fraction ? `${whole.toLocaleString()}.${fraction}` : whole.toLocaleString();
  } catch {
    return "0";
  }
}

function decodeDomain(value?: string) {
  if (!value) return "";
  try {
    const bytes = value.match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) ?? [];
    return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, "").trim();
  } catch {
    return "";
  }
}

function countObjects(objects: Array<{ LedgerEntryType?: string }>, type: string) {
  return objects.filter((object) => object.LedgerEntryType === type).length;
}

function formatTransactionAmount(value: unknown) {
  if (typeof value === "string") return `${dropsToXrp(value)} XRP`;
  if (typeof value === "object" && value !== null) {
    const amount = value as { currency?: string; value?: string };
    const currency = amount.currency?.trim() || "issued asset";
    const quantity = amount.value?.trim() || "unknown amount";
    return `${quantity} ${currency}`;
  }
  return "Not displayed";
}

export async function loadXrplWalletProfile(
  address: string,
  network: XrplNetwork = "mainnet",
): Promise<XrplWalletProfile> {
  const accountInfo = await requestXrpl(network, {
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });

  const account = accountInfo.result?.account_data;
  if (!account?.Account) {
    throw new Error("No validated XRPL account was found for this address on the selected network.");
  }

  const [linesResult, objectsResult, nftsResult] = await Promise.allSettled([
    requestXrpl(network, {
      command: "account_lines",
      account: address,
      ledger_index: "validated",
      limit: 400,
    }),
    requestXrpl(network, {
      command: "account_objects",
      account: address,
      ledger_index: "validated",
      limit: 400,
    }),
    requestXrpl(network, {
      command: "account_nfts",
      account: address,
      ledger_index: "validated",
      limit: 400,
    }),
  ]);

  const lines = linesResult.status === "fulfilled" ? linesResult.value.result?.lines ?? [] : [];
  const objects = objectsResult.status === "fulfilled" ? objectsResult.value.result?.account_objects ?? [] : [];
  const nfts = nftsResult.status === "fulfilled" ? nftsResult.value.result?.account_nfts ?? [] : [];
  const partial = [linesResult, objectsResult, nftsResult].some((result) => result.status === "rejected") ||
    (linesResult.status === "fulfilled" && Boolean(linesResult.value.result?.marker)) ||
    (objectsResult.status === "fulfilled" && Boolean(objectsResult.value.result?.marker)) ||
    (nftsResult.status === "fulfilled" && Boolean(nftsResult.value.result?.marker));

  return {
    address: account.Account,
    network,
    ledgerIndex: accountInfo.result?.ledger_index ?? 0,
    balanceXrp: dropsToXrp(account.Balance ?? "0"),
    sequence: account.Sequence ?? 0,
    ownerCount: account.OwnerCount ?? 0,
    domain: decodeDomain(account.Domain),
    accountFlags: account.Flags ?? 0,
    trustlineCount: lines.length,
    tokenCount: lines.filter((line) => line.currency && line.balance !== "0").length,
    nftCount: nfts.length,
    offerCount: countObjects(objects, "Offer"),
    escrowCount: countObjects(objects, "Escrow"),
    signerListCount: countObjects(objects, "SignerList"),
    paymentChannelCount: countObjects(objects, "PayChannel"),
    checkCount: countObjects(objects, "Check"),
    depositPreauthCount: countObjects(objects, "DepositPreauth"),
    ammPositionCount: countObjects(objects, "AMM") + countObjects(objects, "RippleState"),
    objectCountLoaded: objects.length,
    partial,
    loadedAt: new Date().toISOString(),
  };
}

export async function loadXrplTransactionSnapshot(
  hash: string,
  network: XrplNetwork = "mainnet",
): Promise<XrplTransactionSnapshot> {
  const normalizedHash = hash.trim().toUpperCase();
  if (!/^[A-F0-9]{64}$/.test(normalizedHash)) {
    throw new Error("Enter a valid 64-character XRPL transaction hash.");
  }

  const response = await requestXrpl(network, {
    command: "tx",
    transaction: normalizedHash,
    binary: false,
  });
  const result = response.result;
  const transaction = result?.tx_json ?? result;
  if (!transaction?.TransactionType || !transaction.Account) {
    throw new Error("No transaction was found for this hash on the selected network.");
  }

  const transactionResult = result?.meta?.TransactionResult ?? "Unknown";
  return {
    hash: transaction.hash?.toUpperCase() || normalizedHash,
    network,
    validated: result?.validated === true,
    successful: transactionResult === "tesSUCCESS",
    result: transactionResult,
    transactionType: transaction.TransactionType,
    account: transaction.Account,
    destination: transaction.Destination ?? "",
    amount: formatTransactionAmount(transaction.Amount),
    feeXrp: transaction.Fee ? dropsToXrp(transaction.Fee) : "Unknown",
    sourceTag: typeof transaction.SourceTag === "number" ? transaction.SourceTag : null,
    destinationTag: typeof transaction.DestinationTag === "number" ? transaction.DestinationTag : null,
    ledgerIndex: result?.ledger_index ?? 0,
  };
}
