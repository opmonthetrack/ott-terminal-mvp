import type { ElementType } from "react";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  Coins,
  CreditCard,
  Gift,
  GraduationCap,
  Lock,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Ticket,
  Wallet,
} from "lucide-react";

type MarketItem = {
  title: string;
  category: string;
  price: string;
  status: string;
  description: string;
  icon: ElementType;
};

type PaymentOption = {
  title: string;
  status: string;
  description: string;
  icon: ElementType;
};

const marketItems: MarketItem[] = [
  {
    title: "OTT Founder Pass",
    category: "Membership NFT",
    price: "Coming Soon",
    status: "Locked",
    description:
      "Early supporter badge met toekomstige toegang tot private updates, founder rewards en community governance.",
    icon: BadgeCheck,
  },
  {
    title: "XRPL Academy Certificate",
    category: "Education",
    price: "XP Claim",
    status: "Soon",
    description:
      "Certificaat voor gebruikers die Academy tracks afronden en hun kennis willen bewijzen.",
    icon: GraduationCap,
  },
  {
    title: "OTT Terminal Hoodie",
    category: "Merch",
    price: "Fiat / XRP Later",
    status: "Planned",
    description:
      "Premium OnTheTrack merchandise voor community, events en XRPL meetups.",
    icon: ShoppingBag,
  },
  {
    title: "Daily Streak Reward",
    category: "Reward",
    price: "Free Claim",
    status: "Soon",
    description:
      "Beloning voor gebruikers die dagelijks terugkomen, leren en interactie hebben met de terminal.",
    icon: Gift,
  },
  {
    title: "XRPL Starter Course",
    category: "Course",
    price: "Free / Premium",
    status: "Planned",
    description:
      "Betaalde of gratis cursus voor beginners, retailers en ondernemers die XRPL willen begrijpen.",
    icon: BookOpen,
  },
  {
    title: "Event Access Ticket",
    category: "Events",
    price: "XRP / RLUSD Later",
    status: "Future",
    description:
      "Digitale tickets voor webinars, workshops, community calls en live XRPL sessions.",
    icon: Ticket,
  },
];

const paymentOptions: PaymentOption[] = [
  {
    title: "Fiat Payments",
    status: "Standard",
    description: "Voor normale gebruikers en retailers die nog niet crypto-native zijn.",
    icon: CreditCard,
  },
  {
    title: "XRP Payments",
    status: "XRPL",
    description: "Voor snelle betalingen met lage kosten binnen het XRPL ecosysteem.",
    icon: Wallet,
  },
  {
    title: "RLUSD Payments",
    status: "Stablecoin",
    description: "Voor stabiele prijsstelling, subscriptions en business use cases.",
    icon: ShieldCheck,
  },
  {
    title: "OTT Token Utility",
    status: "Future",
    description: "Voor korting, rewards, access, staking en community benefits.",
    icon: Coins,
  },
];

const marketplaceRoadmap = [
  "Start met mock marketplace in de MVP",
  "Voeg merch, courses, badges en rewards toe",
  "Koppel Academy progress aan certificaten",
  "Maak XP redeemable voor kortingen en badges",
  "Voeg later Xaman payment flows toe",
  "Voeg XRP en RLUSD checkout toe",
  "Voeg OTT Token utility toe",
  "Bouw partner marketplace voor XRPL projecten",
];

export function MarketplaceTab() {
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
              Rewards. Merch. Access.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De commerciële laag van de OTT Terminal. Hier komen merchandise,
              courses, NFT badges, event tickets, certificaten, XP rewards en
              toekomstige betalingen met fiat, XRP, RLUSD en OTT Token samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Package} label="Items" value="6" />
            <StatBox icon={Coins} label="Payments" value="4" />
            <StatBox icon={Star} label="XP Rewards" value="Soon" />
            <StatBox icon={Sparkles} label="Utility" value="Future" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Marketplace Items
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Products & Rewards
                </h3>
              </div>

              <Package size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {marketItems.map((item) => (
                <MarketItemCard key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Payment Layer
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Checkout Options
                </h3>
              </div>

              <CreditCard size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentOptions.map((option) => (
                <PaymentCard key={option.title} option={option} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Tag size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                XP Utility
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              XP begint off-chain als veilige reputatie- en engagementlaag.
              Later kan XP worden gebruikt voor kortingen, badges, claims,
              challenges en community access.
            </p>

            <div className="space-y-3">
              <UtilityLine label="Discount unlocks" />
              <UtilityLine label="Badge claims" />
              <UtilityLine label="Course progress" />
              <UtilityLine label="Leaderboard access" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Locked Until Safe
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Echte betalingen, claims en token utility komen pas nadat wallet
              flows, user consent, anti-bot bescherming en duidelijke
              voorwaarden goed staan.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {marketplaceRoadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Award} title="NFT Badges" text="Proof of learning" />
          <FeatureBox icon={Gift} title="Rewards" text="Daily engagement" />
          <FeatureBox icon={ShoppingBag} title="Merch" text="OTT products" />
          <FeatureBox icon={Coins} title="Token Utility" text="Future layer" />
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

      <p className="font-orbitron text-lg font-black uppercase">{value}</p>
    </div>
  );
}

function MarketItemCard({ item }: { item: MarketItem }) {
  const Icon = item.icon;
  const isLocked = item.status === "Locked";

  return (
    <div className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {item.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-2">
        {item.title}
      </h4>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
        {item.category}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed mb-4">
        {item.description}
      </p>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <p className="font-orbitron text-xs font-black uppercase">
          {item.price}
        </p>

        {isLocked ? (
          <Lock size={15} className="text-white/30" />
        ) : (
          <ArrowUpRight size={15} className="text-white/30" />
        )}
      </div>
    </div>
  );
}

function PaymentCard({ option }: { option: PaymentOption }) {
  const Icon = option.icon;

  return (
    <div className="border border-white/10 bg-black p-5">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {option.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-3">
        {option.title}
      </h4>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {option.description}
      </p>
    </div>
  );
}

function UtilityLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <Star size={14} className="text-white/60" />
      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <p className="font-mono text-xs text-white/45 leading-relaxed">{label}</p>
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
