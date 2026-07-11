import { useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Gift,
  GraduationCap,
  LockKeyhole,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Store,
  TicketCheck,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type MarketplaceTabProps = {
  walletAddress?: string;
};

type ProductKind = "free" | "access" | "academy" | "merch";

type Product = {
  id: ProductKind;
  titleNl: string;
  titleEn: string;
  textNl: string;
  textEn: string;
  priceNl: string;
  priceEn: string;
  tagNl: string;
  tagEn: string;
  icon: ElementType;
  featuresNl: string[];
  featuresEn: string[];
};

const products: Product[] = [
  {
    id: "free",
    titleNl: "Free Terminal Account",
    titleEn: "Free Terminal Account",
    textNl: "Gratis instap met Xaman login, basis wallet, explorer en academy preview.",
    textEn: "Free entry with Xaman login, basic wallet, explorer and academy preview.",
    priceNl: "Gratis",
    priceEn: "Free",
    tagNl: "1/3 open",
    tagEn: "1/3 open",
    icon: Gift,
    featuresNl: ["Xaman login", "Basis wallet overzicht", "XRPL Explorer preview", "Academy intro"],
    featuresEn: ["Xaman login", "Basic wallet overview", "XRPL Explorer preview", "Academy intro"],
  },
  {
    id: "access",
    titleNl: "OTT Access Pass",
    titleEn: "OTT Access Pass",
    textNl: "Betaalde terminal toegang met NFT Access Pass fulfillment.",
    textEn: "Paid terminal access with NFT Access Pass fulfillment.",
    priceNl: "Betaald",
    priceEn: "Paid",
    tagNl: "2/3 premium",
    tagEn: "2/3 premium",
    icon: TicketCheck,
    featuresNl: ["Premium Academy", "Truth Desk", "Partner Hub", "Reward Ledger / XP"],
    featuresEn: ["Premium Academy", "Truth Desk", "Partner Hub", "Reward Ledger / XP"],
  },
  {
    id: "academy",
    titleNl: "Academy Course Bundle",
    titleEn: "Academy Course Bundle",
    textNl: "Gestructureerde XRPL e-learning met quiz, XP en certificaat-proof.",
    textEn: "Structured XRPL e-learning with quiz, XP and certificate proof.",
    priceNl: "Premium",
    priceEn: "Premium",
    tagNl: "Educatie",
    tagEn: "Education",
    icon: GraduationCap,
    featuresNl: ["XRPL Starter", "Xaman Safety", "SourceTag & Proof", "NFT Access uitleg"],
    featuresEn: ["XRPL Starter", "Xaman Safety", "SourceTag & Proof", "NFT Access explainer"],
  },
  {
    id: "merch",
    titleNl: "OnTheTrack Merch + NFT",
    titleEn: "OnTheTrack Merch + NFT",
    textNl: "Fysieke producten met digitale NFT badge en terminal perk.",
    textEn: "Physical products with digital NFT badge and terminal perk.",
    priceNl: "Shopify",
    priceEn: "Shopify",
    tagNl: "Merch",
    tagEn: "Merch",
    icon: ShoppingBag,
    featuresNl: ["OnTheTrack merch", "NFT bij aankoop", "Access perk mogelijk", "Purchase proof later"],
    featuresEn: ["OnTheTrack merch", "NFT with purchase", "Access perk possible", "Purchase proof later"],
  },
];

const steps = [
  { nl: "Kies product", en: "Choose product", textNl: "Free, Access Pass, Academy of merch.", textEn: "Free, Access Pass, Academy or merch.", icon: Store },
  { nl: "Koppel wallet", en: "Connect wallet", textNl: "Xaman wallet of wallet veld bij checkout.", textEn: "Xaman wallet or wallet field at checkout.", icon: Wallet },
  { nl: "Betaal / claim", en: "Pay / claim", textNl: "Shopify of Xaman route activeert toegang.", textEn: "Shopify or Xaman route activates access.", icon: CreditCard },
  { nl: "NFT fulfillment", en: "NFT fulfillment", textNl: "Access Pass of purchase badge veilig uitgeven.", textEn: "Issue Access Pass or purchase badge safely.", icon: PackageCheck },
];

export function MarketplaceTab({ walletAddress = "guest" }: MarketplaceTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const [selectedId, setSelectedId] = useState<ProductKind>("access");
  const [checkoutIntent, setCheckoutIntent] = useState<ProductKind | null>(null);
  const selected = products.find((product) => product.id === selectedId) ?? products[1];

  function prepareCheckout(productId: ProductKind) {
    setSelectedId(productId);
    setCheckoutIntent(productId);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.26),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6">
                <OTTLogo
                  size="lg"
                  subtitle={isEnglish ? "Access, academy and OnTheTrack products" : "Toegang, academy en OnTheTrack producten"}
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Store size={15} className="text-[#C83888]" />
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish ? "Marketplace V1.0" : "Webshop V1.0"}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Shop Access." : "Koop Toegang."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Unlock Terminal." : "Unlock Terminal."}
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? "V1 shop layer for free account, paid Access Pass, Academy bundles and OnTheTrack products. Shopify orders can later be linked to wallet-based NFT access."
                  : "V1 shoplaag voor gratis account, betaalde Access Pass, Academy bundels en OnTheTrack producten. Shopify orders kunnen later gekoppeld worden aan wallet-based NFT toegang."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                <MetricCard label={isEnglish ? "Free Access" : "Gratis toegang"} value="1/3" text={isEnglish ? "Open terminal" : "Open terminal"} icon={Gift} />
                <MetricCard label={isEnglish ? "Paid Access" : "Betaalde toegang"} value="2/3" text="Premium" icon={LockKeyhole} />
                <MetricCard label={isEnglish ? "Products" : "Producten"} value={String(products.length)} text={isEnglish ? "V1 catalog" : "V1 catalogus"} icon={ShoppingBag} />
                <MetricCard label="NFT" value="Utility" text={isEnglish ? "Access only" : "Alleen toegang"} icon={BadgeCheck} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {isEnglish ? "Checkout Status" : "Checkout Status"}
                  </p>
                  <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">V1 Prep</p>
                  </div>
                </div>

                <div className="mb-4">
                  <OTTProofBadge sourceTag="2606170002" />
                </div>

                <div className="space-y-3">
                  <InfoRow label="Wallet" value={walletAddress === "guest" ? "Guest / Free Preview" : walletAddress} />
                  <InfoRow label={isEnglish ? "Selected" : "Gekozen"} value={isEnglish ? selected.titleEn : selected.titleNl} />
                  <InfoRow label="Shopify" value={isEnglish ? "Webhook next" : "Webhook volgt"} />
                  <InfoRow label="Access" value={checkoutIntent ? "Checkout intent ready" : "Select product"} />
                </div>

                <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-[#C83888] mt-0.5 shrink-0" />
                    <p className="font-mono text-xs text-black/60 leading-relaxed">
                      {isEnglish
                        ? "NFTs are utility access or purchase proof only. No yield, no value promise and no investment language."
                        : "NFTs zijn alleen utility toegang of aankoop-proof. Geen yield, geen waardebelofte en geen investment-taal."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-8">
            {steps.map((step, index) => (
              <StepCard key={step.en} number={`0${index + 1}`} step={step} language={language} />
            ))}
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8">
            <Panel title={isEnglish ? "V1 Product Catalog" : "V1 Productcatalogus"} icon={ShoppingBag}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    language={language}
                    selected={selectedId === product.id}
                    onSelect={() => setSelectedId(product.id)}
                    onPrepareCheckout={() => prepareCheckout(product.id)}
                  />
                ))}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel title={isEnglish ? "Selected Product" : "Gekozen Product"} icon={ReceiptText}>
              <SelectedProduct product={selected} language={language} />

              <button
                onClick={() => prepareCheckout(selected.id)}
                className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all mt-5"
              >
                {selected.id === "free"
                  ? isEnglish
                    ? "Activate Free Account"
                    : "Activeer Gratis Account"
                  : isEnglish
                    ? "Prepare Checkout"
                    : "Bereid Checkout Voor"}
              </button>

              {checkoutIntent && (
                <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 p-4 mt-4">
                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {isEnglish
                      ? "Checkout intent prepared. Next build connects this to Shopify product links, wallet capture and server-side access records."
                      : "Checkout intent voorbereid. Volgende build koppelt dit aan Shopify productlinks, wallet capture en server-side access records."}
                  </p>
                </div>
              )}
            </Panel>

            <Panel title={isEnglish ? "Shopify Build Order" : "Shopify Bouwvolgorde"} icon={ExternalLink}>
              <div className="space-y-3">
                <RoadmapLine text={isEnglish ? "Create Shopify products." : "Shopify producten aanmaken."} />
                <RoadmapLine text={isEnglish ? "Add wallet field or claim page." : "Wallet veld of claimpagina toevoegen."} />
                <RoadmapLine text={isEnglish ? "Webhook sends paid order to OTT backend." : "Webhook stuurt betaalde order naar OTT backend."} />
                <RoadmapLine text={isEnglish ? "Backend unlocks paid access." : "Backend opent betaalde toegang."} />
                <RoadmapLine text={isEnglish ? "NFT fulfillment queue issues pass/badge." : "NFT fulfillment queue geeft pass/badge uit."} />
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function SelectedProduct({ product, language }: { product: Product; language: "nl" | "en" }) {
  const isEnglish = language === "en";
  const Icon = product.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-5">
      <div className="flex items-start gap-3 mb-4">
        <Icon size={22} className="text-[#C83888] shrink-0 mt-0.5" />
        <div>
          <p className="font-orbitron text-sm font-black uppercase text-black mb-2">
            {isEnglish ? product.titleEn : product.titleNl}
          </p>
          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {isEnglish ? product.textEn : product.textNl}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {(isEnglish ? product.featuresEn : product.featuresNl).map((feature) => (
          <FeatureLine key={feature} text={feature} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  language,
  selected,
  onSelect,
  onPrepareCheckout,
}: {
  product: Product;
  language: "nl" | "en";
  selected: boolean;
  onSelect: () => void;
  onPrepareCheckout: () => void;
}) {
  const isEnglish = language === "en";
  const Icon = product.icon;

  return (
    <div className={`border p-5 transition-all ${selected ? "border-[#C83888] bg-[#C83888]/10" : "border-black/10 bg-[#F7F8FC]"}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="w-12 h-12 border border-black/10 bg-white flex items-center justify-center">
          <Icon size={22} className={product.id === "free" ? "text-[#3898E8]" : "text-[#C83888]"} />
        </div>
        <div className="border border-black/10 bg-white px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-black/45">
            {isEnglish ? product.tagEn : product.tagNl}
          </p>
        </div>
      </div>

      <p className="font-orbitron text-lg font-black uppercase text-black mb-2">
        {isEnglish ? product.titleEn : product.titleNl}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed mb-5">
        {isEnglish ? product.textEn : product.textNl}
      </p>

      <div className="space-y-3 mb-5">
        {(isEnglish ? product.featuresEn : product.featuresNl).map((feature) => (
          <FeatureLine key={feature} text={feature} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-1">
            {isEnglish ? "Price" : "Prijs"}
          </p>
          <p className="font-orbitron text-sm font-black uppercase">
            {isEnglish ? product.priceEn : product.priceNl}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={onSelect} className="border border-black/10 bg-white px-4 py-3 hover:bg-[#F7F8FC] transition-all">
            <span className="font-orbitron text-[10px] font-black uppercase">
              {isEnglish ? "View" : "Bekijk"}
            </span>
          </button>

          <button onClick={onPrepareCheckout} className="bg-black text-white px-4 py-3 hover:bg-[#080808]/80 transition-all">
            <span className="font-orbitron text-[10px] font-black uppercase">
              {product.id === "free" ? "Claim" : isEnglish ? "Buy" : "Koop"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  number,
  step,
  language,
}: {
  number: string;
  step: (typeof steps)[number];
  language: "nl" | "en";
}) {
  const isEnglish = language === "en";
  const Icon = step.icon;

  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-orbitron text-xs font-black text-[#C83888]">{number}</p>
        <Icon size={16} className="text-black/35" />
      </div>
      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {isEnglish ? step.en : step.nl}
      </p>
      <p className="font-mono text-[10px] text-black/45 leading-relaxed">
        {isEnglish ? step.textEn : step.textNl}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  text,
  icon: Icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
}) {
  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{label}</p>
      <p className="font-orbitron text-xl font-black uppercase mb-1 break-all">{value}</p>
      <p className="font-mono text-[10px] text-black/35 uppercase">{text}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />
        <p className="font-orbitron text-xs uppercase tracking-widest">{title}</p>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{label}</p>
      <p className="font-orbitron text-xs font-black uppercase break-all">{value}</p>
    </div>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 size={14} className="text-[#3898E8] shrink-0 mt-0.5" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function RoadmapLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <BadgeCheck size={14} className="text-[#C83888] shrink-0" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}
