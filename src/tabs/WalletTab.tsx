import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Fingerprint,
  KeyRound,
  Layers,
  Lock,
  QrCode,
  Radio,
  ScanLine,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

type WalletTabProps = {
  walletAddress: string;
};

type Transaction = {
  type: string;
  amount: string;
  status: string;
  time: string;
};

type Trustline = {
  token: string;
  issuer: string;
  risk: string;
  status: string;
};

const transactions: Transaction[] = [
  {
    type: "Daily Check-In",
    amount: "Source Tag 2606",
    status: "Soon",
    time: "Make Waves",
  },
  {
    type: "Receive XRP",
    amount: "+25 XRP",
    status: "Mock",
    time: "Today",
  },
  {
    type: "Trustline Review",
    amount: "Risk Scan",
    status: "Planned",
    time: "Soon",
  },
  {
    type: "Academy Reward",
    amount: "+25 XP",
    status: "Live",
    time: "Now",
  },
];

const trustlines: Trustline[] = [
  {
    token: "RLUSD",
    issuer: "Ripple Stablecoin",
    risk: "Low",
    status: "Watch",
  },
  {
    token: "USDC",
    issuer: "Circle",
    risk: "Low",
    status: "Research",
  },
  {
    token: "Unknown Token",
    issuer: "Unknown Issuer",
    risk: "High",
    status: "Warn",
  },
];

const securityChecks = [
  "No automatic signing",
  "No hidden wallet actions",
  "Xaman confirmation required",
  "Trustline warnings before action",
  "Source tag visible before check-in",
];

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 18) return address;
  return `${address.slice(0, 9)}...${address.slice(-7)}`;
}

export function WalletTab({ walletAddress }: WalletTabProps) {
  const isDebugWallet = walletAddress.includes("DEBUG");

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Wallet size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Wallet Center
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Wallet. Identity. Safety.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De wallet-laag van de OTT Terminal. Hier komen Xaman login,
              balances, transacties, trustlines, NFT badges, security warnings
              en Make Waves source-tagged check-ins samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Radio} label="Network" value="XRPL" />
            <StatBox
              icon={ShieldCheck}
              label="Mode"
              value={isDebugWallet ? "Debug" : "Live"}
            />
            <StatBox icon={Zap} label="Source Tag" value="2606" />
            <StatBox icon={BadgeCheck} label="Identity" value="Connected" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Fingerprint size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Wallet Identity
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 mb-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Connected Address
              </p>

              <p className="font-orbitron text-lg font-black uppercase mb-2">
                {shortAddress(walletAddress)}
              </p>

              <p className="font-mono text-[10px] text-white/30 break-all">
                {walletAddress}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniButton icon={Copy} label="Copy" />
              <MiniButton icon={QrCode} label="QR Code" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Mock Balance
              </p>
            </div>

            <p className="font-orbitron text-4xl font-black mb-2">589.0000</p>
            <p className="font-mono text-xs text-white/40 mb-6">XRP</p>

            <div className="grid grid-cols-2 gap-3">
              <ActionButton icon={ArrowDownLeft} label="Receive" active />
              <ActionButton icon={Send} label="Send" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Xaman Actions
              </p>
            </div>

            <div className="space-y-3">
              <ActionLine label="Login with Xaman" status="Later" />
              <ActionLine label="Payment Payload" status="Soon" />
              <ActionLine label="Trustline Payload" status="Soon" />
              <ActionLine label="Daily Check-In" status="Priority" />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Activity Feed
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Wallet Timeline
                </h3>
              </div>

              <Activity size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {transactions.map((tx) => (
                <TransactionRow key={`${tx.type}-${tx.time}`} transaction={tx} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Trustlines
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Token Safety
                </h3>
              </div>

              <ScanLine size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {trustlines.map((trustline) => (
                <TrustlineRow key={trustline.token} trustline={trustline} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldAlert size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Risk Scanner
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Later scant OTT wallet acties, tokens, issuers, trustlines,
              airdrops en verdachte transacties voordat de gebruiker tekent.
            </p>

            <div className="space-y-3">
              {securityChecks.map((check) => (
                <SecurityLine key={check} label={check} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Make Waves Check-In
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              De eerste echte mainnet actie wordt later een veilige Xaman
              check-in met source tag 2606, zodat actieve gebruikers meetellen.
            </p>

            <button className="w-full border border-white/15 py-3 font-orbitron text-xs uppercase tracking-widest text-white/40 cursor-not-allowed">
              Check-In Coming Soon
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Future Wallet Modules
              </p>
            </div>

            <div className="space-y-3">
              <FutureLine label="NFT Badges" />
              <FutureLine label="Portfolio" />
              <FutureLine label="AMM Positions" />
              <FutureLine label="Reputation Score" />
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Eye} title="Explorer" text="Bithomp / XRPL.org" />
          <FeatureBox icon={KeyRound} title="Keys" text="Safety education" />
          <FeatureBox icon={AlertTriangle} title="Warnings" text="Risk alerts" />
          <FeatureBox icon={ArrowUpRight} title="Actions" text="Xaman flows later" />
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

function MiniButton({
  icon: Icon,
  label,
}: {
  icon: ElementType;
  label: string;
}) {
  return (
    <button className="border border-white/10 bg-black p-3 flex items-center justify-center gap-2 font-orbitron text-[10px] uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.03] transition-all">
      <Icon size={14} />
      {label}
    </button>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
}: {
  icon: ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex items-center justify-center gap-2 py-3 font-orbitron text-xs font-black uppercase transition-all ${
        active
          ? "bg-white text-black"
          : "border border-white/15 text-white/70 hover:bg-white/[0.03]"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function ActionLine({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between border border-white/10 bg-black p-3">
      <p className="font-mono text-xs text-white/50">{label}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{status}</p>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {transaction.type}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {transaction.amount} • {transaction.time}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {transaction.status}
        </p>
      </div>
    </div>
  );
}

function TrustlineRow({ trustline }: { trustline: Trustline }) {
  const isHighRisk = trustline.risk === "High";

  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {trustline.token}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {trustline.issuer}
          </p>
        </div>

        <div className="text-right">
          <p
            className={`font-mono text-[10px] uppercase mb-1 ${
              isHighRisk ? "text-white/70" : "text-white/35"
            }`}
          >
            Risk: {trustline.risk}
          </p>

          <p className="font-mono text-[10px] text-white/30 uppercase">
            {trustline.status}
          </p>
        </div>
      </div>
    </div>
  );
}

function SecurityLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border border-white/10 bg-black p-3">
      <CheckCircle2 size={14} className="text-white/60" />
      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function FutureLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <Clock size={14} className="text-white/40" />
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
