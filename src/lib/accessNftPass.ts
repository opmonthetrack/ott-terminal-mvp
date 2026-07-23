export type AccessPassCheckStatus =
  | "idle"
  | "checking"
  | "found"
  | "not-found"
  | "error";

export type OttAccessPassNft = {
  nftokenId: string;
  issuer: string;
  taxon: number;
  uri: string;
  decodedUri: string;
  flags?: number;
  serial?: number;
};

export type AccessPassOwnershipResult = {
  walletAddress: string;
  hasAccessPass: boolean;
  checkedAt: string;
  expectedIssuer: string;
  expectedTaxon: number;
  matchedNft: OttAccessPassNft | null;
  totalNftsChecked: number;
  error?: string;
};

type AccountNftsResponse = {
  result?: {
    account_nfts?: Array<{
      NFTokenID?: string;
      Issuer?: string;
      NFTokenTaxon?: number;
      URI?: string;
      Flags?: number;
      nft_serial?: number;
    }>;
    marker?: unknown;
    error?: string;
    error_message?: string;
  };
};

const XRPL_ENDPOINT =
  import.meta.env.VITE_XRPL_WEBSOCKET || "wss://xrplcluster.com/";

export const OTT_ACCESS_PASS_ISSUER =
  import.meta.env.VITE_OTT_ACCESS_PASS_ISSUER ||
  "rPCF1f9pi91B7ad7FydnxFPKiF7cdycV5q";

export const OTT_ACCESS_PASS_TAXON = Number(
  import.meta.env.VITE_OTT_ACCESS_PASS_TAXON || "2606170002",
);

export const OTT_ACCESS_PASS_METADATA_CID =
  import.meta.env.VITE_OTT_ACCESS_PASS_METADATA_CID ||
  "bafkreiea77su5l5jntnaw3mzbmjdy5odsut2lxqvtfiarwk5usp3wq34py";

export const OTT_ACCESS_PASS_LEGACY_METADATA_CIDS = [
  "bafkreifw47mopkw7qq4fppxkhgcthyrjvger5uyrqybyj52aunqhsz2cbm",
] as const;

export const OTT_ACCESS_PASS_ACCEPTED_METADATA_CIDS = Array.from(
  new Set([OTT_ACCESS_PASS_METADATA_CID, ...OTT_ACCESS_PASS_LEGACY_METADATA_CIDS]),
);

export const OTT_ACCESS_PASS_METADATA_URI =
  import.meta.env.VITE_OTT_ACCESS_PASS_METADATA_URI ||
  `ipfs://${OTT_ACCESS_PASS_METADATA_CID}`;

export const OTT_ACCESS_PASS_METADATA_BASE_URI =
  import.meta.env.VITE_OTT_ACCESS_PASS_METADATA_BASE_URI ||
  "/api/access-payment?scope=metadata&serial=";

export const OTT_ACCESS_PASS_URI_KEYWORDS = [
  ...OTT_ACCESS_PASS_ACCEPTED_METADATA_CIDS,
  ...OTT_ACCESS_PASS_ACCEPTED_METADATA_CIDS.map((cid) => `ipfs://${cid}`),
  ...OTT_ACCESS_PASS_ACCEPTED_METADATA_CIDS.map((cid) => `https://ipfs.io/ipfs/${cid}`),
  ...OTT_ACCESS_PASS_ACCEPTED_METADATA_CIDS.map(
    (cid) => `https://gateway.pinata.cloud/ipfs/${cid}`,
  ),
];

export function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(value.trim());
}

