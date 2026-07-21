import { useEffect, useState } from "react";
import { ExternalLink, HeartHandshake, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

const SUPPORT_WALLET = "rsEHpJiExneayjkrQdeQEveUwabmmPbksq";
const SUPPORT_PAGE_URL = "/support-donation.html";

type SupportMetric = {
  label: string;
  value: string;
  text: string;
};

type SupportStats = {
  totalXrp: string;
  paymentCount: number;
  uniqueSupporters: number;
  publicMessageCount: number;
};

type SupportStatsResponse = {
  ok: boolean;
  stats?: SupportStats;
  error?: string;
};

const supportItems = [
  "Promotion and advertising to bring new users to OTT Terminal and XRPL.",
  "Public source-code distribution and Make Waves SourceTag awareness.",
  "XRPL education, Xaman onboarding and wallet-safety content.",
  "Terminal development, testing, hosting and customer support.",
];

export function SupportDonationTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const [supportStats, setSupportStats] = useState<SupportStats | null>(null);
  const [statsStatus, setStatsStatus] = useState(
    isEnglish ? "Loading validated XRPL support totals..." : "Gevalideerde XRPL-supporttotalen laden...",
  );

  useEffect(() => {
    let active = true;

    async function loadSupportStats() {
      try {
        const response = await fetch("/api/support-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "xrpl.getSupportStats" }),
        });
        const data = (await response.json()) as SupportStatsResponse;

        if (!response.ok || !data.ok || !data.stats) {
          throw new Error(data.error || "Support statistics unavailable.");
        }

        if (!active) {
          return;
        }

        setSupportStats(data.stats);
        setStatsStatus(
          isEnglish
            ? "Live total from validated XRPL support transactions."
            : "Live totaal uit gevalideerde XRPL-supporttransacties.",
        );
      } catch {
        if (!active) {
          return;
        }

        setStatsStatus(
          isEnglish
            ? "Live XRPL total is temporarily unavailable. The payment route remains active."
            : "Het live XRPL-totaal is tijdelijk niet beschikbaar. De betaalroute blijft actief.",
        );
      }
    }

    void loadSupportStats();

    return () => {
      active = false;
    };
  }, [isEnglish]);

  const metrics: SupportMetric[] = [
    {
      label: isEnglish ? "Collected" : "Verzameld",
      value: supportStats ? `${supportStats.totalXrp} XRP` : "Loading...",
      text: isEnglish ? "Validated support payments." : "Gevalideerde supportbetalingen.",
    },
    {
      label: isEnglish ? "Supporters" : "Supporters",
      value: supportStats ? String(supportStats.uniqueSupporters) : "—",
      text: supportStats
        ? `${supportStats.paymentCount} ${isEnglish ? "payments" : "betalingen"}`
        : statsStatus,
    },
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Make Waves tracking tag.",
    },
    {
      label: isEnglish ? "Rights" : "Rechten",
      value: isEnglish ? "No financial rights" : "Geen financiele rechten",
      text: isEnglish ? "Voluntary support only." : "Alleen vrijwillige support.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_85%_10%,rgba(200,56,136,0.16),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(56,152,232,0.16),transparent_34%),#fff] p-4 md:p-8 xl:p-10">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="mb-6 text-[#080808]">
              <OTTLogo
                size="lg"
                subtitle={
                  isEnglish
                    ? "Voluntary support for promotion, XRPL onboarding and OTT Terminal delivery"
                    : "Vrijwillige support voor promotie, XRPL onboarding en OTT Terminal delivery"
                }
              />
            </div>

            <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
              <HeartHandshake size={15} className="text-[#C83888]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                SUPPORT / DONATION
              </p>
            </div>

            <h1 className="font-orbitron text-4xl md:text-5xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
              {isEnglish ? "Support the terminal." : "Support de terminal."}
              <br />
              <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                {isEnglish ? "Leave your mark." : "Laat je boodschap achter."}
              </span>
            </h1>

            <p className="font-mono text-sm xl:text-base text-black/60 max-w-3xl leading-relaxed">
              {isEnglish
                ? "Support donations help fund promotion, advertising, public source-code distribution, XRPL education, community onboarding and continued terminal development. Add an optional public name and message to the XRPL memo so OTT can feature your support later."
                : "Supportdonaties helpen promotie, advertenties, verspreiding van de publieke sourcecode, XRPL-educatie, community-onboarding en verdere terminalontwikkeling. Voeg optioneel een publieke naam en boodschap toe aan de XRPL-memo, zodat OTT je support later kan uitlichten."}
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4">
            <div className="border border-black/10 bg-white/90 p-5 md:p-6 shadow-xl shadow-black/5">
              <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
              <div className="mt-5 grid grid-cols-2 gap-3">
                {metrics.map((metric) => (
                  <MetricBox key={metric.label} metric={metric} />
                ))}
              </div>
              <p className="mt-4 font-mono text-[10px] leading-relaxed text-black/45">{statsStatus}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="p-4 md:p-8 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-[#3898E8]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Safe Support Scope" : "Veilige Support Scope"}
                </p>
              </div>

              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mb-5">
                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  {isEnglish
                    ? "Donations are not investments. They do not create yield, profit rights, token rights, governance rights, equity, guaranteed access, or a guaranteed Access Pass NFT."
                    : "Donaties zijn geen investeringen. Ze geven geen yield, winstrechten, tokenrechten, governance-rechten, equity, gegarandeerde toegang of gegarandeerde Access Pass NFT."}
                </p>
              </div>

              <div className="space-y-2">
                <InfoLine text={isEnglish ? "Voluntary support only." : "Alleen vrijwillige support."} />
                <InfoLine text={isEnglish ? "Live total comes from validated XRPL transactions." : "Het live totaal komt uit gevalideerde XRPL-transacties."} />
                <InfoLine text={isEnglish ? "Optional public messages require explicit permission." : "Optionele publieke boodschappen vereisen expliciete toestemming."} />
                <InfoLine text={isEnglish ? "Every payment uses the official wallet and SourceTag." : "Elke betaling gebruikt de officiele wallet en SourceTag."} />
              </div>
            </Panel>

            <a
              href={SUPPORT_PAGE_URL}
              className="block w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] p-4 text-left text-white hover:brightness-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={17} />
                <div>
                  <p className="font-orbitron text-xs font-black uppercase">
                    {isEnglish ? "Support + Leave a Message" : "Support + Laat een Boodschap Achter"}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/75">
                    {isEnglish ? "Live total and Xaman buttons" : "Live totaal en Xaman-betaalbuttons"}
                  </p>
                </div>
              </div>
            </a>
          </div>

          <div className="col-span-12 xl:col-span-7 space-y-4">
            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-[#C83888]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "What support helps build" : "Wat support helpt bouwen"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {supportItems.map((item) => (
                  <div key={item} className="border border-black/10 bg-[#F7F8FC] p-4">
                    <InfoLine text={item} />
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Wallet size={18} className="text-[#3898E8]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Live Support Details" : "Live Supportdetails"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <MiniStatus label="Support Wallet" value={SUPPORT_WALLET} />
                <MiniStatus label="SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />
                <MiniStatus
                  label={isEnglish ? "Public Messages" : "Publieke Boodschappen"}
                  value={supportStats ? String(supportStats.publicMessageCount) : "—"}
                />
                <MiniStatus label="Payment" value="Live Xaman fixed amounts" />
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="border border-black/10 bg-white p-5 shadow-sm shadow-black/5">{children}</div>;
}

function MetricBox({ metric }: { metric: SupportMetric }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>
      <p className="font-orbitron text-xs font-black uppercase break-all">{metric.value}</p>
      <p className="font-mono text-[10px] text-black/45 leading-relaxed mt-2">{metric.text}</p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
        {label}
      </p>
      <p className="font-mono text-xs text-black/65 leading-relaxed break-all">{value}</p>
    </div>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <ShieldCheck size={14} className="text-[#3898E8] mt-0.5 shrink-0" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}
