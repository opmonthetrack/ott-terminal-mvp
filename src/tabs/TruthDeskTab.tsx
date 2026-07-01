import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  HelpCircle,
  Loader2,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";
import {
  ASK_TRUTH_MAX_LENGTH,
  TRUTH_DESK_DURATIONS,
  TRUTH_DESK_SOURCE_TAG,
  createTruthDeskPayload,
  getAskTruthAmountDrops,
  getOneOnOneAmountDrops,
  getQuestionCharactersLeft,
  getTruthDeskErrorMessage,
  getTruthDeskPayloadQr,
  getTruthDeskPayloadUrl,
  getTruthDeskPayloadUuid,
  getTruthDeskStatusLabel,
  openTruthDeskPayload,
  type TruthDeskPayloadResponse,
  type TruthDeskServiceType,
} from "../lib/truthDeskClient";

type TruthDeskTabProps = {
  walletAddress?: string;
};

type DurationOption = 15 | 30 | 45 | 60;

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

export function TruthDeskTab({ walletAddress = "guest" }: TruthDeskTabProps) {
  const [serviceType, setServiceType] =
    useState<TruthDeskServiceType>("ask-truth");
  const [question, setQuestion] = useState("");
  const [meetingGoal, setMeetingGoal] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<DurationOption>(15);
  const [destinationWallet, setDestinationWallet] = useState("");
  const [payload, setPayload] = useState<TruthDeskPayloadResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Choose Ask Truth or 1-on-1 and create a Xaman payment payload."
  );

  const isAskTruth = serviceType === "ask-truth";
  const charactersLeft = getQuestionCharactersLeft(question);
  const amountDrops = isAskTruth
    ? getAskTruthAmountDrops()
    : getOneOnOneAmountDrops(durationMinutes);
  const amountXrp = Number(amountDrops) / 1000000;

  const uuid = getTruthDeskPayloadUuid(payload);
  const url = getTruthDeskPayloadUrl(payload);
  const qr = getTruthDeskPayloadQr(payload);

  const metrics: Metric[] = [
    {
      label: "SourceTag",
      value: String(TRUTH_DESK_SOURCE_TAG),
      text: "Payment proof.",
      icon: Fingerprint,
    },
    {
      label: "Ask Truth",
      value: "1 XRP",
      text: "Max 200 chars.",
      icon: HelpCircle,
    },
    {
      label: "1-on-1",
      value: "15-60",
      text: "Minutes max.",
      icon: Timer,
    },
    {
      label: "Advice",
      value: "None",
      text: "Education only.",
      icon: ShieldCheck,
    },
  ];

  async function createPayload() {
    if (isAskTruth && !question.trim()) {
      setStatusMessage("Vul eerst je vraag in.");
      return;
    }

    if (isAskTruth && question.trim().length > ASK_TRUTH_MAX_LENGTH) {
      setStatusMessage("Vraag is te lang. Max 200 tekens.");
      return;
    }

    if (!isAskTruth && !meetingGoal.trim()) {
      setStatusMessage("Vul eerst het doel van de 1-on-1 in.");
      return;
    }

    setBusy(true);
    setStatusMessage("Creating Truth Desk payment payload...");

    try {
      const response = await createTruthDeskPayload({
        walletAddress: walletAddress === "guest" ? undefined : walletAddress,
        destinationWallet: destinationWallet.trim() || undefined,
        serviceType,
        question: question.trim(),
        meetingGoal: meetingGoal.trim(),
        durationMinutes: isAskTruth ? undefined : durationMinutes,
        amountDrops,
      });

      setPayload(response);
      setStatusMessage(getTruthDeskStatusLabel(response));
    } catch (error) {
      setStatusMessage(getTruthDeskErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function copyUuid() {
    if (!uuid) {
      setStatusMessage("Geen Truth Desk UUID gevonden.");
      return;
    }

    await navigator.clipboard.writeText(uuid);
    setStatusMessage("Truth Desk payload UUID copied.");
  }

  function openPayload() {
    const opened = openTruthDeskPayload(payload);

    if (!opened) {
      setStatusMessage("Geen Truth Desk payload link gevonden.");
    }
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <MessageCircle size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Truth Desk
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Ask Truth or Book 1-on-1
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Persoonlijke XRPL oriëntatie via Xaman payment. Ask Truth is 1
              XRP voor één korte vraag. 1-on-1 is per kwartier tot maximaal 1
              uur. Geen financieel, juridisch of fiscaal advies.
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
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Service Type
              </p>
            </div>

            <div className="space-y-3">
              <ServiceButton
                active={serviceType === "ask-truth"}
                icon={HelpCircle}
                title="Ask Truth"
                text="1 XRP • max 200 characters"
                onClick={() => {
                  setServiceType("ask-truth");
                  setPayload(null);
                }}
              />

              <ServiceButton
                active={serviceType === "one-on-one"}
                icon={CalendarClock}
                title="Book 1-on-1"
                text="15 / 30 / 45 / 60 minutes"
                onClick={() => {
                  setServiceType("one-on-one");
                  setPayload(null);
                }}
              />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Boundaries
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Education, orientation and project feedback only." />
              <InfoLine text="No financial advice, no legal advice, no tax advice." />
              <InfoLine text="No investment guarantees or token price promises." />
              <InfoLine text="Payment uses SourceTag 2606170002 for proof." />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              {isAskTruth ? (
                <HelpCircle size={18} className="text-white/60" />
              ) : (
                <CalendarClock size={18} className="text-white/60" />
              )}

              <p className="font-orbitron text-xs uppercase tracking-widest">
                {isAskTruth ? "One Question" : "Meeting Request"}
              </p>
            </div>

            {isAskTruth ? (
              <label className="block">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
                    Your Question
                  </p>

                  <p className="font-mono text-[10px] text-white/35 uppercase">
                    {charactersLeft} left
                  </p>
                </div>

                <textarea
                  value={question}
                  maxLength={ASK_TRUTH_MAX_LENGTH}
                  placeholder="Ask one clear XRPL / crypto / terminal question..."
                  onChange={(event) => setQuestion(event.target.value)}
                  className="w-full min-h-32 bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20 resize-none"
                />
              </label>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-3">
                    Duration
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {TRUTH_DESK_DURATIONS.map((duration) => (
                      <button
                        key={duration.minutes}
                        onClick={() => setDurationMinutes(duration.minutes)}
                        className={`border p-4 text-left transition-all ${
                          durationMinutes === duration.minutes
                            ? "border-white/30 bg-white/[0.08]"
                            : "border-white/10 bg-black hover:bg-white/[0.03]"
                        }`}
                      >
                        <p className="font-orbitron text-xs font-black uppercase mb-2">
                          {duration.label}
                        </p>

                        <p className="font-mono text-[10px] text-white/35 uppercase">
                          €{duration.euroValue} value target
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                    Goal / Preparation Notes
                  </p>

                  <textarea
                    value={meetingGoal}
                    placeholder="Describe what you want to discuss so I can prepare..."
                    onChange={(event) => setMeetingGoal(event.target.value)}
                    className="w-full min-h-40 bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20 resize-none"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <QrCode size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Xaman Payment Payload
              </p>
            </div>

            <InputField
              label="Destination Wallet"
              value={destinationWallet}
              placeholder="Optional if OTT_TRUTH_DESK_WALLET is set"
              onChange={setDestinationWallet}
            />

            <div className="grid grid-cols-2 gap-3 my-5">
              <MiniStatus label="Amount" value={`${amountXrp} XRP`} />
              <MiniStatus label="SourceTag" value={String(TRUTH_DESK_SOURCE_TAG)} />
            </div>

            {!isAskTruth && (
              <div className="border border-white/10 bg-black p-4 mb-5">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-white/50 mt-0.5 shrink-0" />

                  <p className="font-mono text-xs text-white/45 leading-relaxed">
                    Demo pricing gebruikt nu XRP-bedragen per tijdslot. Later
                    koppelen we dit aan live euro-naar-XRP waarde.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={createPayload}
              disabled={busy}
              className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
              Create Truth Desk Payload
            </button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Fingerprint size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Payment Proof
              </p>
            </div>

            {uuid ? (
              <div className="space-y-4">
                {qr && (
                  <div className="border border-white/10 bg-white p-4 inline-block">
                    <img src={qr} alt="Truth Desk QR" className="w-40 h-40" />
                  </div>
                )}

                <MiniStatus label="Payload UUID" value={uuid} />

                <ActionButton
                  icon={ExternalLink}
                  title="Open Xaman"
                  text={url ? "Launch payment" : "No link"}
                  onClick={openPayload}
                />

                <ActionButton
                  icon={Copy}
                  title="Copy UUID"
                  text="For tracking"
                  onClick={copyUuid}
                />
              </div>
            ) : (
              <EmptyState text="Nog geen Truth Desk payment payload gemaakt." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Status
              </p>
            </div>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                {statusMessage}
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Timer size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Next Build
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Verify Truth Desk payment tx hash." />
              <InfoLine text="Unlock booking link after payment verification." />
              <InfoLine text="Store submitted questions locally or backend later." />
            </div>
          </div>
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

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {metric.text}
      </p>
    </div>
  );
}

function ServiceButton({
  active,
  icon: Icon,
  title,
  text,
  onClick,
}: {
  active: boolean;
  icon: ElementType;
  title: string;
  text: string;
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
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
    </button>
  );
}

function ActionButton({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: ElementType;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all"
    >
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
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
  placeholder?: string;
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

      <p className="font-orbitron text-sm font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-white/45 mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-white/45 leading-relaxed">{text}</p>
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