export async function checkOttAccessPassOwnership(
  walletAddress: string,
): Promise<AccessPassOwnershipResult> {
  const cleanWallet = walletAddress.trim();

  if (!isLikelyXrplAddress(cleanWallet)) {
    return {
      walletAddress: cleanWallet,
      hasAccessPass: false,
      checkedAt: new Date().toISOString(),
      expectedIssuer: OTT_ACCESS_PASS_ISSUER,
      expectedTaxon: OTT_ACCESS_PASS_TAXON,
      matchedNft: null,
      totalNftsChecked: 0,
      error: "Invalid XRPL wallet address.",
    };
  }

  try {
    const nfts = await fetchAllAccountNfts(cleanWallet);
    const normalized = nfts.map(normalizeNft);

    const matchedNft = normalized.find(isOttAccessPassNft) ?? null;

    return {
      walletAddress: cleanWallet,
      hasAccessPass: Boolean(matchedNft),
      checkedAt: new Date().toISOString(),
      expectedIssuer: OTT_ACCESS_PASS_ISSUER,
      expectedTaxon: OTT_ACCESS_PASS_TAXON,
      matchedNft,
      totalNftsChecked: nfts.length,
    };
  } catch (error) {
    return {
      walletAddress: cleanWallet,
      hasAccessPass: false,
      checkedAt: new Date().toISOString(),
      expectedIssuer: OTT_ACCESS_PASS_ISSUER,
      expectedTaxon: OTT_ACCESS_PASS_TAXON,
      matchedNft: null,
      totalNftsChecked: 0,
      error: error instanceof Error ? error.message : "NFT ownership check failed.",
    };
  }
}

export function isOttAccessPassNft(nft: OttAccessPassNft) {
  const issuerMatches = nft.issuer === OTT_ACCESS_PASS_ISSUER;
  const taxonMatches = nft.taxon === OTT_ACCESS_PASS_TAXON;
  const uriMatches = nftUriMatchesAccessPass(nft.uri, nft.decodedUri);

  return issuerMatches && taxonMatches && uriMatches;
}

/**
 * Only use this for UI/debug labels, not for final service unlock.
 * Final unlock should use isOttAccessPassNft(), because that checks issuer + taxon + CID/URI.
 */
export function isLikelyOttAccessPassNft(nft: OttAccessPassNft) {
  const issuerMatches = nft.issuer === OTT_ACCESS_PASS_ISSUER;
  const taxonMatches = nft.taxon === OTT_ACCESS_PASS_TAXON;

  return issuerMatches && taxonMatches;
}

export function buildOttAccessPassLabel(nft: OttAccessPassNft | null) {
  if (!nft) {
    return "OTT Access Pass";
  }

  if (nft.serial) {
    return `OTT Access Pass #${nft.serial}`;
  }

  return "OTT Access Pass";
}

export function buildOttAccessPassMetadata(input: {
  ownerWallet?: string;
  accessTier?: string;
  issuedAt?: string;
}) {
  const issuedAt = input.issuedAt ?? new Date().toISOString();

  return {
    name: "OTT Access Pass",
    description:
      "Utility access pass for XRPL OnTheTrack Terminal services. No investment promise, no yield, no resale value promise.",
    image: "/logo.png",
    external_url: "/",
    attributes: [
      {
        trait_type: "Project",
        value: "XRPL OnTheTrack Terminal",
      },
      {
        trait_type: "Access Type",
        value: input.accessTier ?? "Terminal Services",
      },
      {
        trait_type: "SourceTag",
        value: "2606170002",
      },
      {
        trait_type: "Issuer Role",
        value: "OTT Issuer Wallet",
      },
      {
        trait_type: "Legal Position",
        value: "Access utility only",
      },
      {
        trait_type: "Metadata CID",
        value: OTT_ACCESS_PASS_METADATA_CID,
      },
      {
        trait_type: "Issued At",
        value: issuedAt,
      },
      ...(input.ownerWallet
        ? [
            {
              trait_type: "Initial Wallet",
              value: input.ownerWallet,
            },
          ]
        : []),
    ],
  };
}

export function encodeNftUri(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function decodeNftUri(hexValue?: string) {
  if (!hexValue) {
    return "";
  }

  const cleanHex = hexValue.startsWith("0x")
    ? hexValue.slice(2)
    : hexValue;

  if (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
    return hexValue;
  }

  try {
    const bytes = cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));

    if (!bytes) {
      return "";
    }

    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
}

export function getAccessPassStatusLabel(result: AccessPassOwnershipResult | null) {
  if (!result) {
    return "Access Pass ownership not checked yet.";
  }

  if (result.error) {
    return `Access Pass check failed: ${result.error}`;
  }

  if (result.hasAccessPass) {
    return "OTT Access Pass found. Services can unlock automatically.";
  }

  return "No OTT Access Pass found for this wallet.";
}

