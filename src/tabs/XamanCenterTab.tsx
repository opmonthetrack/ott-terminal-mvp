import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  QrCode,
  Radio,
  ScanLine,
  Send,
  ShieldCheck,
  Target,
  Terminal,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_SOURCE_TAG,
  createMakeWavesPayload,
  getXamanPayloadQr,
  getXamanPayloadUrl,
  isMakeWavesRewardAllowed,
  openXamanPayload,
  verifyMakeWavesPayload,
  type XamanCreatePayloadResponse,
  type XamanVerifyPayloadResponse,
} from "../lib/xamanClient";

type XamanModule = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type SecurityRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const modules: XamanModule[] = [
  {
    id: "create",
    title: "Create Payload",
    status: "API",
    text: "Maak een Xaman sign request via /api/xaman/create-payload met SourceTag 2606170002.",
    icon: Send,
  },
  {
    id: "open",
    title: "Open Xaman",
    status: "User",
    text: "Open de payload link of QR zodat de gebruiker bewust kan signen in Xaman.",
    icon: QrCode,
  },
  {
    id: "verify",
    title: "Verify Payload",
    status: "Proof",
    text: "Controleer payload result, tx hash en SourceTag voordat XP of reward telt.",
    icon: ScanLine,
  },
  {
    id: "reward",
    title: "Reward Gate",
    status: "XP",
    text: "Alleen bij signed, resolved, txHash en juiste SourceTag mag rewardAllowed true worden.",
    icon: BadgeCheck,
  },
];

const securityRules: SecurityRule[] = [
  {
    title: "No Seed Phrase",
    status: "Rule",
    text: "De terminal vraagt nooit om seed phrase, private key of recovery words.",
    icon: Lock,
  },
  {
    title: "Backend Secrets",
    status: "Required",
    text: "XAMAN_API_KEY en XAMAN_API_SECRET blijven in Vercel Environment Variables.",
    icon: KeyRound,
  },
  {
    title: "User Confirmation",
    status: "Safety",
    text: "Elke echte XRPL actie moet zichtbaar bevestigd worden in Xaman.",
    icon: Wallet,
  },
  {
    title: "Verify Before XP",
    status: "Proof",
    text: "XP telt pas na correcte verification met SourceTag 2606170002.",
    icon: ShieldCheck,
  },
];

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error?: unknown };

    if (typeof apiError.error === "string") {
      return apiError.error;
    }
  }

  return "Unknown Xaman error.";
}

