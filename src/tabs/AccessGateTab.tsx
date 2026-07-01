import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Circle,
  CreditCard,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  ACCESS_ROUTES,
  ACCESS_SOURCE_TAG,
  clearAccessState,
  getAccessRoute,
  getAccessSummary,
  isAccessVerified,
  loadAccessState,
  markAccessPayloadCreated,
  markAccessVerified,
  selectAccessRoute,
  type AccessRoute,
  type AccessRouteId,
  type AccessState,
} from "../lib/accessStore";

type AccessGateTabProps = {
  walletAddress?: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const routeIcons: Record<AccessRouteId, ElementType> = {
  "banxa-fiat": Banknote,
  "xrp-payment": Wallet,
  "rlusd-payment": CreditCard,
  "ott-access-pass": KeyRound,
};

export function AccessGateTab({ walletAddress = "guest" }: AccessGateTabProps) {
  const [accessState, setAccessState] = useState<AccessState>(() =>
    loadAccessState(walletAddress)
  );
  const [statusMessage, setStatusMessage] = useState(
    "Choose an access route to unlock the terminal access flow."
  );

  const summary = getAccessSummary(accessState);
  const selectedRoute = getAccessRoute(accessState.selectedRouteId);
  const verified = isAccessVerified(accessState);

  const metrics: Metric[] = [
    {
      label: "Access",
      value: verified ? "Unlocked" : "Locked",
      text: "Terminal gate.",
      icon: verified ? ShieldCheck : Lock,
    },
    {
      label: "SourceTag",
      value: String(ACCESS_SOURCE_TAG),
      text: "Payment proof.",
      icon: Fingerprint,
    },
    {
      label: "Route",
      value: selectedRoute?.label ?? "None",
      text: "Selected option.",
      icon: Sparkles,
    },
    {
      label: "Events",
      value: String(summary.eventCount),
      text: "Local access log.",
      icon: BadgeCheck,
    },
  ];

  function chooseRoute(routeId: AccessRouteId) {
    const nextState = selectAccessRoute(walletAddress, routeId);
    const route = getAccessRoute(routeId);

    setAccessState(nextState);
    setStatusMessage(
      route
        ? `${route.title} selected. Next step: create or verify access payment.`
        : "Access route selected."
    );
  }

  function markPayload() {
    if (!selectedRoute) {
      setStatusMessage("Selecteer eerst een access route.");
      return;
    }

    const nextState = markAccessPayloadCreated(
      walletAddress,
      selectedRoute.id,
      `${selectedRoute.title} payload prepared for SourceTag ${ACCESS_SOURCE_TAG}.`
    );

    setAccessState(nextState);
    setStatusMessage(
      `${selectedRoute.title} marked as payload-created. Live Xaman payload komt in de volgende build stap.`
    );
  }

  function demoVerifyAccess() {
    if (!selectedRoute) {
      setStatusMessage("Selecteer eerst een access route.");
      return;
    }

    const nextState = markAccessVerified({
      walletAddress,
      routeId: selectedRoute.id,
      txHash: "DEMO_ACCESS_UNLOCK",
      durationDays: 30,
      note: `${selectedRoute.title} demo access verified with SourceTag ${ACCESS_SOURCE_TAG}.`,
    });

    setAccessState(nextState);
    setStatusMessage(
      "Demo access unlocked for 30 days. Volgende stap is echte Xaman payment + tx hash verification."
    );
  }

  function resetAccess() {
    const nextState = clearAccessState(walletAddress);

    setAccessState(nextState);
    setStatusMessage("Access state reset.");
  }

  function openBanxa() {
    const banxaRoute = getAccessRoute("banxa-fiat");

    if (!banxaRoute) {
      return;
    }

    window.open("https://banxa.com/", "_blank", "noopener,noreferrer");
    chooseRoute("banxa-fiat");
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <KeyRound size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Access Gate
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Choose Access Route
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Terminal access kan via fiat route, XRP payment, RLUSD payment of
              OTT Access Pass NFT. Dit is access utility, geen investering.
              Alles blijft gekoppeld aan SourceTag {ACCESS_SOURCE_TAG}.
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
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Access Routes
              </p>
            </div>

            <div className="space-y-3">
              {ACCESS_ROUTES.map((route) => (
                <RouteButton
                  key={route.id}
                  route={route}
                  active={accessState.selectedRouteId === route.id}
                  onClick={() => chooseRoute(route.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          {selectedRoute ? (
            <RouteDetailCard
              route={selectedRoute}
              onOpenBanxa={openBanxa}
              onMarkPayload={markPayload}
              onDemoVerify={demoVerifyAccess}
            />
          ) : (
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lock size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  No Route Selected
                </p>
              </div>

              <p className="font-mono text-sm text-white/45 leading-relaxed">
                Kies links een access route. Daarna zie je uitleg, risico’s,
                bedrag en de volgende betaal/verificatie stap.
              </p>
            </div>
          )}

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Legal-Safe Language
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Access payments unlock app access only." />
              <InfoLine text="OTT Access Pass NFT is not an investment product." />
              <InfoLine text="XP has no guaranteed financial value." />
              <InfoLine text="Mainnet token conversion requires legal review." />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              {verified ? (
                <ShieldCheck size={18} className="text-white/60" />
              ) : (
                <Lock size={18} className="text-white/60" />
              )}

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Access Status
              </p>
            </div>

            <div className="space-y-3">
              <MiniStatus
                label="Status"
                value={verified ? "Verified" : accessState.status}
              />
              <MiniStatus
                label="Route"
                value={summary.selectedRoute?.label ?? "None"}
              />
              <MiniStatus
                label="Unlocked"
                value={accessState.unlockedAt ?? "None"}
              />
              <MiniStatus label="Expires" value={accessState.expiresAt ?? "None"} />
            </div>

            <button
              onClick={resetAccess}
              className="w-full border border-white/10 bg-black p-4 mt-4 text-left hover:bg-white/[0.03] transition-all"
            >
              <p className="font-orbitron text-xs font-bold uppercase mb-2">
                Reset Demo Access
              </p>

              <p className="font-mono text-[10px] text-white/35 uppercase">
                Local state only
              </p>
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Status Message
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
              <Fingerprint size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Last Event
              </p>
            </div>

            {summary.lastEvent ? (
              <div className="border border-white/10 bg-black p-4">
                <p className="font-orbitron text-xs font-bold uppercase mb-2">
                  {summary.lastEvent.status}
                </p>

                <p className="font-mono text-[10px] text-white/35 uppercase mb-3">
                  {summary.lastEvent.routeId}
                </p>

                <p className="font-mono text-xs text-white/45 leading-relaxed">
                  {summary.lastEvent.note}
                </p>
              </div>
            ) : (
              <MiniStatus label="Event" value="None" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteButton({
  route,
  active,
  onClick,
}: {
  route: AccessRoute;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = routeIcons[route.id];

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Icon size={18} className="text-white/60" />

        {active ? (
          <CheckCircle2 size={16} className="text-white/70" />
        ) : (
          <Circle size={16} className="text-white/20" />
        )}
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {route.title}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {route.label}
      </p>
    </button>
  );
}

function RouteDetailCard({
  route,
  onOpenBanxa,
  onMarkPayload,
  onDemoVerify,
}: {
  route: AccessRoute;
  onOpenBanxa: () => void;
  onMarkPayload: () => void;
  onDemoVerify: () => void;
}) {
  const isBanxa = route.id === "banxa-fiat";

  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35 mb-3">
            {route.type} • SourceTag {ACCESS_SOURCE_TAG}
          </p>

          <h3 className="font-orbitron text-2xl font-black uppercase mb-3">
            {route.title}
          </h3>

          <p className="font-mono text-sm text-white/50 leading-relaxed">
            {route.description}
          </p>
        </div>

        <div className="text-right">
          <p className="font-orbitron text-lg font-black">
            €{route.targetEuroValue}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            Value target
          </p>
        </div>
      </div>

      <Section title="User Explanation" items={route.userExplanation} />

      <div className="border border-white/10 bg-black p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={17} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            Risk Notes
          </p>
        </div>

        <div className="space-y-3">
          {route.riskNotes.map((note) => (
            <InfoLine key={note} text={note} />
          ))}
        </div>
      </div>

      <div className="border border-white/10 bg-black p-5 mb-5">
        <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
          Proof Memo
        </p>

        <p className="font-mono text-xs text-white/55 break-all leading-relaxed">
          {route.proofMemo}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isBanxa ? (
          <ActionButton
            icon={ExternalLink}
            title="Open Banxa"
            text="Official external route"
            onClick={onOpenBanxa}
          />
        ) : (
          <ActionButton
            icon={Wallet}
            title="Prepare Payload"
            text={route.ctaLabel}
            onClick={onMarkPayload}
          />
        )}

        <ActionButton
          icon={BadgeCheck}
          title="Demo Verify"
          text="Unlock local access"
          onClick={onDemoVerify}
        />
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

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-5">
      <p className="font-orbitron text-xs font-bold uppercase mb-3">{title}</p>

      <div className="space-y-2">
        {items.map((item) => (
          <InfoLine key={item} text={item} />
        ))}
      </div>
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
      className="border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all"
    >
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
    </button>
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
