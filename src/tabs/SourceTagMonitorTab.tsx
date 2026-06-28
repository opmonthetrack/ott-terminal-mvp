import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Fingerprint,
  Lock,
  Radio,
  ScanLine,
  ShieldCheck,
  Target,
  Trophy,
  UserCheck,
  Users,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type SourceTagMonitorTabProps = {
  walletAddress: string;
};

type Metric = {
  label: string;
  value: string;
  subtitle: string;
  icon: ElementType;
};

type TransactionItem = {
  wallet: string;
  action: string;
  sourceTag: string;
  status: string;
  time: string;
};

type Rule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const metrics: Metric[] = [
  {
    label: "Source Tag",
    value: "2606",
    subtitle: "Make Waves tag",
    icon: Target,
  },
  {
    label: "Mock Users",
    value: "14",
    subtitle: "Demo active users",
    icon: Users,
  },
  {
    label: "Mock TX",
    value: "32",
    subtitle: "Demo transactions",
    icon: Activity,
  },
  {
    label: "Anti-Bot",
    value: "On",
    subtitle: "Safety layer",
    icon: ShieldCheck,
  },
];

const transactions: TransactionItem[] = [
  {
    wallet: "rDEBUG...123",
    action: "Daily Check-In",
    sourceTag: "2606",
    status: "Mock",
    time: "Now",
  },
  {
    wallet: "rUSER...589",
    action: "Academy Claim",
    sourceTag: "2606",
    status: "Planned",
    time: "Soon",
  },
  {
    wallet: "rXRPL...OTT",
    action: "Reward Signal",
    sourceTag: "2606",
    status: "Mock",
    time: "Today",
  },
  {
    wallet: "rWAVE...2606",
    action: "Wallet Review",
    sourceTag: "2606",
    status: "Mock",
    time: "Today",
  },
];

const rules: Rule[] = [
  {
    title: "Real User",
    status: "Required",
    text: "Elke actieve gebruiker moet een echte walletactie doen, geen bots of fake loops.",
    icon: UserCheck,
  },
  {
    title: "Visible Source Tag",
    status: "Required",
    text: "De source tag 2606 moet duidelijk zichtbaar zijn voordat de gebruiker tekent.",
    icon: Eye,
  },
  {
    title: "Xaman Confirmation",
    status: "Required",
    text: "Gebruiker moet de transactie zelf bevestigen via Xaman. Geen automatische signing.",
    icon: Wallet,
  },
  {
    title: "Mainnet Only",
    status: "Later",
    text: "Voor Make Waves tellen uiteindelijk alleen echte XRPL mainnet transacties mee.",
    icon: Radio,
  },
];

const roadmap = [
  "Mock source tag dashboard bouwen",
  "Daily Check-In koppelen aan source tag 2606",
  "Xaman payload flow voorbereiden",
  "Mainnet transaction hash opslaan",
  "Wallet active user counter maken",
  "Anti-bot en duplicate checks toevoegen",
  "Leaderboard koppelen aan echte check-ins",
  "XRPL Commons demo metrics klaarzetten",
];

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 18) return address;
  return `${address.slice(0, 9)}...${address.slice(-7)}`;
}

export function SourceTagMonitorTab({ walletAddress }: SourceTagMonitorTabProps) {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Fingerprint size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Source Tag Monitor
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Track Active XRPL Users
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De Make Waves meetlaag van OTT Terminal. Hier volgen we later
              echte XRPL mainnet transacties met source tag 2606, actieve
              wallets, check-ins, anti-bot regels en demo-metrics.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <MetricBox key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SignalBox icon={Wallet} title="Connected Wallet" value={shortAddress(walletAddress)} />
            <SignalBox icon={Waves} title="Challenge Tag" value="2606" />
            <SignalBox icon={Trophy} title="Demo Status" value="Ready" />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Transaction Feed
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Mock Source-Tagged Activity
                </h3>
              </div>

              <ScanLine size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {transactions.map((item) => (
                <TransactionRow key={`${item.wallet}-${item.action}`} item={item} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Validation Rules
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  What Counts As Active
                </h3>
              </div>

              <Filter size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Next Mainnet Action
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Daily Check-In wordt straks de eerste veilige Xaman actie die een
              echte XRPL transactie met source tag 2606 kan maken.
            </p>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Payload Type
              </p>

              <p className="font-orbitron text-sm font-black uppercase">
                Payment / Memo / Source Tag
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Safety Warning
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              We bouwen eerst mock. Pas als de interface veilig is, koppelen we
              echte Xaman signing. Geen verborgen transacties. Geen automatische
              walletacties.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={18} className="text-white/60" />
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
          <FeatureBox icon={Target} title="2606 Tag" text="Unique source tag" />
          <FeatureBox icon={Users} title="Active Users" text="Wallet actions" />
          <FeatureBox icon={BarChart3} title="Metrics" text="Demo dashboard" />
          <FeatureBox icon={Lock} title="Safe Signing" text="Xaman later" />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-white/30">{metric.subtitle}</p>
    </div>
  );
}

function SignalBox({
  icon: Icon,
  title,
  value,
}: {
  icon: ElementType;
  title: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {title}
      </p>

      <p className="font-orbitron text-lg font-black uppercase">{value}</p>
    </div>
  );
}

function TransactionRow({ item }: { item: TransactionItem }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {item.action}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {item.wallet} • Source Tag {item.sourceTag}
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] text-white/45 uppercase mb-1">
            {item.status}
          </p>

          <p className="font-mono text-[10px] text-white/30 uppercase">
            {item.time}
          </p>
        </div>
      </div>
    </div>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const Icon = rule.icon;

  return (
    <div className="border border-white/10 bg-black p-5">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/60" />

        <p className="font-mono text-[10px] uppercase text-white/35">
          {rule.status}
        </p>
      </div>

      <p className="font-orbitron text-sm font-bold uppercase mb-2">
        {rule.title}
      </p>

      <p className="font-mono text-xs text-white/40 leading-relaxed">
        {rule.text}
      </p>
    </div>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <CheckCircle2 size={14} className="text-white/40" />

      <p className="font-mono text-xs text-white/45">{label}</p>
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
