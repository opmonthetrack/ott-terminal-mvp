export const OTT_RESEARCH_MINIMUM_SCORE = 55;

export type OttResearchCategoryId =
  | "issuer-ledger"
  | "legal-jurisdiction"
  | "holders-distribution"
  | "liquidity-orderbook"
  | "whitepaper-product"
  | "roadmap-execution"
  | "team-transparency"
  | "market-data";

export type OttEvidenceStatus =
  | "verified"
  | "partial"
  | "unverified"
  | "missing"
  | "conflict";

export type OttResearchCategory = {
  id: OttResearchCategoryId;
  labelEn: string;
  labelNl: string;
  maxPoints: number;
  requiredForThreshold: boolean;
  descriptionEn: string;
  descriptionNl: string;
};

export type OttResearchScoreInput = {
  categoryId: OttResearchCategoryId;
  awardedPoints: number;
  evidenceStatus: OttEvidenceStatus;
  rationale: string;
  evidenceCount: number;
};

export type OttResearchScoreResult = {
  rawScore: number;
  finalScore: number;
  threshold: number;
  thresholdReached: boolean;
  scoreCap: number | null;
  capReasons: string[];
  missingCriticalCategories: OttResearchCategoryId[];
  label: "insufficient" | "weak" | "researchable" | "documented" | "strongly-documented";
};

export const OTT_RESEARCH_CATEGORIES: OttResearchCategory[] = [
  {
    id: "issuer-ledger",
    labelEn: "Issuer wallet and XRPL controls",
    labelNl: "Issuerwallet en XRPL-controles",
    maxPoints: 20,
    requiredForThreshold: true,
    descriptionEn: "Issuer account, flags, regular key, signer/delegate state, supply obligations and transaction history.",
    descriptionNl: "Issueraccount, flags, regular key, signer/delegatestatus, supplyverplichtingen en transactiegeschiedenis.",
  },
  {
    id: "legal-jurisdiction",
    labelEn: "Legal identity and jurisdiction",
    labelNl: "Juridische identiteit en jurisdictie",
    maxPoints: 15,
    requiredForThreshold: true,
    descriptionEn: "Legal entity, registration, country, responsible issuer, applicable regime and official regulator sources.",
    descriptionNl: "Juridische entiteit, registratie, land, verantwoordelijke issuer, toepasselijk regime en officiële toezichthouderbronnen.",
  },
  {
    id: "holders-distribution",
    labelEn: "Supply and holder distribution",
    labelNl: "Supply en houderverdeling",
    maxPoints: 15,
    requiredForThreshold: false,
    descriptionEn: "Issued obligations, trustline holders, concentration, related-wallet indicators and disclosed treasury roles.",
    descriptionNl: "Uitgegeven verplichtingen, trustlinehouders, concentratie, walletverbandindicatoren en bekendgemaakte treasuryrollen.",
  },
  {
    id: "liquidity-orderbook",
    labelEn: "Order books, AMM and liquidity",
    labelNl: "Orderboeken, AMM en liquiditeit",
    maxPoints: 15,
    requiredForThreshold: true,
    descriptionEn: "Funded offers, spread, depth, AMM reserves, slippage indicators and accessible exit liquidity.",
    descriptionNl: "Gefinancierde offers, spread, diepte, AMM-reserves, slippage-indicatoren en beschikbare uitstapliquiditeit.",
  },
  {
    id: "whitepaper-product",
    labelEn: "Whitepaper and verifiable product",
    labelNl: "Whitepaper en controleerbaar product",
    maxPoints: 10,
    requiredForThreshold: true,
    descriptionEn: "Primary technical documentation, rights, utility, architecture, risks and independently checkable claims.",
    descriptionNl: "Primaire technische documentatie, rechten, utility, architectuur, risico’s en onafhankelijk controleerbare claims.",
  },
  {
    id: "roadmap-execution",
    labelEn: "Roadmap and execution evidence",
    labelNl: "Roadmap en uitvoeringsbewijs",
    maxPoints: 10,
    requiredForThreshold: false,
    descriptionEn: "Dated roadmap, shipped milestones, repositories, releases, partnerships and explained delays.",
    descriptionNl: "Gedateerde roadmap, gerealiseerde mijlpalen, repositories, releases, partnerships en verklaarde vertragingen.",
  },
  {
    id: "team-transparency",
    labelEn: "Team and organizational transparency",
    labelNl: "Team- en organisatietransparantie",
    maxPoints: 10,
    requiredForThreshold: false,
    descriptionEn: "Responsible people, roles, ownership disclosures, contact routes and conflicts of interest.",
    descriptionNl: "Verantwoordelijke personen, rollen, eigendomsinformatie, contactroutes en belangenconflicten.",
  },
  {
    id: "market-data",
    labelEn: "Market and valuation data quality",
    labelNl: "Markt- en waarderingsdatakwaliteit",
    maxPoints: 5,
    requiredForThreshold: false,
    descriptionEn: "Reproducible price, circulating supply, market-cap assumptions, volume quality and timestamped sources.",
    descriptionNl: "Reproduceerbare prijs, circulerende supply, marketcap-aannames, volumekwaliteit en gedateerde bronnen.",
  },
];

