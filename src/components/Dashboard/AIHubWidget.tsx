import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Code2,
  CreditCard,
  Cpu,
  FileSearch,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const aiItems = [
  { title: "OTT AI Assistant", category: "Terminal Copilot", status: "Core" },
  { title: "XRPL AI Starter Kit", category: "Ripple AI Tools", status: "Watch" },
  { title: "X402 Protocol", category: "Agentic Payments", status: "Research" },
  { title: "MCP Server", category: "AI Tool Layer", status: "Build Later" },
  { title: "AI Learn Tutor", category: "Academy Helper", status: "Planned" },
  { title: "AI Wallet Explainer", category: "Transaction Help", status: "Planned" },
  { title: "AI Risk Scanner", category: "Wallet Security", status: "Planned" },
  { title: "AI Code Helper", category: "Developer Mode", status: "Planned" },
];

export function AIHubWidget() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Agentic XRPL Intelligence
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            AI Hub
          </h2>
        </div>

        <Bot className="text-white/60" size={20} />
      </div>

      <div className="border border-white/10 bg-black p-5 mb-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-white/60 mt-0.5" />

          <div>
            <p className="font-orbitron text-sm font-bold uppercase mb-2">
              Why AI matters
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              AI wordt de gids door de Terminal: uitleg geven, risico’s
              herkennen, lessen samenvatten, code voorbeelden maken en later
              agentic payments begrijpen met XRP, RLUSD en X402.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {aiItems.map((item) => (
          <div
            key={item.title}
            className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-4 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(item.title)}

                  <p className="font-orbitron text-sm font-bold uppercase">
                    {item.title}
                  </p>
                </div>

                <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                  {item.category}
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-[10px] uppercase text-white/45 mb-2">
                  {item.status}
                </p>

                <ArrowUpRight size={15} className="ml-auto text-white/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getIcon(title: string) {
  const value = title.toLowerCase();

  if (value.includes("assistant")) return <MessageSquareText size={15} className="text-white/70" />;
  if (value.includes("starter")) return <Sparkles size={15} className="text-white/70" />;
  if (value.includes("x402")) return <CreditCard size={15} className="text-white/70" />;
  if (value.includes("mcp")) return <Cpu size={15} className="text-white/70" />;
  if (value.includes("learn")) return <BrainCircuit size={15} className="text-white/70" />;
  if (value.includes("wallet")) return <FileSearch size={15} className="text-white/70" />;
  if (value.includes("risk")) return <ShieldCheck size={15} className="text-white/70" />;
  if (value.includes("code")) return <Code2 size={15} className="text-white/70" />;

  return <Bot size={15} className="text-white/70" />;
}
