import {
  ArrowLeftRight,
  FileCode2,
  Landmark,
  LayoutGrid,
  Network,
  Tags,
  type LucideIcon,
} from "lucide-react";

export type OttVisualKey =
  | "all"
  | "xls"
  | "cbdc"
  | "xrpl-core"
  | "iso-20022"
  | "other";

export type OttVisualDefinition = {
  key: OttVisualKey;
  icon: LucideIcon;
  shortLabel: string;
  label: string;
  descriptionEn: string;
  descriptionNl: string;
};

export const OTT_VISUAL_LANGUAGE: Record<OttVisualKey, OttVisualDefinition> = {
  all: {
    key: "all",
    icon: LayoutGrid,
    shortLabel: "All",
    label: "All sources",
    descriptionEn: "Every source category",
    descriptionNl: "Alle broncategorieën",
  },
  xls: {
    key: "xls",
    icon: FileCode2,
    shortLabel: "XLS",
    label: "XLS proposals",
    descriptionEn: "XRPL standards and amendments",
    descriptionNl: "XRPL-standaarden en amendments",
  },
  cbdc: {
    key: "cbdc",
    icon: Landmark,
    shortLabel: "CBDC",
    label: "CBDC",
    descriptionEn: "Central-bank digital currency developments",
    descriptionNl: "Ontwikkelingen rond digitale centrale-bankvaluta",
  },
  "xrpl-core": {
    key: "xrpl-core",
    icon: Network,
    shortLabel: "XRPL Core",
    label: "XRPL Core",
    descriptionEn: "Core ledger, protocol and infrastructure",
    descriptionNl: "Ledgerkern, protocol en infrastructuur",
  },
  "iso-20022": {
    key: "iso-20022",
    icon: ArrowLeftRight,
    shortLabel: "ISO 20022",
    label: "ISO 20022",
    descriptionEn: "Financial messaging standards",
    descriptionNl: "Standaarden voor financieel berichtenverkeer",
  },
  other: {
    key: "other",
    icon: Tags,
    shortLabel: "Other",
    label: "Other sources",
    descriptionEn: "Additional sourced developments",
    descriptionNl: "Aanvullende ontwikkelingen met bronnen",
  },
};

export function getOttVisualKey(value: string): OttVisualKey {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ");

  if (!normalized || normalized === "all" || normalized === "alles") return "all";
  if (normalized.includes("xls") || normalized.includes("amendment")) return "xls";
  if (normalized.includes("cbdc") || normalized.includes("central bank digital")) return "cbdc";
  if (
    normalized.includes("xrpl core")
    || normalized === "xrpl"
    || normalized.includes("ledger core")
    || normalized.includes("protocol")
  ) return "xrpl-core";
  if (normalized.includes("iso 20022") || normalized.includes("iso20022")) return "iso-20022";

  return "other";
}

export function getOttVisual(value: string) {
  return OTT_VISUAL_LANGUAGE[getOttVisualKey(value)];
}
