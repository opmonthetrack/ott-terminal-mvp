import { useState } from "react";
import { BadgeCheck, ExternalLink, Loader2, LockKeyhole, Radio, Vote, Waves } from "lucide-react";
import { OTTProofBadge } from "../components/OTTLogo";
import { checkOttAccessPassOwnership } from "../lib/accessNftPass";
import {
  createMakeWavesPayload,
  getXamanPayloadQr,
  openXamanPayload,
  type XamanPayloadResponse,
} from "../lib/xamanClient";
import { getXamanPayloadUuid } from "../lib/xamanClient";
import { saveXamanMobileSession } from "../lib/xamanMobileSession";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type RoadmapTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

const voteOptions = [
  {
    id: "academy-path",
    phase: "Candidate A",
    title: "Academy Learning Paths",
    text: "Short beginner routes with a meaningful completion proof on XRPL.",
  },
  {
    id: "wallet-insights",
    phase: "Candidate B",
    title: "Personal Wallet Insights",
    text: "Clear wallet activity, risk signals and SourceTag transaction history.",
  },
  {
    id: "community-tools",
    phase: "Candidate C",
    title: "Community Proof Tools",
    text: "Reusable proof, event and contribution tools for XRPL communities.",
  },
] as const;

export function RoadmapTab({ walletAddress = "guest", onNavigate }: RoadmapTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const [loadingVoteId, setLoadingVoteId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [payload, setPayload] = useState<XamanPayloadResponse | null>(null);

  async function prepareVote(voteId: string) {
    if (!walletAddress || walletAddress === "guest") {
      setStatus(isEnglish ? "Connect your Xaman wallet before voting." : "Verbind eerst je Xaman-wallet om te stemmen.");
      return;
    }

    setLoadingVoteId(voteId);
    setStatus(isEnglish ? "Checking your Access Pass on XRPL..." : "Je Access Pass wordt op XRPL gecontroleerd...");
    setPayload(null);

    try {
      const ownership = await checkOttAccessPassOwnership(walletAddress);

      if (!ownership.hasAccessPass) {
        setStatus(
          ownership.error ||
            (isEnglish
              ? "No valid OTT Access Pass was found for this wallet."
              : "Voor deze wallet is geen geldige OTT Access Pass gevonden."),
        );
        return;
      }

      const response = await createMakeWavesPayload({
        actionId: "roadmap-vote",
        walletAddress,
        voteId,
      });

      const uuid = getXamanPayloadUuid(response);
      if (uuid) {
        saveXamanMobileSession({
          payloadUuid: uuid,
          actionId: "roadmap-vote",
          returnTarget: "roadmap",
          expectedWallet: walletAddress,
        });
      }

      setPayload(response);
      setStatus(
        isEnglish
          ? `Vote ready for ${voteOptions.find((option) => option.id === voteId)?.title}. Review and sign it in Xaman.`
          : `Stem voor ${voteOptions.find((option) => option.id === voteId)?.title} staat klaar. Controleer en onderteken in Xaman.`,
      );
    } catch (error) {
      const message =
        typeof error === "object" && error && "error" in error
          ? String((error as { error?: unknown }).error)
          : error instanceof Error
            ? error.message
            : "Vote payload creation failed.";
      setStatus(message);
    } finally {
      setLoadingVoteId(null);
    }
  }

  const qrUrl = getXamanPayloadQr(payload);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 xl:p-10 text-[#080808]">
      <section className="border border-black/10 bg-[radial-gradient(circle_at_85%_10%,rgba(200,56,136,0.16),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(56,152,232,0.16),transparent_34%),#fff] p-5 md:p-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 text-[#C83888]">
            <Waves size={22} />
            <p className="font-mono text-[10px] uppercase tracking-[0.32em]">Make Waves / Public Roadmap</p>
          </div>
          <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
        </div>

        <h1 className="font-orbitron text-3xl md:text-5xl font-black uppercase leading-tight max-w-4xl mb-4">
          {isEnglish ? "See what ships next. Help choose the order." : "Bekijk wat hierna komt. Kies mee in welke volgorde."}
        </h1>
        <p className="font-mono text-sm leading-relaxed text-black/60 max-w-3xl">
          {isEnglish
            ? "The roadmap is public. Voting is reserved for verified OTT Access Pass holders, and every submitted vote uses the official Make Waves SourceTag. No private keys are requested."
            : "De roadmap is openbaar. Stemmen is voor geverifieerde OTT Access Pass-houders en iedere ingediende stem gebruikt de officiële Make Waves SourceTag. We vragen nooit om private keys."}
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          ["Live now", "Release 1", "Source-first intelligence, Academy, Xaman onboarding, SourceTag proof and Access Pass verification."],
          ["Community choice", "Release 2", "Access Pass holders choose which focused product layer is built next."],
          ["After validation", "Release 3", "Public ledger-backed results, deeper utility and measured improvements from real user feedback."],
        ].map(([label, title, text]) => (
          <article key={title} className="border border-black/10 bg-[#F7F8FC] p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#8F49D8] mb-3">{label}</p>
            <h2 className="font-orbitron font-black uppercase text-lg mb-3">{title}</h2>
            <p className="font-mono text-xs leading-relaxed text-black/55">{text}</p>
          </article>
        ))}
      </section>

      <section className="border border-black/10 p-5 md:p-7 mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#3898E8] mb-2">Vote cycle 1</p>
            <h2 className="font-orbitron text-2xl font-black uppercase">Choose the next focus</h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-black/55">
            <LockKeyhole size={15} /> Access Pass required
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {voteOptions.map((option) => (
            <article key={option.id} className="border border-black/10 p-5 flex flex-col">
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#C83888] mb-3">{option.phase}</p>
              <h3 className="font-orbitron font-black uppercase mb-3">{option.title}</h3>
              <p className="font-mono text-xs leading-relaxed text-black/55 mb-6 flex-1">{option.text}</p>
              <button
                type="button"
                onClick={() => void prepareVote(option.id)}
                disabled={Boolean(loadingVoteId)}
                className="min-h-12 bg-black text-white px-4 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest disabled:opacity-45 flex items-center justify-center gap-2"
              >
                {loadingVoteId === option.id ? <Loader2 size={16} className="animate-spin" /> : <Vote size={16} />}
                {isEnglish ? "Vote with Xaman" : "Stem met Xaman"}
              </button>
            </article>
          ))}
        </div>

        {status && (
          <div className="mt-5 border border-black/10 bg-[#F7F8FC] p-4 font-mono text-xs leading-relaxed" role="status">
            {status}
          </div>
        )}

        {payload && (
          <div className="mt-5 border border-[#8F49D8]/25 bg-[#8F49D8]/5 p-5 flex flex-col sm:flex-row items-center gap-5">
            {qrUrl && <img src={qrUrl} alt="Xaman roadmap vote QR" className="w-36 h-36 bg-white border border-black/10 p-2" />}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[#8F49D8] mb-2">
                <BadgeCheck size={18} />
                <p className="font-orbitron text-xs font-black uppercase">SourceTag vote ready</p>
              </div>
              <p className="font-mono text-xs text-black/60 mb-4">Review the destination, 1-drop amount, SourceTag and roadmap choice before signing.</p>
              <button
                type="button"
                onClick={() => openXamanPayload(payload)}
                className="min-h-12 bg-[linear-gradient(135deg,#3898E8,#8F49D8,#C83888)] text-white px-5 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <ExternalLink size={16} /> Open Xaman
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="border border-black/10 bg-black text-white p-5 md:p-7">
        <div className="flex items-center gap-3 mb-3"><Radio size={18} className="text-[#3898E8]" /><h2 className="font-orbitron font-black uppercase">Public results</h2></div>
        <p className="font-mono text-xs leading-relaxed text-white/65 max-w-3xl">
          {isEnglish
            ? "No fabricated counters: the public tally will only show validated Mainnet votes after the project passes the Make Waves Mainnet Gate. The intended rule is one counted vote per wallet per cycle."
            : "Geen verzonnen tellers: de publieke uitslag toont pas gevalideerde Mainnet-stemmen nadat het project door de Make Waves Mainnet Gate is. De beoogde regel is één meegetelde stem per wallet per cyclus."}
        </p>
        {walletAddress === "guest" && (
          <button type="button" onClick={() => onNavigate?.("xaman")} className="mt-5 border border-white/25 px-5 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest">
            {isEnglish ? "Connect wallet" : "Verbind wallet"}
          </button>
        )}
      </section>
    </div>
  );
}
