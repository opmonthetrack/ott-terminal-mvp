import { AccessPassOrderPanel } from "../components/AccessPassOrderPanel";
import { AccessGateTab as AccessGateCore } from "./AccessGateTab";

type AccessGateTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

export function AccessGateTab({ walletAddress = "guest", onNavigate }: AccessGateTabProps) {
  return (
    <>
      <AccessGateCore walletAddress={walletAddress} />
      <AccessPassOrderPanel walletAddress={walletAddress} onNavigate={onNavigate} />
    </>
  );
}
