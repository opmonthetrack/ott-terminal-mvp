export type AccessPassTier = "Founder" | "Early Supporter" | "Community" | "Test";

export type AccessPassMetadataInput = {
  tier: AccessPassTier;
  edition: string;
  imageUri: string;
  issuerWallet: string;
  sourceTag: number;
  network?: string;
};

const tierLabels: Record<AccessPassTier, string> = {
  Founder: "Founder",
  "Early Supporter": "Early Supporter",
  Community: "Community",
  Test: "Test",
};

export function normalizeEdition(value: string) {
  const cleanValue = value.trim().replace(/^#/, "");
  const numeric = Number.parseInt(cleanValue, 10);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "001";
  }

  return String(numeric).padStart(3, "0");
}

export function buildAccessPassName(input: Pick<AccessPassMetadataInput, "tier" | "edition">) {
  return `OTT Terminal Access Pass — ${tierLabels[input.tier]} #${normalizeEdition(input.edition)}`;
}

export function buildAccessPassDescription(input: Pick<AccessPassMetadataInput, "tier" | "edition">) {
  const edition = normalizeEdition(input.edition);

  if (input.tier === "Test") {
    return `Test utility access pass for XRPL OnTheTrack Terminal. Edition ${edition}. This NFT is for development, verification and internal QA only. It is not an investment, does not provide yield, and does not promise resale value.`;
  }

  return `Utility access pass for XRPL OnTheTrack Terminal. ${tierLabels[input.tier]} edition ${edition}. This NFT can be used to verify access inside the terminal. It is not an investment, does not provide yield, and does not promise resale value.`;
}

export function buildAccessPassMetadata(input: AccessPassMetadataInput) {
  const edition = normalizeEdition(input.edition);

  return {
    name: buildAccessPassName({ tier: input.tier, edition }),
    description: buildAccessPassDescription({ tier: input.tier, edition }),
    image: input.imageUri,
    external_url: "https://ott-terminal-mvp.vercel.app",
    attributes: [
      { trait_type: "Type", value: "Utility Access" },
      { trait_type: "Tier", value: tierLabels[input.tier] },
      { trait_type: "Edition", value: edition },
      { trait_type: "SourceTag", value: String(input.sourceTag) },
      { trait_type: "Issuer", value: input.issuerWallet },
      { trait_type: "Network", value: input.network || "XRPL Mainnet" },
      { trait_type: "Value Promise", value: "None" },
      { trait_type: "Yield Promise", value: "None" },
    ],
    properties: {
      category: "access-pass",
      utility: "terminal-access-verification",
      legal: "Utility access only. No investment, yield or resale value promise.",
      issuer: input.issuerWallet,
      sourceTag: String(input.sourceTag),
    },
  };
}

export const ACCESS_PASS_METADATA_COPY = {
  safeMintMemo: "OTT Access Pass mint • Utility access only • SourceTag 2606170002",
  safeTransferMemo: "OTT Access Pass transfer • Utility access only • SourceTag 2606170002",
  xamanMintInstruction:
    "Mint OTT Terminal Access Pass. Utility access only — no investment, no yield, no resale value promise.",
  xamanTransferInstruction:
    "Send OTT Terminal Access Pass to the selected wallet. The receiver accepts the NFT offer in Xaman. Utility access only — no investment or value promise.",
};
