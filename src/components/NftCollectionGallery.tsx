import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Gift,
  LockKeyhole,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

export type NftCollectionCard = {
  id: string;
  image: string;
  titleEn: string;
  titleNl: string;
  descriptionEn: string;
  descriptionNl: string;
  supply: string;
  acquisitionEn: string;
  acquisitionNl: string;
  ruleEn: string;
  ruleNl: string;
  status: "reward" | "purchase" | "earned" | "planned";
};

type NftCollectionFilter = "all" | "access" | "earned" | "planned";

export const OTT_NFT_COLLECTIONS: NftCollectionCard[] = [
  {
    id: "genesis-access-pass",
    image: "/nft/artwork/genesis-access-pass.png",
    titleEn: "Genesis Access Pass",
    titleNl: "Genesis Access Pass",
    descriptionEn:
      "The limited founding and community-reward pass for people who materially help OTT move forward.",
    descriptionNl:
      "De beperkte founding- en communitybeloningspas voor mensen die OTT aantoonbaar vooruithelpen.",
    supply: "500",
    acquisitionEn: "Not for sale · granted by the founder or earned through a verified community campaign",
    acquisitionNl: "Niet te koop · toegekend door de founder of verdiend via een geverifieerde communitycampagne",
    ruleEn: "Maximum one Genesis Access Pass per XRPL wallet.",
    ruleNl: "Maximaal één Genesis Access Pass per XRPL-wallet.",
    status: "reward",
  },
  {
    id: "public-access-pass",
    image: "/nft/artwork/public-access-pass.png",
    titleEn: "Public Access Pass",
    titleNl: "Public Access Pass",
    descriptionEn:
      "The normal public utility pass for premium Academy content and selected terminal utility.",
    descriptionNl:
      "De normale publieke utilitypas voor premium Academy-content en geselecteerde terminalutility.",
    supply: "100,000",
    acquisitionEn: "1.589 XRP · payment and delivery are verified before access activates",
    acquisitionNl: "1,589 XRP · betaling en levering worden geverifieerd voordat toegang opent",
    ruleEn: "Payment alone never unlocks access; validated NFT ownership is required.",
    ruleNl: "Alleen betalen ontgrendelt niets; gevalideerd NFT-bezit is vereist.",
    status: "purchase",
  },
  {
    id: "wallet-tester-pass",
    image: "/nft/artwork/wallet-tester-pass.png",
    titleEn: "Wallet Tester Pass",
    titleNl: "Wallet Tester Pass",
    descriptionEn:
      "Recognition for a completed and server-verified OTT wallet-provider test.",
    descriptionNl:
      "Erkenning voor een voltooide en server-gevalideerde OTT-walletprovidertest.",
    supply: "100,000",
    acquisitionEn: "Earned only · one pass per wallet and verified provider test",
    acquisitionNl: "Alleen te verdienen · één pas per wallet en geverifieerde providertest",
    ruleEn: "The provider test must reach the required OTT verification score before eligibility opens.",
    ruleNl: "De providertest moet de vereiste OTT-verificatiescore halen voordat eligibility opent.",
    status: "earned",
  },
  {
    id: "xrpl-foundation-certificate",
    image: "/nft/artwork/xrpl-foundation-certificate.png",
    titleEn: "XRPL Foundation Certificate",
    titleNl: "XRPL Foundation-certificaat",
    descriptionEn:
      "A broad XRPL knowledge credential covering the ledger, accounts, assets and core concepts.",
    descriptionNl:
      "Een brede XRPL-kenniscredential over de ledger, accounts, assets en kernconcepten.",
    supply: "50,000",
    acquisitionEn: "Earned only · complete the verified XRPL Foundation learning path",
    acquisitionNl: "Alleen te verdienen · voltooi het geverifieerde XRPL Foundation-leerpad",
    ruleEn: "All required lessons and the minimum verified score must be complete.",
    ruleNl: "Alle verplichte lessen en de minimale geverifieerde score moeten zijn behaald.",
    status: "earned",
  },
  {
    id: "wallet-foundation-certificate",
    image: "/nft/artwork/wallet-foundation-certificate.png",
    titleEn: "Wallet Foundation Certificate",
    titleNl: "Wallet Foundation-certificaat",
    descriptionEn:
      "Accounts, wallet applications, addresses, reserves, custody, setup and recovery fundamentals.",
    descriptionNl:
      "Accounts, walletapps, adressen, reserves, custody, installatie en herstelprincipes.",
    supply: "100,000",
    acquisitionEn: "Earned only · verified module completion and linked wallet ownership",
    acquisitionNl: "Alleen te verdienen · geverifieerde modulevoltooiing en gekoppeld walletbezit",
    ruleEn: "One certificate per wallet and curriculum version.",
    ruleNl: "Eén certificaat per wallet en curriculumversie.",
    status: "earned",
  },
  {
    id: "wallet-security-certificate",
    image: "/nft/artwork/wallet-security-certificate.png",
    titleEn: "Wallet Security Certificate",
    titleNl: "Wallet Security-certificaat",
    descriptionEn:
      "Seed and private-key safety, recovery, phishing defence and transaction review.",
    descriptionNl:
      "Seed- en private-keyveiligheid, herstel, phishingverdediging en transactiecontrole.",
    supply: "100,000",
    acquisitionEn: "Earned only · pass the verified wallet-security assessment",
    acquisitionNl: "Alleen te verdienen · slaag voor de geverifieerde wallet-securitybeoordeling",
    ruleEn: "A UI click never counts as completion; assessment evidence must be stored server-side.",
    ruleNl: "Een UI-klik telt nooit als voltooiing; beoordelingsbewijs moet server-side zijn opgeslagen.",
    status: "earned",
  },
  {
    id: "wallet-operations-certificate",
    image: "/nft/artwork/wallet-operations-certificate.png",
    titleEn: "XRPL Wallet Operations Certificate",
    titleNl: "XRPL Wallet Operations-certificaat",
    descriptionEn:
      "Practical payments, trustlines, DEX, AMM, NFTs and verified on-ledger operations.",
    descriptionNl:
      "Praktische betalingen, trustlines, DEX, AMM, NFT's en geverifieerde on-ledgerhandelingen.",
    supply: "100,000",
    acquisitionEn: "Earned only · complete the validated practical lab and learning path",
    acquisitionNl: "Alleen te verdienen · voltooi het gevalideerde praktijklab en leerpad",
    ruleEn: "Production eligibility stays locked until the practical verification flow is fully proven.",
    ruleNl: "Productie-eligibility blijft vergrendeld totdat de praktische verificatieflow volledig is bewezen.",
    status: "planned",
  },
];

