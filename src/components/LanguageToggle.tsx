import { Languages } from "lucide-react";
import type { TerminalLanguage } from "../lib/terminalCopy";

type LanguageToggleProps = {
  language: TerminalLanguage;
  onChange: (language: TerminalLanguage) => void;
  compact?: boolean;
};

export function LanguageToggle({
  language,
  onChange,
  compact = false,
}: LanguageToggleProps) {
  return (
    <div className="inline-flex items-center gap-2 border border-black/10 bg-white/90 p-1 shadow-sm">
      {!compact && <Languages size={15} className="text-[#C83888] ml-2" />}

      <button
        type="button"
        onClick={() => onChange("nl")}
        className={`px-3 py-2 font-orbitron text-[10px] font-black uppercase tracking-widest transition-all ${
          language === "nl"
            ? "bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white"
            : "text-black/45 hover:text-black"
        }`}
      >
        NL
      </button>

      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-3 py-2 font-orbitron text-[10px] font-black uppercase tracking-widest transition-all ${
          language === "en"
            ? "bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white"
            : "text-black/45 hover:text-black"
        }`}
      >
        EN
      </button>
    </div>
  );
}
