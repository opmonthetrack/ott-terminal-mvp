export const NFT_EDITION_REGISTRY = {
  accessPass: {
    collectionId: "ott-access-pass-alpha-v1",
    name: "OTT Access Pass: Alpha",
    edition: "Alpha",
    serialStart: 1,
    serialEnd: 500,
    serialDigits: 3,
    purpose: "OTT Terminal access utility",
    metadataVersion: "1.0",
    visualStatus: "approved-pending-publication",
  },
  foundationCertificate: {
    collectionId: "ott-xrpl-foundation-certificate-v1",
    name: "OTT XRPL Foundation Certificate",
    edition: "Foundation",
    serialStart: 1,
    serialEnd: 5000,
    serialDigits: 4,
    purpose: "Verified Academy completion certificate",
    metadataVersion: "1.0",
    visualStatus: "design-pending",
  },
} as const;

export type NftEditionKey = keyof typeof NFT_EDITION_REGISTRY;

export function formatEditionSerial(key: NftEditionKey, serial: number) {
  const edition = NFT_EDITION_REGISTRY[key];

  if (!Number.isInteger(serial) || serial < edition.serialStart || serial > edition.serialEnd) {
    throw new Error(
      `${edition.name} serial must be between ${edition.serialStart} and ${edition.serialEnd}.`,
    );
  }

  return `#${String(serial).padStart(edition.serialDigits, "0")}`;
}
