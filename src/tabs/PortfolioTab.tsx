import { useEffect, useState } from "react";
import { AgeWalletDna } from "../components/AgeWalletDna";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";
import { loadWalletSession } from "../lib/walletSession";

export function PortfolioTab({ walletAddress }: { walletAddress: string }) {
  const { language } = useTerminalLanguage();
  const [session, setSession] = useState(() => loadWalletSession());
  useEffect(() => {
    const sync = () => setSession(loadWalletSession());
    window.addEventListener("ott-wallet-session-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ott-wallet-session-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return <AgeWalletDna account={walletAddress} network={session?.network ?? "mainnet"} language={language} />;
}
