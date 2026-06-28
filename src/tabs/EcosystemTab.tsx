import type { ElementType } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Building2,
  CalendarDays,
  Code2,
  Coins,
  Compass,
  Gem,
  Globe2,
  GraduationCap,
  Handshake,
  Layers,
  Map,
  Network,
  Newspaper,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

type EcosystemProject = {
  title: string;
  category: string;
  status: string;
  description: string;
  icon: ElementType;
};

type EcosystemCategory = {
  label: string;
  count: string;
  icon: ElementType;
};

type Opportunity = {
  title: string;
  type: string;
  status: string;
};

const projects: EcosystemProject[] = [
  {
    title: "Wallets",
    category: "User Access",
    status: "Core",
    description:
      "Xaman, Crossmark en andere wallet-lagen die gebruikers toegang geven tot XRPL.",
    icon: Wallet,
  },
  {
    title: "Stablecoins",
    category: "Payments",
    status: "Priority",
    description:
      "RLUSD, USDC en andere stablecoin rails voor betalingen, handel en business use cases.",
    icon: Coins,
  },
  {
    title: "DeFi & AMM",
    category: "Liquidity",
    status: "Build",
    description:
      "AMM pools, liquidity providers, swaps, LP rewards en DeFi-dashboarding binnen XRPL.",
    icon: Layers,
  },
  {
    title: "NFTs & Badges",
    category: "Identity",
    status: "Soon",
    description:
      "NFT badges, membership passes, certificates en proof-of-learning voor gebruikers.",
    icon: Gem,
  },
  {
    title: "AI Tools",
    category: "Intelligence",
    status: "Watch",
    description:
      "AI assistants, risk scanners, prompt libraries, developer helpers en agentic payments.",
    icon: Bot,
  },
  {
    title: "Builders",
    category: "Developer Ecosystem",
    status: "Open",
    description:
      "Developers, founders, hackathon teams en product studios die bouwen op XRPL.",
    icon: Code2,
  },
];

const categories: EcosystemCategory[] = [
  {
    label: "Wallets",
    count: "Access",
    icon: Wallet,
  },
  {
    label: "Payments",
    count: "Rails",
    icon: Zap,
  },
  {
    label: "DeFi",
    count: "AMM",
    icon: Layers,
  },
  {
    label: "NFTs",
    count: "Badges",
    icon: Gem,
  },
  {
    label: "AI",
    count: "Tools",
    icon: Bot,
  },
  {
    label: "Education",
    count: "Academy",
    icon: GraduationCap,
  },
  {
    label: "Retail",
    count: "Adoption",
    icon: Store,
  },
  {
    label: "Enterprise",
    count: "B2B",
    icon: Building2,
  },
];

const opportunities: Opportunity[] = [
  {
    title: "XRPL Commons Make Waves",
    type: "Challenge",
    status: "Active",
  },
  {
    title: "Founder / Developer Collaboration",
    type: "Team",
    status: "Open",
  },
  {
    title: "Retailer Education Pilots",
    type: "Adoption",
    status: "Planned",
  },
  {
    title: "AI + XRPL Research",
    type: "Research",
    status: "Build",
  },
  {
    title: "Academy Content Partners",
    type: "Education",
    status: "Soon",
  },
];

const ecosystemRoadmap = [
  "Maak een XRPL project directory",
  "Voeg wallet, DeFi, NFT, AI en stablecoin categorieën toe",
  "Voeg projectprofielen en uitlegpagina's toe",
  "Voeg ratings, risk labels en education links toe",
  "Voeg builders, grants, events en jobs toe",
  "Voeg AI-samenvattingen per project toe",
  "Voeg partner onboarding toe",
  "Maak OTT de startpagina voor XRPL discovery",
];

export function EcosystemTab() {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Compass size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL Ecosystem Map
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Discover The XRPL Universe
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De discovery-laag van de OTT Terminal. Hier vinden gebruikers
              wallets, DeFi, stablecoins, NFT badges, AI-tools, builders,
              projecten, events, grants, jobs en educatie binnen het XRP Ledger
              ecosysteem.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Globe2} label="Universe" value="XRPL" />
            <StatBox icon={Search} label="Discovery" value="Open" />
            <StatBox icon={Users} label="Builders" value="Coming" />
            <StatBox icon={Rocket} label="Adoption" value="Focus" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Ecosystem Categories
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Explore By Category
                </h3>
              </div>

              <Map size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <CategoryCard key={category.label} category={category} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Featured Map
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  XRPL Project Layers
                </h3>
              </div>

              <Network size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Opportunities
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Builders, Partners & Pilots
                </h3>
              </div>

              <Handshake size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {opportunities.map((item) => (
                <OpportunityRow key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                OTT Discovery Vision
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Gebruikers moeten niet verdwalen in losse websites, Discords,
              Telegrams en X-posts. OTT moet de plek worden waar ze projecten
              ontdekken, begrijpen en veilig kunnen onderzoeken.
            </p>

            <div className="space-y-3">
              <VisionLine label="One place to discover XRPL" />
              <VisionLine label="Simple project explanations" />
              <VisionLine label="AI summaries for beginners" />
              <VisionLine label="Risk labels before interaction" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Safety Layer
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Elk project kan later labels krijgen voor issuer info, wallet
              risico, trustline waarschuwingen, documentatie, social links en
              educatieve uitleg.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Rocket size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {ecosystemRoadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Newspaper} title="News" text="Project updates" />
          <FeatureBox icon={BookOpen} title="Docs" text="Education links" />
          <FeatureBox icon={CalendarDays} title="Events" text="Community calls" />
          <FeatureBox icon={ArrowUpRight} title="Links" text="Official sources" />
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

function CategoryCard({ category }: { category: EcosystemCategory }) {
  const Icon = category.icon;

  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all cursor-pointer">
      <Icon size={18} className="text-white/60 mb-4" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {category.label}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
        {category.count}
      </p>
    </div>
  );
}

function ProjectCard({ project }: { project: EcosystemProject }) {
  const Icon = project.icon;

  return (
    <div className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {project.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-2">
        {project.title}
      </h4>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
        {project.category}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {project.description}
      </p>
    </div>
  );
}

function OpportunityRow({ item }: { item: Opportunity }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {item.title}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {item.type}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {item.status}
        </p>
      </div>
    </div>
  );
}

function VisionLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <Sparkles size={14} className="text-white/60" />

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
