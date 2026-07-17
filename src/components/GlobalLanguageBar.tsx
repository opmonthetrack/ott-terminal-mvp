import { Languages } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

export function GlobalLanguageBar() {
  const { language, setLanguage } = useTerminalLanguage();

  return (
    <div className="fixed top-3 right-3 z-30 hidden lg:block">
      <div className="flex items-center gap-2 border border-black/10 bg-white/90 px-2 py-2 shadow-xl shadow-black/10 backdrop-blur-md">
        <Languages size={15} className="text-[#C83888] hidden sm:block" />
        <LanguageToggle language={language} onChange={setLanguage} compact />
      </div>
    </div>
  );
}
