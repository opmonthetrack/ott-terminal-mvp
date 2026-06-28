import { useState } from "react";
import type { ElementType } from "react";
import {
  BadgeCheck,
  Boxes,
  CheckCircle2,
  Coins,
  CreditCard,
  Gift,
  Gem,
  GraduationCap,
  Layers,
  Lock,
  Package,
  Receipt,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Ticket,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";

type MarketCategory = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type MarketItem = {
  title: string;
  category: string;
  price: string;
  status: string;
  text: string;
};

type CheckoutRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const categories: MarketCategory[] = [
  {
    id: "merch",
    title: "OTT Merch",
    status: "Shop",
    text: "Caps, shirts, hoodies, stickers en physical drops voor de OTT community.",
    icon: ShoppingBag,
  },
  {
    id: "badges",
    title: "NFT Badges",
    status: "Proof",
    text: "Achievement badges, member proof, Academy certificates en event access.",
    icon: BadgeCheck,
  },
  {
    id: "courses",
    title: "Courses",
    status: "Learn",
    text: "XRPL, wallet safety, DeFi, AI, tokenization en builder education.",
    icon: GraduationCap,
  },
  {
    id: "tickets",
    title: "Event Tickets",
    status: "Access",
    text: "Meetups, livestreams, workshops, AMAs, hackathon sessions en partner events.",
    icon: Ticket,
  },
  {
    id: "rewards",
    title: "Reward Store",
    status: "XP",
    text: "Gebruik XP, streaks en badges later voor toegang, perks en community rewards.",
    icon: Gift,
  },
  {
    id: "partners",
    title: "Partner Offers",
    status: "Later",
    text: "Partner tools, builder services, ecosystem perks en curated XRPL resources.",
    icon: Store,
  },
];

const items: MarketItem[] = [
  {
    title: "OTT Founder Badge",
    category: "NFT Badges",
    price: "260 XP",
    status: "Mock",
    text: "Early supporter badge voor OTT Terminal testers en Make Waves users.",
  },
  {
    title: "XRPL Starter Course",
    category: "Courses",
    price: "Free",
    status: "Academy",
    text: "Beginner course voor wallets, XRP Ledger basics en safe onboarding.",
  },
  {
    title: "Make Waves Ticket",
    category: "Event Tickets",
    price: "589 XP",
    status: "Soon",
    text: "Toegang tot community demo, AMA of builder session rond source tag 2606.",
  },
  {
    title: "OTT Black Cap",
    category: "OTT Merch",
    price: "€29",
    status: "Concept",
    text: "Minimal black/white OTT cap voor community merch drops.",
  },
  {
    title: "Wallet Guardian Badge",
    category: "NFT Badges",
    price: "Safety XP",
    status: "Locked",
    text: "Badge voor gebruikers die wallet safety en trustline lessons afronden.",
  },
  {
    title: "Builder Toolkit",
    category: "Partner Offers",
    price: "Partner",
    status: "Later",
    text: "Curated tools voor XRPL builders, xApps, APIs en secure backend flows.",
  },
];

const checkoutRules: CheckoutRule[] = [
  {
    title: "No Hidden Payments",
    status: "Rule",
    text: "Elke echte betaling moet zichtbaar zijn voordat de gebruiker bevestigt.",
    icon: ShieldCheck,
  },
  {
    title: "Wallet Confirmation",
    status: "Required",
    text: "XRPL betalingen of claims gaan later alleen via wallet confirmation.",
    icon: Wallet,
  },
  {
    title: "Clear Price",
    status: "Rule",
    text: "Prijs, asset, issuer, fees en voorwaarden moeten vooraf duidelijk zijn.",
    icon: Receipt,
  },
  {
    title: "Digital Proof",
    status: "Later",
    text: "Badges, tickets en certificates kunnen later als XRPL proof worden uitgegeven.",
    icon: Gem,
  },
];

const roadmap = [
  "Product cards bouwen",
  "XP reward store koppelen",
  "Academy badges toevoegen",
  "Event ticket flow maken",
  "NFT certificate preview bouwen",
  "Xaman checkout later koppelen",
  "Partner marketplace openen",
  "Order history per wallet tonen",
];

export function MarketplaceTab() {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>(
    categories[0]
  );
  const [selectedItem, setSelectedItem] = useState<MarketItem>(items[0]);

  const SelectedCategoryIcon = selectedCategory.icon;

  const filteredItems = items.filter(
    (item) => item.category === selectedCategory.title
  );

  const visibleItems = filteredItems.length > 0 ? filteredItems : items.slice(0, 4);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <ShoppingBag size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Marketplace
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Rewards. Merch. Badges. Access.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De marketplace-laag van OTT Terminal. Hier komen merch, NFT badges,
              Academy certificates, tickets, XP rewards, partner offers en veilige
              checkout flows samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Boxes} label="Items" value="24+" />
            <StatBox icon={Zap} label="XP Store" value="Ready" />
            <StatBox icon={Ticket} label="Tickets" value="Soon" />
            <StatBox icon={ShieldCheck} label="Checkout" value="Safe" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Categories
              </p>
            </div>

            <div className="space-y-3">
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  active={selectedCategory.id === category.id}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Category
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedCategory.title}
                </h3>
              </div>

              <SelectedCategoryIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedCategory.text}
            </p>

            <MiniStatus label="Status" value={selectedCategory.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Items
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Marketplace Feed
                </h3>
              </div>

              <Search size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {visibleItems.map((item) => (
                <ItemRow
                  key={`${item.title}-${item.category}`}
                  item={item}
                  active={selectedItem.title === item.title}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Package size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Item
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedItem.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedItem.category} • {selectedItem.status}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedItem.text}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus label="Price" value={selectedItem.price} />
              <MiniStatus label="Status" value={selectedItem.status} />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Checkout Rules
              </p>
            </div>

            <div className="space-y-3">
              {checkoutRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Logic
              </p>
            </div>

            <div className="space-y-3">
              <RewardLine icon={Star} label="XP unlocks access" />
              <RewardLine icon={Flame} label="Streak boosts rewards" />
              <RewardLine icon={BadgeCheck} label="Badges unlock drops" />
              <RewardLine icon={Coins} label="OTT utility later" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {roadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={ShoppingBag} title="Merch" text="OTT product drops" />
          <FeatureBox icon={BadgeCheck} title="Badges" text="Proof and access" />
          <FeatureBox icon={Ticket} title="Tickets" text="Events and AMAs" />
          <FeatureBox icon={Wallet} title="Checkout" text="Xaman later" />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function CategoryButton({
  category,
  active,
  onClick,
}: {
  category: MarketCategory;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {category.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {category.status}
        </p>
      </div>
    </button>
  );
}

function ItemRow({
  item,
  active,
  onClick,
}: {
  item: MarketItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-orbitron text-sm font-bold uppercase">
          {item.title}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {item.price}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {item.category} • {item.status}
      </p>
    </button>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function RuleCard({ rule }: { rule: CheckoutRule }) {
  const Icon = rule.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {rule.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {rule.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {rule.text}
      </p>
    </div>
  );
}

function RewardLine({
  icon: Icon,
  label,
}: {
  icon: ElementType;
  label: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <Icon size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function FeatureBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40">{text}</p>
    </div>
  );
}
