import { AcademyProgressDashboard } from "../components/AcademyProgressDashboard";
import { WalletAcademyPanel } from "../components/WalletAcademyPanel";
import { AcademyTab as AcademyCore } from "./AcademyTabV5";

type AcademyTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

export function AcademyTab(props: AcademyTabProps) {
  return (
    <>
      <AcademyCore {...props} />
      <WalletAcademyPanel />
      <AcademyProgressDashboard
        walletAddress={props.walletAddress}
        onNavigate={props.onNavigate}
      />
    </>
  );
}