export function XamanCenterTab() {
  const [selectedModule, setSelectedModule] = useState<XamanModule>(modules[0]);
  const [userWallet, setUserWallet] = useState("");
  const [destinationWallet, setDestinationWallet] = useState("");
  const [amountDrops, setAmountDrops] = useState("1000000");
  const [memoText, setMemoText] = useState("OTT_DAILY_CHECKIN");
  const [payloadUuid, setPayloadUuid] = useState("");
  const [createResponse, setCreateResponse] =
    useState<XamanCreatePayloadResponse | null>(null);
  const [verifyResponse, setVerifyResponse] =
    useState<XamanVerifyPayloadResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready to create payload.");

  const SelectedModuleIcon = selectedModule.icon;
  const qrUrl = getXamanPayloadQr(createResponse);
  const payloadUrl = getXamanPayloadUrl(createResponse);
  const rewardAllowed = isMakeWavesRewardAllowed(verifyResponse);

  async function handleCreatePayload() {
    if (!destinationWallet.trim()) {
      setStatusMessage("Vul eerst destination wallet in.");
      return;
    }

    setBusy(true);
    setStatusMessage("Creating Xaman payload...");
    setVerifyResponse(null);

    try {
      const response = await createMakeWavesPayload({
        userWallet: userWallet.trim() || undefined,
        destinationWallet: destinationWallet.trim(),
        amountDrops: amountDrops.trim() || "1000000",
        memoText: memoText.trim() || "OTT_DAILY_CHECKIN",
      });

      setCreateResponse(response);

      const uuid = response.payload?.uuid ?? "";
      setPayloadUuid(uuid);
      setStatusMessage(`Payload created. SourceTag ${MAKE_WAVES_SOURCE_TAG} locked.`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyPayload() {
    const cleanUuid = payloadUuid.trim();

    if (!cleanUuid) {
      setStatusMessage("Geen payload UUID om te verifyen.");
      return;
    }

    setBusy(true);
    setStatusMessage("Verifying payload result...");

    try {
      const response = await verifyMakeWavesPayload(cleanUuid);
      setVerifyResponse(response);

      if (isMakeWavesRewardAllowed(response)) {
        setStatusMessage("Verified. SourceTag klopt. Reward/XP allowed.");
      } else {
        setStatusMessage("Payload checked, maar reward is nog niet allowed.");
      }
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Terminal size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Xaman Center
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Create. Sign. Verify. Reward.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Eerste echte Xaman control center voor OTT Terminal. Payloads
              gaan via backend, gebruiker tekent in Xaman, daarna controleren
              we SourceTag {MAKE_WAVES_SOURCE_TAG} voordat XP telt.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Wallet} label="Wallet" value="Xaman" />
            <StatBox icon={Fingerprint} label="SourceTag" value={`${MAKE_WAVES_SOURCE_TAG}`} />
            <StatBox icon={ShieldCheck} label="Reward Gate" value={rewardAllowed ? "Open" : "Locked"} />
            <StatBox icon={Radio} label="Status" value={busy ? "Busy" : "Ready"} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Database size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Xaman Flow
              </p>
            </div>

            <div className="space-y-3">
              {modules.map((module) => (
                <ModuleButton
                  key={module.id}
                  module={module}
                  active={selectedModule.id === module.id}
                  onClick={() => setSelectedModule(module)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Step
              </p>

              <SelectedModuleIcon size={18} className="text-white/60" />
            </div>

            <p className="font-orbitron text-xl font-black uppercase mb-2">
              {selectedModule.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedModule.status}
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              {selectedModule.text}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Waves size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Fixed Make Waves Tag
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase break-all">
              {MAKE_WAVES_SOURCE_TAG}
            </p>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Send size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Create Payload
              </p>
            </div>

            <div className="space-y-4">
              <InputField
                label="User Wallet Optional"
                value={userWallet}
                placeholder="r..."
                onChange={setUserWallet}
              />

              <InputField
                label="Destination Wallet Required"
                value={destinationWallet}
                placeholder="r..."
                onChange={setDestinationWallet}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Amount Drops"
                  value={amountDrops}
                  placeholder="1000000"
                  onChange={setAmountDrops}
                />

                <InputField
                  label="Memo Text"
                  value={memoText}
                  placeholder="OTT_DAILY_CHECKIN"
                  onChange={setMemoText}
                />
              </div>

              <button
                onClick={handleCreatePayload}
                disabled={busy}
                className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                Create Make Waves Payload
              </button>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <QrCode size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Payload Access
              </p>
            </div>

            {qrUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 items-center">
                <img
                  src={qrUrl}
                  alt="Xaman payload QR"
                  className="w-32 h-32 bg-white p-2"
                />

                <div>
                  <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                    Payload URL
                  </p>

                  <p className="font-mono text-xs text-white/45 break-all mb-4">
                    {payloadUrl}
                  </p>

                  <button
                    onClick={() => openXamanPayload(createResponse)}
                    className="border border-white/15 px-4 py-3 font-orbitron text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/[0.03] transition-all flex items-center gap-2"
                  >
                    <ExternalLink size={15} />
                    Open Xaman
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState text="Create eerst een payload. Daarna verschijnt QR/link hier." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ScanLine size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verify Payload
              </p>
            </div>

            <InputField
              label="Payload UUID"
              value={payloadUuid}
              placeholder="uuid from Xaman payload"
              onChange={setPayloadUuid}
            />

            <button
              onClick={handleVerifyPayload}
              disabled={busy}
              className="w-full border border-white/15 py-4 mt-4 font-orbitron text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/[0.03] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Verify SourceTag {MAKE_WAVES_SOURCE_TAG}
            </button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Current Status
              </p>
            </div>

            <div className="border border-white/10 bg-black p-4 mb-3">
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <MiniStatus label="Reward Allowed" value={rewardAllowed ? "Yes" : "No"} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verification Result
              </p>
            </div>

            {verifyResponse?.verified ? (
              <div className="space-y-3">
                <ResultLine label="Signed" value={String(verifyResponse.verified.signed)} />
                <ResultLine label="Resolved" value={String(verifyResponse.verified.resolved)} />
                <ResultLine label="Tag Match" value={String(verifyResponse.verified.sourceTagMatches)} />
                <ResultLine label="Tx Hash" value={verifyResponse.verified.txHash ?? "None"} />
              </div>
            ) : (
              <EmptyState text="Nog geen verification result." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Security Rules
              </p>
            </div>

            <div className="space-y-3">
              {securityRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Link2} title="API" text="/api/xaman/create-payload" />
          <FeatureBox icon={Code2} title="Verify" text="/api/xaman/verify-payload" />
          <FeatureBox icon={Fingerprint} title="SourceTag" text={`${MAKE_WAVES_SOURCE_TAG}`} />
          <FeatureBox icon={AlertTriangle} title="Secrets" text="Backend only" />
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

      <p className="font-orbitron text-sm font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function ModuleButton({
  module,
  active,
  onClick,
}: {
  module: XamanModule;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = module.icon;

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
            {module.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {module.status}
        </p>
      </div>
    </button>
  );
}

function InputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20"
      />
    </label>
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

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-3">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-1">
        {label}
      </p>

      <p className="font-mono text-[10px] text-white/55 break-all">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-xs text-white/35 leading-relaxed">{text}</p>
    </div>
  );
}

function RuleCard({ rule }: { rule: SecurityRule }) {
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

      <p className="font-mono text-xs text-white/40 break-all">{text}</p>
    </div>
  );
}
