import type { ElementType } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Coins,
  Database,
  Factory,
  FileText,
  Gem,
  Globe2,
  GraduationCap,
  Home,
  Landmark,
  Layers,
  Lock,
  Network,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

type TokenizationSector = {
  title: string;
  category: string;
  status: string;
  description: string;
  icon: ElementType;
};

type AssetClass = {
  title: string;
  value: string;
  status: string;
  icon: ElementType;
};

type ComplianceItem = {
  label: string;
  status: string;
};

const sectors: TokenizationSector[] = [
  {
    title: "Real Estate",
    category: "RWA",
    status: "Research",
    description:
      "Tokenized vastgoed, huurinkomsten, eigendomsbewijzen en fractionele toegang tot assets.",
    icon: Home,
  },
  {
    title: "Bonds & Treasuries",
    category: "Finance",
    status: "Watch",
    description:
      "Tokenized staatsobligaties, money market funds en institutionele settlement rails.",
    icon: Landmark,
  },
  {
    title: "Commodities",
    category: "Assets",
    status: "Planned",
    description:
      "Goud, zilver, energie, grondstoffen en asset-backed tokens met duidelijke reserve-informatie.",
    icon: Gem,
  },
  {
    title: "Invoices",
    category: "Business",
    status: "Future",
    description:
      "Factoring, handelsfinanciering en tokenized zakelijke vorderingen voor bedrijven.",
    icon: FileText,
  },
  {
    title: "Retail Loyalty",
    category: "Adoption",
    status: "OTT Fit",
    description:
      "Retailers kunnen later loyalty points, coupons, memberships en rewards tokenizen.",
    icon: Wallet,
  },
  {
    title: "Supply Chain",
    category: "Enterprise",
    status: "Future",
    description:
      "Tracking van goederen, certificaten, herkomstdata en digitale bewijzen op ledger rails.",
    icon: Factory,
  },
];

const assetClasses: AssetClass[] = [
  {
    title: "Real World Assets",
    value: "RWA",
    status: "Core Theme",
    icon: Building2,
  },
  {
    title: "Stablecoins",
    value: "RLUSD",
    status: "Priority",
    icon: Coins,
  },
  {
    title: "Institutional Rails",
    value: "ISO",
    status: "Research",
    icon: Network,
  },
  {
    title: "Compliance",
    value: "KYC",
    status: "Later",
    icon: ShieldCheck,
  },
];

const complianceItems: ComplianceItem[] = [
  {
    label: "Issuer transparency",
    status: "Required",
  },
  {
    label: "Reserve information",
    status: "Required",
  },
  {
    label: "Legal structure",
    status: "Required",
  },
  {
    label: "User risk warnings",
    status: "Required",
  },
  {
    label: "Jurisdiction labels",
    status: "Planned",
  },
  {
    label: "AI document summaries",
    status: "Future",
  },
];

const tokenizationRoadmap = [
  "Maak een RWA education layer",
  "Voeg tokenized asset categories toe",
  "Voeg stablecoin en institutional rails uitleg toe",
  "Voeg issuer transparency labels toe",
  "Voeg compliance en risk warnings toe",
  "Voeg AI asset summaries toe",
  "Voeg retailer tokenization pilots toe",
  "Bouw later partner onboarding voor RWA projecten",
];

export function TokenizationTab() {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Building2 size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                RWA Tokenization Hub
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Real Assets. Digital Rails.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De tokenization-laag van de OTT Terminal. Hier leren gebruikers
              hoe vastgoed, obligaties, commodities, stablecoins, loyalty,
              invoices en enterprise assets via digitale rails toegankelijker
              kunnen worden.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {assetClasses.map((asset) => (
              <AssetClassBox key={asset.title} asset={asset} />
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
                  Tokenization Sectors
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Asset Categories
                </h3>
              </div>

              <Layers size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sectors.map((sector) => (
                <SectorCard key={sector.title} sector={sector} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  RWA Intelligence
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Market Structure
                </h3>
              </div>

              <BarChart3 size={20} className="text-white/60" />
            </div>

            <div className="border border-white/10 bg-black p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InsightBox
                  icon={Globe2}
                  title="Global Market"
                  text="Tokenization kan traditionele assets toegankelijker maken via digitale settlement rails."
                />

                <InsightBox
                  icon={Landmark}
                  title="Institutions"
                  text="Banken, funds en payment rails onderzoeken digitale assets, stablecoins en tokenized securities."
                />

                <InsightBox
                  icon={Users}
                  title="Retail Access"
                  text="OTT kan dit uitleggen aan normale gebruikers, ondernemers en retailers zonder technische taal."
                />
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Education Layer
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Learn RWA Safely
                </h3>
              </div>

              <GraduationCap size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <EducationBox icon={FileText} title="Docs" text="Asset papers" />
              <EducationBox icon={Scale} title="Legal" text="Structure basics" />
              <EducationBox icon={Database} title="Data" text="Reserves info" />
              <EducationBox icon={ShieldCheck} title="Risk" text="Warnings first" />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Compliance Watch
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              RWA en tokenization hebben duidelijke uitleg nodig. OTT moet niet
              alleen kansen tonen, maar ook risico's, issuer informatie,
              legal structuur en transparantie.
            </p>

            <div className="space-y-3">
              {complianceItems.map((item) => (
                <ComplianceLine key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Asset Explainer
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Later kan AI documenten samenvatten, risico's uitleggen, issuer
              informatie vergelijken en beginners helpen begrijpen wat een
              tokenized asset echt betekent.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Locked Until Verified
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Echte RWA listings komen pas later. Eerst bouwen we educatie,
              labels, waarschuwingen en research zodat gebruikers veilig leren.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {tokenizationRoadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Building2} title="RWA" text="Real-world assets" />
          <FeatureBox icon={Coins} title="Stablecoins" text="Settlement rails" />
          <FeatureBox icon={ShieldCheck} title="Compliance" text="Safety labels" />
          <FeatureBox icon={ArrowUpRight} title="Partners" text="Listings later" />
        </div>
      </div>
    </div>
  );
}

function AssetClassBox({ asset }: { asset: AssetClass }) {
  const Icon = asset.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {asset.title}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1">
        {asset.value}
      </p>

      <p className="font-mono text-[10px] text-white/30">{asset.status}</p>
    </div>
  );
}

function SectorCard({ sector }: { sector: TokenizationSector }) {
  const Icon = sector.icon;

  return (
    <div className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {sector.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-2">
        {sector.title}
      </h4>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
        {sector.category}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {sector.description}
      </p>
    </div>
  );
}

function InsightBox({
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

      <p className="font-mono text-xs text-white/40 leading-relaxed">{text}</p>
    </div>
  );
}

function EducationBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-5">
      <Icon size={18} className="text-white/60 mb-4" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40">{text}</p>
    </div>
  );
}

function ComplianceLine({ item }: { item: ComplianceItem }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={14} className="text-white/60" />

        <p className="font-mono text-xs text-white/50">{item.label}</p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {item.status}
      </p>
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
