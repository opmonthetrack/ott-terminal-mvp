import { formatEditionSerial, NFT_EDITION_REGISTRY } from "./nftEditionRegistry";

export const ACCESS_PASS_ALPHA_VISUAL = {
  approvalStatus: "approved-source-provided",
  sourceFileName: "Gemini_Generated_Image_2w73rp2w73rp2w73.png",
  sourceWidth: 2048,
  sourceHeight: 2024,
  sourceFormat: "PNG",
  sourceSha256: "d55566bdf392b3703730d2a1792e10b6db8e6c2a27320fae85878f13d164effe",
  optimizedWidth: 1600,
  optimizedHeight: 1581,
  optimizedFormat: "WEBP",
  optimizedSha256: "cfabeed842d479e301a06d01f85e28da2e987da5dfd81b973566464ebf44b1b8",
  publishingStatus: "pending-public-asset-and-ipfs-pinning",
} as const;

export const ACCESS_PASS_ALPHA_IMAGE_URI =
  import.meta.env.VITE_OTT_ACCESS_PASS_ALPHA_IMAGE_URI?.trim() || "";

export type AccessPassAlphaMetadataInput = {
  serial: number;
  issuedAt?: string;
  imageUri?: string;
};

export function buildAccessPassAlphaMetadata(input: AccessPassAlphaMetadataInput) {
  const edition = NFT_EDITION_REGISTRY.accessPass;
  const serial = formatEditionSerial("accessPass", input.serial);
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const image = input.imageUri?.trim() || ACCESS_PASS_ALPHA_IMAGE_URI;

  return {
    name: `OTT Access Pass: Alpha ${serial}`,
    description:
      "Numbered utility access pass for XRPL OnTheTrack Terminal services. This NFT provides access utility only and includes no investment, yield, profit or resale-value promise.",
    ...(image ? { image } : {}),
    external_url: `https://ott-terminal-mvp.vercel.app/?access-pass=${String(input.serial).padStart(edition.serialDigits, "0")}`,
    attributes: [
      { trait_type: "Collection", value: edition.name },
      { trait_type: "Edition", value: "Alpha" },
      { trait_type: "Serial", value: serial },
      { trait_type: "Edition Size", value: edition.serialEnd },
      { trait_type: "Utility", value: edition.purpose },
      { trait_type: "Network", value: "XRPL" },
      { trait_type: "SourceTag", value: "2606170002" },
      { trait_type: "Legal Position", value: "Access utility only" },
      { trait_type: "Issued At", value: issuedAt },
    ],
    properties: {
      collection_id: edition.collectionId,
      metadata_version: edition.metadataVersion,
      serial_number: input.serial,
      serial_label: serial,
      edition_start: edition.serialStart,
      edition_end: edition.serialEnd,
      image_status: image ? "configured" : ACCESS_PASS_ALPHA_VISUAL.publishingStatus,
    },
  };
}

export function isAccessPassAlphaMetadataReady() {
  return Boolean(ACCESS_PASS_ALPHA_IMAGE_URI);
}
