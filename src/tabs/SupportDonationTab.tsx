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

const supportItems = [
  "XRPL beginner education and onboarding content.",
  "Xaman wallet activation guidance and SourceTag proof flows.",
  "Community roadmap voting and phase-by-phase product delivery.",
  "Access Pass utility tooling, verification and customer support.",
];

export function SupportDonationTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  const metrics: SupportMetric[] = [
    {
      label: isEnglish ? "Support Wallet" : "Support Wallet",
      value: SUPPORT_WALLET,
      text: isEnglish ? "Official OTT support wallet." : "Officiele OTT support wallet.",
    },
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: isEnglish ? "Make Waves tracking tag." : "Make Waves tracking tag.",
    },
    {
      label: isEnglish ? "Purpose" : "Doel",
      value: isEnglish ? "Education + onboarding" : "Educatie + onboarding",
      text: isEnglish ? "Funds content and delivery." : "Support voor content en delivery.",
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
                    ? "Voluntary support for XRPL education and OTT Terminal delivery"
                    : "Vrijwillige support voor XRPL educatie en OTT Terminal delivery"
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
                {isEnglish ? "Build XRPL onboarding." : "Bouw XRPL onboarding."}
              </span>
            </h1>

            <p className="font-mono text-sm xl:text-base text-black/60 max-w-3xl leading-relaxed">
              {isEnglish
                ? "Support donations help fund XRPL education, community onboarding, Make Waves delivery, content creation and continued product development. Donations are voluntary support only."
                : "Supportdonaties helpen XRPL educatie, community onboarding, Make Waves delivery, contentcreatie en verdere productontwikkeling. Donaties zijn alleen vrijwillige support."}
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
                    : "Donaties zijn geen investeringen. Ze geven geen yield, winstrechten, tokenrechten, governance rechten, equity, gegarandeerde toegang of gegarandeerde Access Pass NFT."}
                </p>
              </div>

              <div className="space-y-2">
                <InfoLine text={isEnglish ? "Voluntary support only." : "Alleen vrijwillige support."} />
                <InfoLine text={isEnglish ? "No investment, yield or profit promise." : "Geen investering, yield of winstbelofte."} />
                <InfoLine text={isEnglish ? "No guaranteed Access Pass or token rights." : "Geen gegarandeerde Access Pass of tokenrechten."} />
                <InfoLine text={isEnglish ? "Founder remains responsible for build order and delivery." : "Founder blijft verantwoordelijk voor bouwvolgorde en delivery."} />
              </div>
            </Panel>

            <a
              href={SUPPORT_PAGE_URL}
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] p-4 text-left text-white hover:brightness-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={17} />
                <div>
                  <p className="font-orbitron text-xs font-black uppercase">
                    {isEnglish ? "Open Support Page" : "Open Supportpagina"}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/75">
                    {isEnglish ? "Wallet + SourceTag details" : "Wallet + SourceTag details"}
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
                  {isEnglish ? "Support Details" : "Support Details"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <MiniStatus label="Support Wallet" value={SUPPORT_WALLET} />
                <MiniStatus label="SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />
                <MiniStatus label="Mode" value="Voluntary support" />
                <MiniStatus label="Next" value="Xaman donation payload later" />
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