function collectionFilter(status: NftCollectionCard["status"]): Exclude<NftCollectionFilter, "all"> {
  if (status === "reward" || status === "purchase") return "access";
  if (status === "planned") return "planned";
  return "earned";
}

export function NftCollectionGallery({ compact = false }: { compact?: boolean }) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const [filter, setFilter] = useState<NftCollectionFilter>("all");

  const filteredCollections = useMemo(
    () => OTT_NFT_COLLECTIONS.filter((collection) => filter === "all" || collectionFilter(collection.status) === filter),
    [filter],
  );

  if (compact) {
    return (
      <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid items-stretch md:grid-cols-[220px_1fr]">
          <div className="bg-slate-950 p-4">
            <img
              src="/nft/overview/ott-nft-progression-overview.png"
              alt={isEnglish ? "Overview of the seven OTT NFT routes" : "Overzicht van de zeven OTT NFT-routes"}
              className="h-full min-h-40 w-full rounded-2xl object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">OTT NFT & Access</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {isEnglish ? "Your credentials have one clear home." : "Je credentials hebben één duidelijke plek."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {isEnglish
                ? "View the complete progression, all seven collections, eligibility rules and access status in the NFT & Access hub."
                : "Bekijk de volledige voortgang, alle zeven collecties, eligibilityregels en toegangsstatus in de NFT & Access-hub."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-800">2 Access</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">4 Earned</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">1 Planned</span>
            </div>
            <a
              href="/?tab=accessgate"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {isEnglish ? "Open NFT & Access" : "Open NFT & Access"}
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>
    );
  }

  const filters: Array<{ id: NftCollectionFilter; label: string; count: number }> = [
    { id: "all", label: isEnglish ? "All" : "Alles", count: OTT_NFT_COLLECTIONS.length },
    { id: "access", label: "Access", count: OTT_NFT_COLLECTIONS.filter((item) => collectionFilter(item.status) === "access").length },
    { id: "earned", label: isEnglish ? "Earned" : "Verdiend", count: OTT_NFT_COLLECTIONS.filter((item) => collectionFilter(item.status) === "earned").length },
    { id: "planned", label: isEnglish ? "Planned" : "Gepland", count: OTT_NFT_COLLECTIONS.filter((item) => collectionFilter(item.status) === "planned").length },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">OTT NFT & Access</p>
          <h2 className="mt-3 font-orbitron text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {isEnglish ? "Seven routes. One transparent progression." : "Zeven routes. Eén transparante voortgang."}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            {isEnglish
              ? "The overview, collection artwork, eligibility and supply now live together here. Open details only when you need them."
              : "Het overzicht, de collectie-artworks, eligibility en voorraad staan nu samen op één plek. Open details alleen wanneer je ze nodig hebt."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2" aria-label={isEnglish ? "Filter NFT collections" : "Filter NFT-collecties"}>
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                filter === item.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950"
              }`}
            >
              {item.label} · {item.count}
            </button>
          ))}
        </div>
      </div>

      <figure className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl">
        <img
          src="/nft/overview/ott-nft-progression-overview.png"
          alt={isEnglish ? "Overview of the seven OTT NFT progression routes" : "Overzicht van de zeven OTT NFT-voortgangsroutes"}
          className="h-auto w-full object-cover"
        />
      </figure>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {filteredCollections.map((collection) => (
          <article key={collection.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[104px_1fr] sm:grid-cols-[132px_1fr]">
              <div className="relative bg-slate-950 p-2 sm:p-3">
                <img
                  src={collection.image}
                  alt={isEnglish ? collection.titleEn : collection.titleNl}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/logo.png";
                    event.currentTarget.className = "h-full w-full rounded-2xl bg-slate-950 object-contain p-5";
                  }}
                  className="h-full min-h-44 w-full rounded-2xl object-cover object-top"
                />
              </div>

              <div className="min-w-0 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <StatusBadge status={collection.status} isEnglish={isEnglish} />
                    <h3 className="mt-3 font-orbitron text-base font-semibold text-slate-950 sm:text-lg">
                      {isEnglish ? collection.titleEn : collection.titleNl}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {isEnglish ? "Maximum edition" : "Maximale editie"}: {collection.supply}
                    </p>
                  </div>
                  <StatusIcon status={collection.status} />
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {isEnglish ? collection.descriptionEn : collection.descriptionNl}
                </p>

                <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-800">
                    {isEnglish ? "Eligibility and rules" : "Eligibility en regels"}
                  </summary>
                  <div className="border-t border-slate-200 px-4 py-4">
                    <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold leading-5 text-blue-950">
                      {isEnglish ? collection.acquisitionEn : collection.acquisitionNl}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-slate-700">
                      {isEnglish ? collection.ruleEn : collection.ruleNl}
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
        <Sparkles className="mt-0.5 shrink-0 text-blue-700" size={19} />
        <p>
          {isEnglish
            ? "Artwork is a preview. An NFT exists only after a validated XRPL mint, delivery and confirmed wallet ownership."
            : "Artwork is een preview. Een NFT bestaat pas na een gevalideerde XRPL-mint, levering en bevestigd walletbezit."}
        </p>
      </div>
    </section>
  );
}

function StatusBadge({ status, isEnglish }: { status: NftCollectionCard["status"]; isEnglish: boolean }) {
  const labels = {
    reward: isEnglish ? "Founder/community reward" : "Founder/communitybeloning",
    purchase: isEnglish ? "Public access route" : "Publieke toegangsroute",
    earned: isEnglish ? "Earned only" : "Alleen te verdienen",
    planned: isEnglish ? "Verification in progress" : "Verificatie in opbouw",
  } as const;

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">
      {labels[status]}
    </span>
  );
}

function StatusIcon({ status }: { status: NftCollectionCard["status"] }) {
  if (status === "reward") return <Gift className="shrink-0 text-fuchsia-700" size={21} aria-label="Reward" />;
  if (status === "purchase") return <ShoppingBag className="shrink-0 text-blue-700" size={21} aria-label="Access route" />;
  if (status === "earned") return <BadgeCheck className="shrink-0 text-emerald-700" size={21} aria-label="Earned credential" />;
  if (status === "planned") return <LockKeyhole className="shrink-0 text-slate-500" size={21} aria-label="Verification in progress" />;
  return <ShieldCheck className="shrink-0 text-blue-700" size={21} aria-label="Eligibility controlled" />;
}