const categoryMap = new Map(OTT_RESEARCH_CATEGORIES.map((category) => [category.id, category]));

export function calculateOttResearchScore(items: OttResearchScoreInput[]): OttResearchScoreResult {
  const normalized = OTT_RESEARCH_CATEGORIES.map((category) => {
    const item = items.find((candidate) => candidate.categoryId === category.id);
    const awarded = Math.min(category.maxPoints, Math.max(0, Math.round(item?.awardedPoints ?? 0)));
    return {
      category,
      awarded,
      evidenceStatus: item?.evidenceStatus ?? "missing" as OttEvidenceStatus,
      evidenceCount: Math.max(0, item?.evidenceCount ?? 0),
    };
  });

  const rawScore = normalized.reduce((sum, item) => sum + item.awarded, 0);
  const missingCriticalCategories = normalized
    .filter(({ category, evidenceStatus, evidenceCount }) => (
      category.requiredForThreshold
      && (evidenceStatus === "missing" || evidenceStatus === "unverified" || evidenceStatus === "conflict" || evidenceCount === 0)
    ))
    .map(({ category }) => category.id);

  const capReasons: string[] = [];
  let scoreCap: number | null = null;

  if (missingCriticalCategories.length > 0) {
    scoreCap = 54;
    capReasons.push(`Critical evidence is missing or unresolved: ${missingCriticalCategories.join(", ")}.`);
  }

  const issuer = normalized.find((item) => item.category.id === "issuer-ledger");
  if (!issuer || issuer.evidenceStatus === "conflict" || issuer.awarded === 0) {
    scoreCap = Math.min(scoreCap ?? 100, 34);
    capReasons.push("Issuer identity or ledger evidence is contradictory or absent.");
  }

  const legal = normalized.find((item) => item.category.id === "legal-jurisdiction");
  if (legal?.evidenceStatus === "conflict") {
    scoreCap = Math.min(scoreCap ?? 100, 34);
    capReasons.push("Legal identity or jurisdiction evidence contains unresolved contradictions.");
  }

  const finalScore = Math.min(rawScore, scoreCap ?? 100);

  return {
    rawScore,
    finalScore,
    threshold: OTT_RESEARCH_MINIMUM_SCORE,
    thresholdReached: finalScore >= OTT_RESEARCH_MINIMUM_SCORE,
    scoreCap,
    capReasons,
    missingCriticalCategories,
    label: getOttResearchScoreLabel(finalScore),
  };
}

export function getOttResearchScoreLabel(score: number): OttResearchScoreResult["label"] {
  if (score <= 34) return "insufficient";
  if (score <= 54) return "weak";
  if (score <= 69) return "researchable";
  if (score <= 84) return "documented";
  return "strongly-documented";
}

export function getOttResearchCategory(categoryId: OttResearchCategoryId) {
  return categoryMap.get(categoryId) ?? null;
}
