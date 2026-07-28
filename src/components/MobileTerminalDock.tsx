import { useEffect, useMemo, useState, type ElementType } from "react";
import { BookOpen, Compass, Home, Search, Wallet } from "lucide-react";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type DockItem = {
  id: string;
  label: string;
  icon: ElementType;
  tabs: string[];
};

const FOUNDER_KEYS = ["founder", "issuer", "accessissuer", "accessmanager", "research"];
const RETURN_KEYS = [
  "support_payment_return",
  "access_payment_return",
  "access_accept_return",
  "wallet_link_return",
  "payload",
  "uuid",
];

function currentTab() {
  if (typeof window === "undefined") return "home";
  return new URLSearchParams(window.location.search).get("tab") || "home";
}

function founderSurfaceActive() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return FOUNDER_KEYS.some((key) => params.get(key) === "1");
}

export function MobileTerminalDock() {
  const { language } = useTerminalLanguage();
  const { signedIn } = useOttAuthSession();
  const [activeTab, setActiveTab] = useState(currentTab);
  const hidden = founderSurfaceActive();
  const en = language === "en";

  const items = useMemo<DockItem[]>(() => [
    {
      id: "home",
      label: en ? "Terminal" : "Terminal",
      icon: Home,
      tabs: ["home"],
    },
    {
      id: "academy",
      label: en ? "Learn" : "Leren",
      icon: BookOpen,
      tabs: ["academy", "xamanactivation"],
    },
    {
      id: "intel",
      label: en ? "Explore" : "Ontdek",
      icon: Compass,
      tabs: ["intel", "news", "ottintelligence", "ecosystem", "validator", "developer", "tokenization", "defi"],
    },
    {
      id: "network",
      label: en ? "Tools" : "Tools",
      icon: Search,
      tabs: ["network", "xrplverify", "source", "checkin"],
    },
    {
      id: "wallet",
      label: signedIn ? (en ? "Wallet" : "Wallet") : (en ? "Initialize" : "Initialiseer"),
      icon: Wallet,
      tabs: ["wallet", "xaman", "accessgate", "rewardledger", "dashboard"],
    },
  ], [en, signedIn]);

  useEffect(() => {
    const syncRoute = () => setActiveTab(currentTab());
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  useEffect(() => {
    if (hidden) {
      document.body.classList.remove("ott-mobile-dock-mounted");
      return;
    }
    document.body.classList.add("ott-mobile-dock-mounted");
    return () => document.body.classList.remove("ott-mobile-dock-mounted");
  }, [hidden]);

  if (hidden) return null;

  function navigate(target: string) {
    const url = new URL(window.location.href);
    if (target === "home") url.searchParams.delete("tab");
    else url.searchParams.set("tab", target);
    [...FOUNDER_KEYS, ...RETURN_KEYS].forEach((key) => url.searchParams.delete(key));
    window.history.pushState({}, document.title, url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[130] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-lg px-3 pb-2">
        <nav
          className="grid grid-cols-5 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur"
          aria-label={en ? "Mobile terminal navigation" : "Mobiele terminalnavigatie"}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const selected = item.tabs.includes(activeTab);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                aria-current={selected ? "page" : undefined}
                className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition ${
                  selected
                    ? "bg-slate-950 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={18} strokeWidth={1.9} />
                <span className="max-w-full truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
