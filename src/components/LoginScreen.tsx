import { useState } from "react";
import type { ElementType } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type LoginScreenProps = {
  onLoginSuccess: (walletAddress: string) => void;
};

type LoginFeature = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const loginFeatures: LoginFeature[] = [
  {
    title: "Debug Wallet",
    status: "MVP",
    text: "Start de terminal direct zonder echte wallet signing tijdens de bouwfase.",
    icon: Wallet,
  },
  {
    title: "Xaman Later",
    status: "Safe",
    text: "Echte wallet connectie komt later via veilige Xaman confirmation.",
    icon: ShieldCheck,
  },
  {
    title: "Source Tag 2606",
    status: "Make Waves",
    text: "Daily Check-In en active user tracking worden later gekoppeld aan source tag 2606.",
    icon: Fingerprint,
  },
  {
    title: "No Seed Phrase",
    status: "Rule",
    text: "De terminal vraagt nooit om private keys, seed phrase of recovery words.",
    icon: Lock,
  },
];

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [customWallet, setCustomWallet] = useState("");
  const [acceptedSafety, setAcceptedSafety] = useState(false);

  const debugWallet = "rDEBUG_OTT_TERMINAL_2606_MAKE_WAVES";

  function enterDebugMode() {
    onLoginSuccess(debugWallet);
  }

  function enterCustomWallet() {
    const cleanWallet = customWallet.trim();

    if (!cleanWallet) {
      onLoginSuccess(debugWallet);
      return;
    }

    onLoginSuccess(cleanWallet);
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,_white_1px,_transparent_1px),linear-gradient(to_bottom,_white_1px,_transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative z-10 min-h-screen grid grid-cols-12">
        <div className="col-span-12 xl:col-span-7 flex items-center p-8 xl:p-14">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-14 h-14 bg-white text-black flex items-center justify-center font-orbitron font-black text-lg">
                OTT
              </div>

              <div>
                <p className="font-orbitron text-sm font-black uppercase tracking-widest">
                  XRPL OnTheTrack Terminal
                </p>

                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em]">
                  Make Waves MVP / Source Tag 2606
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5 text-white/45">
              <Terminal size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                The Home Screen Of The XRP Ledger
              </p>
            </div>

            <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-tight mb-6">
              Enter The XRPL Command Center
            </h1>

            <p className="font-mono text-sm xl:text-base text-white/45 leading-relaxed max-w-3xl mb-10">
              Wallet, portfolio, Academy, AI, DeFi, tokenization, marketplace,
              ledger intel, source tag monitor en Daily Check-In in één terminal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loginFeatures.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 border-t xl:border-t-0 xl:border-l border-white/10 bg-white/[0.02] flex items-center p-8 xl:p-14">
          <div className="w-full max-w-xl mx-auto">
            <div className="border border-white/10 bg-black p-6 mb-4">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                    Access Layer
                  </p>

                  <h2 className="font-orbitron text-2xl font-black uppercase">
                    Connect Wallet
                  </h2>
                </div>

                <Wallet size={26} className="text-white/60" />
              </div>

              <div className="border border-white/10 bg-white/[0.02] p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Radio size={15} className="text-white/60" />

                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    Debug Mode Active
                  </p>
                </div>

                <p className="font-mono text-xs text-white/45 leading-relaxed">
                  Tijdens de MVP gebruiken we een debug wallet zodat je snel
                  door kunt bouwen zonder echte wallet signing.
                </p>
              </div>

              <label className="block mb-5">
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                  Optional Wallet Address
                </p>

                <input
                  value={customWallet}
                  onChange={(event) => setCustomWallet(event.target.value)}
                  placeholder="Paste XRPL wallet or leave empty for debug"
                  className="w-full bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30"
                />
              </label>

              <button
                onClick={() => setAcceptedSafety((current) => !current)}
                className={`w-full border p-4 text-left mb-4 transition-all ${
                  acceptedSafety
                    ? "border-white/30 bg-white/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={17}
                    className={acceptedSafety ? "text-white" : "text-white/30"}
                  />

                  <p className="font-mono text-xs text-white/55">
                    I understand this is MVP debug mode. No real transaction is
                    signed here.
                  </p>
                </div>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={enterDebugMode}
                  className="bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 transition-all"
                >
                  Enter Debug Mode
                </button>

                <button
                  onClick={enterCustomWallet}
                  className="border border-white/15 py-4 font-orbitron text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/[0.03] transition-all"
                >
                  Use Wallet Text
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniBox icon={ShieldCheck} label="Signing" value="Later" />
              <MiniBox icon={Fingerprint} label="Source Tag" value="2606" />
              <MiniBox icon={UserCheck} label="Users" value="Active" />
              <MiniBox icon={Waves} label="Challenge" value="Make Waves" />
            </div>

            <div className="border border-white/10 bg-black p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Next Phase
                </p>
              </div>

              <p className="font-mono text-xs text-white/40 leading-relaxed">
                Later vervangen we debug login door echte Xaman connectie met
                veilige backend, user confirmation en duidelijke warnings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: LoginFeature }) {
  const Icon = feature.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-5">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {feature.status}
        </p>
      </div>

      <p className="font-orbitron text-sm font-bold uppercase mb-2">
        {feature.title}
      </p>

      <p className="font-mono text-xs text-white/40 leading-relaxed">
        {feature.text}
      </p>
    </div>
  );
}

function MiniBox({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <Icon size={17} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}
