import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  QrCode,
  Radio,
  RefreshCw,
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

type WalletAction = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type TrustlineItem = {
  asset: string;
  issuer: string;
  status: string;
  risk: string;
};

type SafetyItem = {
  title: string;
  text: string;
  status: string;
  icon: ElementType;
};

const walletActions: WalletAction[] = [
  {
    id: "receive",
    title: "Receive XRP",
    status: "Safe",
    text: "Toon je wallet adres en QR-code voor inkomende transacties.",
    icon: ArrowDownLeft,
  },
  {
    id: "send",
    title: "Send XRP",
    status: "Xaman Later",
    text: "Maak later een veilige Xaman payload. Geen automatische signing.",
    icon: Send,
  },
  {
    id: "trustline",
    title: "Trustline Review",
    status: "Safety",
    text: "Controleer tokens, issuers, limieten en mogelijke wallet risico's.",
    icon: ShieldAlert,
  },
  {
    id: "checkin",
    title: "Daily Check-In",
    status: "2606",
    text: "Koppel straks de Make Waves check-in aan source tag 2606.",
    icon: Zap,
  },
];

const trustlines: TrustlineItem[] = [
  {
    asset: "RLUSD",
    issuer: "Ripple USD issuer",
    status: "Watch",
    risk: "Low",
  },
  {
    asset: "USDC",
    issuer: "Circle stablecoin issuer",
    status: "Research",
    risk: "Low",
  },
  {
    asset: "MEME",
    issuer: "Unknown issuer",
    status: "Warning",
    risk: "High",
  },
  {
    asset: "OTT XP",
    issuer: "Off-chain points",
    status: "Safe Mock",
    risk: "None",
  },
];

const safetyItems: SafetyItem[] = [
  {
    title: "No Seed Phrase",
    text: "Deze terminal vraagt nooit om je seed phrase of private key.",
    status: "Rule",
    icon: KeyRound,
  },
  {
    title: "Xaman Confirm",
    text: "Elke echte walletactie moet zichtbaar in Xaman bevestigd worden.",
    status: "Required",
    icon: Wallet,
  },
  {
    title: "Source Tag Visible",
    text: "Bij Make Waves transacties tonen we source tag 2606 vooraf.",
    status: "2606",
    icon: Fingerprint,
  },
  {
    title: "Trustline Warning",
    text: "Onbekende tokens en issuers krijgen duidelijke waarschuwingen.",
    status: "Safety",
    icon: ShieldAlert,
  },
];

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 18) return address;
  return `${address.slice(0, 9)}...${address.slice(-7)}`;
}

export function WalletTab({ walletAddress }: WalletTabProps) {
  const [copied, setCopied] = useState(false);
  const [selectedAction, setSelectedAction] = useState<WalletAction>(walletActions[0]);
  const [selectedTrustline, setSelectedTrustline] = useState<TrustlineItem>(trustlines[0]);

  const SelectedActionIcon = selectedAction.icon;

  async function copyWalletAddress() {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

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
              Wallet Identity & Safety
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De wallet-laag van de OTT Terminal. Hier komen je XRPL account,
              trustline safety, Xaman acties, source tag 2606 en gebruikersidentiteit
              samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={ShieldCheck} label="Status" value="Connected" />
            <StatBox icon={Radio} label="Network" value="XRPL" />
            <StatBox icon={Fingerprint} label="Source Tag" value="2606" />
            <StatBox icon={BadgeCheck} label="Mode" value="Debug" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Connected Wallet
              </p>
            </div>

            <div className="border border-white/10 bg-black p-4 mb-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Address
              </p>

              <p className="font-mono text-xs text-white/70 break-all">
                {walletAddress}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyWalletAddress}
                className="flex items-center justify-center gap-2 bg-white text-black py-3 font-orbitron text-xs font-black uppercase"
              >
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                onClick={() => setSelectedAction(walletActions[0])}
                className="flex items-center justify-center gap-2 border border-white/15 py-3 font-orbitron text-xs font-black uppercase text-white/70 hover:bg-white/[0.03] transition-all"
              >
                <QrCode size={15} />
                QR
              </button>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ScanLine size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Wallet Actions
              </p>
            </div>

            <div className="space-y-3">
              {walletActions.map((action) => (
                <ActionButton
                  key={action.id}
                  action={action}
                  active={selectedAction.id === action.id}
                  onClick={() => setSelectedAction(action)}
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
                  Selected Action
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedAction.title}
                </h3>
              </div>

              <SelectedActionIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedAction.text}
            </p>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Action Status
              </p>

              <p className="font-orbitron text-sm font-black uppercase">
                {selectedAction.status}
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Trustlines
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Token Safety Review
                </h3>
              </div>

              <Eye size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {trustlines.map((item) => (
                <TrustlineRow
                  key={item.asset}
                  item={item}
                  active={selectedTrustline.asset === item.asset}
                  onClick={() => setSelectedTrustline(item)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Token
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedTrustline.asset}
            </p>

            <p className="font-mono text-xs text-white/40 leading-relaxed mb-5">
              {selectedTrustline.issuer}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <MiniStatus label="Status" value={selectedTrustline.status} />
              <MiniStatus label="Risk" value={selectedTrustline.risk} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Safety Rules
              </p>
            </div>

            <div className="space-y-3">
              {safetyItems.map((item) => (
                <SafetyRow key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={ArrowDownLeft} title="Receive" text="Wallet address and QR" />
          <FeatureBox icon={Send} title="Send Later" text="Xaman payload only" />
          <FeatureBox icon={RefreshCw} title="Trustlines" text="Token safety scan" />
          <FeatureBox icon={Sparkles} title="AI Explain" text="Wallet coach later" />
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

function ActionButton({
  action,
  active,
  onClick,
}: {
  action: WalletAction;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = action.icon;

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
            {action.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {action.status}
        </p>
      </div>
    </button>
  );
}

function TrustlineRow({
  item,
  active,
  onClick,
}: {
  item: TrustlineItem;
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {item.asset}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            {item.status}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          Risk: {item.risk}
        </p>
      </div>
    </button>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-3">
      <p className="font-mono text-[10px] text-white/30 uppercase mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase">{value}</p>
    </div>
  );
}

function SafetyRow({ item }: { item: SafetyItem }) {
  const Icon = item.icon;

  return (
    <div className="border border-white/10 bg-black p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <Icon size={14} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {item.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {item.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {item.text}
      </p>
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
