import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  Bot,
  Boxes,
  Building2,
  Coins,
  Compass,
  Database,
  ExternalLink,
  Flame,
  Gem,
  Globe2,
  GraduationCap,
  Landmark,
  Layers,
  Map,
  Network,
  Radio,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
  Waves,
} from "lucide-react";

type EcosystemCategory = {
  id: string;
  title: string;
  count: string;
  status: string;
  description: string;
  icon: ElementType;
};

type EcosystemProject = {
  name: string;
  category: string;
  status: string;
  description: string;
};

type Signal = {
  title: string;
  value: string;
  status: string;
  icon: ElementType;
};

const categories: EcosystemCategory[] = [
  {
    id: "wallets",
    title: "Wallets",
    count: "8+",
    status: "Core",
    description:
      "Wallets, signing apps, custody tools en onboarding tools voor XRPL gebruikers.",
    icon: Wallet,
  },
  {
    id: "defi",
    title: "DeFi",
    count: "12+",
    status: "MVP",
    description:
      "AMM, DEX, swaps, liquidity, lending, yield tracking en risk education.",
    icon: Coins,
  },
  {
    id: "stablecoins",
    title: "Stablecoins",
    count: "6+",
    status: "Watch",
    description:
      "RLUSD, USDC, EUR stablecoins, ramps en payment rails op de XRPL.",
    icon: Landmark,
  },
  {
    id: "builders",
    title: "Builders",
    count: "20+",
    status: "Build",
    description:
      "Developer tools, SDKs, APIs, xApps, hackathon teams en startup projecten.",
    icon: Rocket,
  },
  {
    id: "ai",
    title: "AI Tools",
    count: "5+",
    status: "AI",
    description:
      "AI assistants, research bots, wallet explainers, prompt tools en safety scanners.",
    icon: Bot,
  },
  {
    id: "academy",
    title: "Academy",
    count: "10+",
    status: "Learn",
    description:
      "Learning tracks, quizzes, rewards, badges en onboarding voor nieuwe gebruikers.",
    icon: GraduationCap,
  },
  {
    id: "nfts",
    title: "NFT / Badges",
    count: "9+",
    status: "Identity",
    description:
      "Certificates, membership badges, achievements, tickets en community proof.",
    icon: Gem,
  },
  {
    id: "events",
    title: "Events",
    count: "4+",
    status: "Community",
    description:
      "Meetups, hackathons, XRPL Commons, demos, livestreams en partner activaties.",
    icon: Users,
  },
];

const projects: EcosystemProject[] = [
  {
    name: "Xaman",
    category: "Wallets",
    status: "Core Wallet",
    description: "Signing, xApp flows, wallet onboarding en user confirmation.",
  },
  {
    name: "XRPL Commons",
    category: "Events",
    status: "Challenge",
    description: "Make Waves challenge, builder support, demos en community.",
  },
  {
    name: "RLUSD",
    category: "Stablecoins",
    status: "Payment Rail",
    description: "Stablecoin education, rails monitoring en risk explanation.",
  },
  {
    name: "AMM / DEX",
    category: "DeFi",
    status: "Protocol",
    description: "Liquidity pools, swaps, fees, risks en user education.",
  },
  {
    name: "OTT Academy",
    category: "Academy",
    status: "Internal",
    description: "Learn & Earn tracks voor XRPL, wallets, DeFi, AI en safety.",
  },
  {
    name: "OTT Marketplace",
    category: "NFT / Badges",
    status: "Internal",
    description: "Merch, badges, event tickets, rewards en future utility.",
  },
];

const signals: Signal[] = [
  {
    title: "Categories",
    value: "8",
    status: "Mapped",
    icon: Layers,
  },
  {
    title: "Projects",
    value: "74+",
    status: "Mock",
    icon: Boxes,
  },
  {
    title: "Discovery",
    value: "Active",
    status: "Live UI",
    icon: Compass,
  },
  {
    title: "Partner Layer",
    value: "Ready",
    status: "Pitch",
    icon: BadgeCheck,
  },
];

export function EcosystemTab() {
  const [selectedCategory, setSelectedCategory] = useState<EcosystemCategory>(
    categories[0]
  );
  const SelectedIcon = selectedCategory.icon;

  const visibleProjects = projects.filter(
    (project) => project.category === selectedCategory.title
  );

  const projectsToShow =
    visibleProjects.length > 0 ? visibleProjects : projects.slice(0, 3);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Globe2 size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL Ecosystem Map
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Discover The XRP Ledger
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De discovery-laag van OTT Terminal. Hier maken we XRPL zichtbaar
              voor beginners, builders, partners, investeerders en communities.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {signals.map((signal) => (
              <SignalBox key={signal.title} signal={signal} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Categories
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Ecosystem Directory
                </h3>
              </div>

              <Search size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  active={selectedCategory.id === category.id}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>

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

              <SelectedIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedCategory.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus label="Count" value={selectedCategory.count} />
              <MiniStatus label="Status" value={selectedCategory.status} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Project Feed
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Highlighted Projects
                </h3>
              </div>

              <ExternalLink size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {projectsToShow.map((project) => (
                <ProjectRow key={`${project.name}-${project.category}`} project={project} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Map size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Ecosystem Purpose
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Dit scherm wordt de startpagina waar mensen XRPL projecten,
              tools, wallets, events, DeFi, AI en educational content kunnen
              vinden.
            </p>

            <div className="space-y-3">
              <PurposeLine label="Make XRPL easier to understand" />
              <PurposeLine label="Give builders visibility" />
              <PurposeLine label="Guide beginners safely" />
              <PurposeLine label="Create partner discovery layer" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Network size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Network Layers
              </p>
            </div>

            <div className="space-y-3">
              <LayerLine icon={Wallet} label="Users" value="Wallet onboarding" />
              <LayerLine icon={Building2} label="Projects" value="Visibility" />
              <LayerLine icon={Database} label="Data" value="Signals later" />
              <LayerLine icon={Waves} label="Community" value="Make Waves" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Discovery Later
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Later kan AI vragen beantwoorden zoals: welke wallet moet ik
              gebruiken, welke projecten zijn actief, wat is veilig, en waar kan
              ik leren of bouwen.
            </p>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Wallet} title="Wallets" text="User entry point" />
          <FeatureBox icon={Coins} title="DeFi" text="AMM and DEX" />
          <FeatureBox icon={Flame} title="Builders" text="Hackathon layer" />
          <FeatureBox icon={Radio} title="Signals" text="Live data later" />
        </div>
      </div>
    </div>
  );
}

function SignalBox({ signal }: { signal: Signal }) {
  const Icon = signal.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {signal.title}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1">
        {signal.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {signal.status}
      </p>
    </div>
  );
}

function CategoryCard({
  category,
  active,
  onClick,
}: {
  category: EcosystemCategory;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      className={`border p-5 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/60" />

        <p className="font-mono text-[10px] uppercase text-white/35">
          {category.status}
        </p>
      </div>

      <p className="font-orbitron text-sm font-bold uppercase mb-2">
        {category.title}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {category.count} items
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

function ProjectRow({ project }: { project: EcosystemProject }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-orbitron text-sm font-bold uppercase">
          {project.name}
        </p>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {project.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase mb-3">
        {project.category}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {project.description}
      </p>
    </div>
  );
}

function PurposeLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <Activity size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function LayerLine({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-white/60" />

        <p className="font-orbitron text-xs font-bold uppercase">{label}</p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">{value}</p>
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
