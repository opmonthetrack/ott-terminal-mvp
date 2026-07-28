import { BadgeCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

export type NftCollectionCard = {
  id: string;
  image: string;
  titleEn: string;
  titleNl: string;
  descriptionEn: string;
  descriptionNl: string;
  supply: string;
  ruleEn: string;
  ruleNl: string;
  status: "live" | "eligible" | "locked";
};

export const OTT_NFT_COLLECTIONS: NftCollectionCard[] = [
  {
    id: "genesis-access-pass",
    image: "/nft/genesis-access-pass.svg",
    titleEn: "Genesis Access Pass",
    titleNl: "Genesis Access Pass",
    descriptionEn: "The limited founding utility edition. Existing scarcity remains #001–#500.",
    descriptionNl: "De beperkte founding-utilityeditie. De bestaande schaarste blijft #001–#500.",
    supply: "500",
    ruleEn: "Minted only after validated 1.589 XRP payment and ownership delivery.",
    ruleNl: "Alleen gemint na gevalideerde betaling van 1.589 XRP en eigendomsoverdracht.",
    status: "live",
  },
  {
    id: "wallet-tester-pass",
    image: "/nft/wallet-tester-pass.svg",
    titleEn: "Wallet Tester Pass",
    titleNl: "Wallet Tester Pass",
    descriptionEn: "Proof that a signed OTT wallet test was validated on XRPL.",
    descriptionNl: "Bewijs dat een ondertekende OTT-wallettest op XRPL is gevalideerd.",
    supply: "100,000",
    ruleEn: "Mint eligibility unlocks only when the tested connector reaches 100% OTT verification.",
    ruleNl: "Minttoegang opent pas wanneer de geteste connector 100% OTT-verificatie bereikt.",
    status: "eligible",
  },
  {
    id: "xrpl-foundation",
    image: "/nft/xrpl-foundation.svg",
    titleEn: "XRPL Foundation Certificate",
    titleNl: "XRPL Foundation-certificaat",
    descriptionEn: "A completion credential for the broad XRPL foundation curriculum.",
    descriptionNl: "Een voltooiingscredential voor het brede XRPL-fundamenttraject.",
    supply: "50,000",
    ruleEn: "Requires all verified lessons and the minimum average score.",
    ruleNl: "Vereist alle geverifieerde lessen en de minimale gemiddelde score.",
    status: "eligible",
  },
  {
    id: "wallet-foundation",
    image: "/nft/wallet-foundation.svg",
    titleEn: "Wallet Foundation",
    titleNl: "Walletfundament",
    descriptionEn: "Account, address, reserve and custody-model knowledge.",
    descriptionNl: "Kennis van account, adres, reserve en custody-modellen.",
    supply: "100,000",
    ruleEn: "Requires verified module completion and linked wallet ownership.",
    ruleNl: "Vereist geverifieerde modulevoltooiing en gekoppeld walletbezit.",
    status: "eligible",
  },
  {
    id: "wallet-security",
    image: "/nft/wallet-security.svg",
    titleEn: "Wallet Security",
    titleNl: "Walletbeveiliging",
    descriptionEn: "Safe recovery, payload review, keys and phishing response.",
    descriptionNl: "Veilig herstel, payloadcontrole, sleutels en phishingrespons.",
    supply: "100,000",
    ruleEn: "Requires verified security assessment completion.",
    ruleNl: "Vereist voltooiing van de geverifieerde beveiligingsbeoordeling.",
    status: "eligible",
  },
  {
    id: "wallet-operations",
    image: "/nft/wallet-operations.svg",
    titleEn: "XRPL Wallet Operations",
    titleNl: "XRPL-walletgebruik",
    descriptionEn: "Testnet practice with payments, tokens, DEX, AMM and NFTs.",
    descriptionNl: "Testnetpraktijk met betalingen, tokens, DEX, AMM en NFT's.",
    supply: "100,000",
    ruleEn: "Requires the validated Testnet lab and module completion.",
    ruleNl: "Vereist het gevalideerde Testnetlab en modulevoltooiing.",
    status: "locked",
  },
];

export function NftCollectionGallery({ compact = false }: { compact?: boolean }) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-blue-700">OTT XRPL credentials</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {isEnglish ? "See the NFT before you earn or mint it" : "Bekijk het NFT voordat je het verdient of mint"}
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {isEnglish
            ? "Every collection has its own visual, supply and server-verified eligibility rule. A button click never counts as an issued NFT."
            : "Iedere collectie heeft een eigen visual, voorraad en server-gevalideerde toegangsregel. Een knopklik telt nooit als uitgegeven NFT."}
        </p>
      </div>

      <div className={`mt-8 grid gap-6 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {OTT_NFT_COLLECTIONS.map((collection) => (
          <article key={collection.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img src={collection.image} alt="" className="aspect-square w-full bg-slate-950 object-cover" />
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{isEnglish ? collection.titleEn : collection.titleNl}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {isEnglish ? "Maximum edition" : "Maximale editie"}: {collection.supply}
                  </p>
                </div>
                <StatusIcon status={collection.status} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {isEnglish ? collection.descriptionEn : collection.descriptionNl}
              </p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-700">
                {isEnglish ? collection.ruleEn : collection.ruleNl}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusIcon({ status }: { status: NftCollectionCard["status"] }) {
  if (status === "live") return <BadgeCheck className="shrink-0 text-emerald-700" size={22} aria-label="Live" />;
  if (status === "eligible") return <ShieldCheck className="shrink-0 text-blue-700" size={22} aria-label="Eligibility controlled" />;
  return <LockKeyhole className="shrink-0 text-slate-500" size={22} aria-label="Locked" />;
}
