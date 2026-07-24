import { ottSupabase } from "./ottAuth";

export type NftIssuanceType =
  | "access-pass"
  | "public-access-pass"
  | "foundation-certificate"
  | "wallet-foundation-certificate"
  | "wallet-security-certificate"
  | "wallet-operations-certificate";
export type NftIssuanceStatus = "eligible" | "reserved" | "pending" | "issued" | "failed";

export type NftIssuanceRecord = {
  id: string;
  type: NftIssuanceType;
  status: NftIssuanceStatus;
  serialNumber: number;
  walletAddress: string;
  accountId: string;
  transactionHash: string;
  metadataUri: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type NftCollectionConfig = {
  max: number;
  width: number;
  label: string;
  edition: "genesis" | "public" | "academy";
  transferable: boolean;
  purpose: string;
};

export const NFT_ISSUANCE_LIMITS: Record<NftIssuanceType, NftCollectionConfig> = {
  "access-pass": {
    max: 500,
    width: 3,
    label: "OTT Genesis Access Pass",
    edition: "genesis",
    transferable: true,
    purpose: "Limited founding access edition. Existing #001–#500 scarcity is preserved.",
  },
  "public-access-pass": {
    max: 100_000,
    width: 6,
    label: "OTT Public Access Pass",
    edition: "public",
    transferable: true,
    purpose: "Scalable wallet-neutral access for the public XRPL learning platform.",
  },
  "foundation-certificate": {
    max: 50_000,
    width: 5,
    label: "OTT XRPL Foundation Certificate",
    edition: "academy",
    transferable: false,
    purpose: "Proof of completion for the broad XRPL foundation curriculum.",
  },
  "wallet-foundation-certificate": {
    max: 100_000,
    width: 6,
    label: "OTT Wallet Foundation Certificate",
    edition: "academy",
    transferable: false,
    purpose: "Proof that the learner understands accounts, addresses, reserves and custody models.",
  },
  "wallet-security-certificate": {
    max: 100_000,
    width: 6,
    label: "OTT Wallet Security Certificate",
    edition: "academy",
    transferable: false,
    purpose: "Proof of security, recovery, payload review and phishing knowledge.",
  },
  "wallet-operations-certificate": {
    max: 100_000,
    width: 6,
    label: "OTT XRPL Wallet Operations Certificate",
    edition: "academy",
    transferable: false,
    purpose: "Proof of Testnet practice with tokens, trustlines, DEX, AMM and NFTs.",
  },
};

const LOCAL_KEY = "ott-nft-issuance-records-v2";
const LEGACY_LOCAL_KEY = "ott-nft-issuance-records-v1";

function readLocal(): NftIssuanceRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const current = window.localStorage.getItem(LOCAL_KEY);
    const legacy = window.localStorage.getItem(LEGACY_LOCAL_KEY);
    const parsed = JSON.parse(current ?? legacy ?? "[]") as NftIssuanceRecord[];
    const records = Array.isArray(parsed) ? parsed : [];
    if (!current && legacy) {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
    }
    return records;
  } catch {
    return [];
  }
}

function writeLocal(records: NftIssuanceRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(records.slice(0, 5000)));
  }
}

export function formatNftSerial(type: NftIssuanceType, serialNumber: number) {
  const config = NFT_ISSUANCE_LIMITS[type];
  return `#${Math.max(0, serialNumber).toString().padStart(config.width, "0")}`;
}

export function getLocalNftIssuanceRecords(type?: NftIssuanceType) {
  const records = readLocal().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return type ? records.filter((record) => record.type === type) : records;
}

export function getNextLocalSerial(type: NftIssuanceType) {
  const used = new Set(
    readLocal()
      .filter((record) => record.type === type)
      .map((record) => record.serialNumber),
  );
  const max = NFT_ISSUANCE_LIMITS[type].max;

  for (let serial = 1; serial <= max; serial += 1) {
    if (!used.has(serial)) {
      return serial;
    }
  }

  return null;
}

export async function upsertNftIssuanceRecord(
  input: Omit<NftIssuanceRecord, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
  },
) {
  const now = new Date().toISOString();
  const config = NFT_ISSUANCE_LIMITS[input.type];

  if (!Number.isInteger(input.serialNumber) || input.serialNumber < 1 || input.serialNumber > config.max) {
    throw new Error(`Serial number must be between 1 and ${config.max}.`);
  }

  const existing = readLocal();
  const duplicate = existing.find(
    (record) =>
      record.type === input.type &&
      record.serialNumber === input.serialNumber &&
      record.id !== input.id,
  );
  if (duplicate) {
    throw new Error(`${config.label} ${formatNftSerial(input.type, input.serialNumber)} is already reserved.`);
  }

  const record: NftIssuanceRecord = {
    id: input.id ?? crypto.randomUUID(),
    type: input.type,
    status: input.status,
    serialNumber: input.serialNumber,
    walletAddress: input.walletAddress.trim(),
    accountId: input.accountId.trim(),
    transactionHash: input.transactionHash.trim(),
    metadataUri: input.metadataUri.trim(),
    errorMessage: input.errorMessage.trim().slice(0, 1000),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };

  writeLocal([record, ...existing.filter((item) => item.id !== record.id)]);

  if (ottSupabase && input.accountId) {
    const { error } = await ottSupabase.from("nft_issuance_records").upsert({
      id: record.id,
      user_id: input.accountId,
      issuance_type: record.type,
      status: record.status,
      serial_number: record.serialNumber,
      wallet_address: record.walletAddress || null,
      transaction_hash: record.transactionHash || null,
      metadata_uri: record.metadataUri || null,
      error_message: record.errorMessage || null,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });

    if (error) {
      throw error;
    }
  }

  return record;
}

export function getNftIssuanceSummary(type: NftIssuanceType) {
  const records = getLocalNftIssuanceRecords(type);
  const max = NFT_ISSUANCE_LIMITS[type].max;
  const issued = records.filter((record) => record.status === "issued").length;
  const reserved = records.filter((record) => ["reserved", "pending"].includes(record.status)).length;

  return {
    max,
    issued,
    reserved,
    available: Math.max(0, max - issued - reserved),
    nextSerial: getNextLocalSerial(type),
  };
}

export function getScalableNftCollectionSummary() {
  return Object.entries(NFT_ISSUANCE_LIMITS).map(([type, config]) => ({
    type: type as NftIssuanceType,
    ...config,
    ...getNftIssuanceSummary(type as NftIssuanceType),
  }));
}
