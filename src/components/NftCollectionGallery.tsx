import {
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

export const OTT_NFT_COLLECTIONS: NftCollectionCard[] = [
  {
    id: "genesis-access-pass",
    image: "/nft/artwork/genesis-access-pass.webp",
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
    image: "/nft/artwork/public-access-pass.webp",
    titleEn: "Public Access Pass",
    titleNl: "Public Access Pass",
    descriptionEn:
      "The normal public utility pass for premium Academy content and selected terminal utility.",
    descriptionNl:
      "De normale publieke utilitypas voor premium Academy-content en geselecteerde terminalutility.",
    supply: "100,000",
    acquisitionEn: "0.589 XRP or 1.00 RLUSD · checkout activates only after final issuer and delivery validation",
    acquisitionNl: "0,589 XRP of 1,00 RLUSD · checkout opent pas na definitieve issuer- en leveringsvalidatie",
    ruleEn: "Payment alone never unlocks access; validated NFT ownership is required.",
    ruleNl: "Alleen betalen ontgrendelt niets; gevalideerd NFT-bezit is vereist.",
    status: "purchase",
  },
  {
    id: "wallet-tester-pass",
    image: "/nft/artwork/wallet-tester-pass.webp",
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
    image: "/nft/artwork/xrpl-foundation-certificate.webp",
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
    image: "/nft/artwork/wallet-foundation-certificate.webp",
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
    image: "/nft/artwork/wallet-security-certificate.webp",
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
    image: "/nft/artwork/wallet-operations-certificate.webp",
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

export function NftCollectionGallery({ compact = false }: { compact?: boolean }) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold text-blue-700">OTT XRPL credentials</p>
        <h2 className="mt-3 font-orbitron text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {isEnglish ? "Seven NFT routes. One transparent progression." : "Zeven NFT-routes. Eén transparante voortgang."}
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {isEnglish
            ? "Every collection has its own artwork, maximum supply and eligibility rule. Artwork in the interface is a preview; an NFT exists only after a validated XRPL mint and confirmed wallet ownership."
            : "Iedere collectie heeft eigen artwork, maximale voorraad en eligibilityregel. Artwork in de interface is een preview; een NFT bestaat pas na een gevalideerde XRPL-mint en bevestigd walletbezit."}
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl">
        <img
          src="/nft/overview/ott-nft-progression-overview.webp"
          alt={isEnglish ? "Overview of the seven OTT NFT progression routes" : "Overzicht van de zeven OTT NFT-voortgangsroutes"}
          className="h-auto w-full object-cover"
        />
      </div>

      <div className={`mt-8 grid gap-6 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {OTT_NFT_COLLECTIONS.map((collection) => (
          <article key={collection.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-slate-950">
              <img
                src={collection.image}
                alt={isEnglish ? collection.titleEn : collection.titleNl}
                loading="lazy"
                className="aspect-[1055/1491] w-full object-cover"
              />
              <div className="absolute left-4 top-4">
                <StatusBadge status={collection.status} isEnglish={isEnglish} />
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-orbitron text-lg font-semibold text-slate-950">
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

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs font-semibold leading-5 text-blue-950">
                {isEnglish ? collection.acquisitionEn : collection.acquisitionNl}
              </div>

              <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-700">
                {isEnglish ? collection.ruleEn : collection.ruleNl}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
        <Sparkles className="mt-0.5 shrink-0 text-blue-700" size={19} />
        <p>
          {isEnglish
            ? "The full-resolution PNG masters remain the source artwork. These optimized previews keep the terminal fast on mobile without changing the NFT design."
            : "De PNG-masters op volledige resolutie blijven het bronartwork. Deze geoptimaliseerde previews houden de terminal snel op mobiel zonder het NFT-ontwerp te wijzigen."}
        </p>
      </div>
    </section>
  );
}

function StatusBadge({ status, isEnglish }: { status: NftCollectionCard["status"]; isEnglish: boolean }) {
  const labels = {
    reward: isEnglish ? "Founder/community reward" : "Founder/communitybeloning",
    purchase: isEnglish ? "Public purchase route" : "Publieke aankooproute",
    earned: isEnglish ? "Earned only" : "Alleen te verdienen",
    planned: isEnglish ? "Verification in progress" : "Verificatie in opbouw",
  } as const;

  return (
    <span className="rounded-full border border-white/25 bg-slate-950/80 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur">
      {labels[status]}
    </span>
  );
}

function StatusIcon({ status }: { status: NftCollectionCard["status"] }) {
  if (status === "reward") return <Gift className="shrink-0 text-fuchsia-700" size={22} aria-label="Reward" />;
  if (status === "purchase") return <ShoppingBag className="shrink-0 text-blue-700" size={22} aria-label="Purchase route" />;
  if (status === "earned") return <BadgeCheck className="shrink-0 text-emerald-700" size={22} aria-label="Earned credential" />;
  if (status === "planned") return <LockKeyhole className="shrink-0 text-slate-500" size={22} aria-label="Verification in progress" />;
  return <ShieldCheck className="shrink-0 text-blue-700" size={22} aria-label="Eligibility controlled" />;
}