export function shortNftId(nftokenId?: string) {
  if (!nftokenId) {
    return "—";
  }

  if (nftokenId.length <= 18) {
    return nftokenId;
  }

  return `${nftokenId.slice(0, 10)}...${nftokenId.slice(-8)}`;
}

export function getAcceptedAccessPassUris() {
  return Array.from(
    new Set([
      OTT_ACCESS_PASS_METADATA_URI,
      ...OTT_ACCESS_PASS_ACCEPTED_METADATA_CIDS.flatMap((cid) => [
        cid,
        `ipfs://${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`,
      ]),
    ]),
  );
}

function nftUriMatchesAccessPass(rawUri: string, decodedUri: string) {
  const normalizedRaw = normalizeText(rawUri);
  const normalizedDecoded = normalizeText(decodedUri);
  const normalizedAcceptedUris = getAcceptedAccessPassUris().map(normalizeText);

  if (
    normalizedAcceptedUris.includes(normalizedDecoded) ||
    normalizedAcceptedUris.includes(normalizedRaw)
  ) {
    return true;
  }

  if (OTT_ACCESS_PASS_ACCEPTED_METADATA_CIDS.some((cid) => {
    const metadataUri = `ipfs://${cid}`;

    return (
      normalizedDecoded.includes(normalizeText(cid)) ||
      normalizedRaw.includes(normalizeText(encodeNftUri(metadataUri))) ||
      normalizedRaw.includes(normalizeText(encodeNftUri(cid)))
    );
  })) {
    return true;
  }

  const dynamicMetadataBase = normalizeText(OTT_ACCESS_PASS_METADATA_BASE_URI);
  const dynamicSerialMatch =
    normalizedDecoded.includes(dynamicMetadataBase) &&
    /[?&]serial=\d{3}(?:&|$)/.test(normalizedDecoded);

  if (dynamicSerialMatch) {
    return true;
  }

  return OTT_ACCESS_PASS_URI_KEYWORDS.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    return (
      normalizedDecoded.includes(normalizedKeyword) ||
      normalizedRaw.includes(normalizedKeyword)
    );
  });
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeNft(input: {
  NFTokenID?: string;
  Issuer?: string;
  NFTokenTaxon?: number;
  URI?: string;
  Flags?: number;
  nft_serial?: number;
}): OttAccessPassNft {
  const decodedUri = decodeNftUri(input.URI);
  const editionMatch = decodedUri.match(/[?&]serial=(\d{3})(?:&|$)/i);

  return {
    nftokenId: input.NFTokenID ?? "unknown",
    issuer: input.Issuer ?? "unknown",
    taxon: input.NFTokenTaxon ?? 0,
    uri: input.URI ?? "",
    decodedUri,
    flags: input.Flags,
    serial: editionMatch ? Number(editionMatch[1]) : input.nft_serial,
  };
}

async function fetchAllAccountNfts(walletAddress: string) {
  const allNfts: NonNullable<AccountNftsResponse["result"]>["account_nfts"] = [];
  let marker: unknown = undefined;

  for (let page = 0; page < 10; page += 1) {
    const response = await xrplRequest<AccountNftsResponse>({
      command: "account_nfts",
      account: walletAddress,
      ledger_index: "validated",
      limit: 400,
      ...(marker ? { marker } : {}),
    });

    const error = response.result?.error || response.result?.error_message;

    if (error) {
      throw new Error(error);
    }

    allNfts.push(...(response.result?.account_nfts ?? []));

    marker = response.result?.marker;

    if (!marker) {
      break;
    }
  }

  return allNfts;
}

async function xrplRequest<T>(payload: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(XRPL_ENDPOINT);
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("XRPL request timeout."));
    }, 12000);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          id: 1,
          ...payload,
        }),
      );
    };

    socket.onmessage = (event) => {
      window.clearTimeout(timeout);
      socket.close();

      try {
        resolve(JSON.parse(event.data) as T);
      } catch {
        reject(new Error("Could not parse XRPL response."));
      }
    };

    socket.onerror = () => {
      window.clearTimeout(timeout);
      socket.close();
      reject(new Error("XRPL websocket connection failed."));
    };
  });
}
