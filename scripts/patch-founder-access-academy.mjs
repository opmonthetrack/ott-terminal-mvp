import fs from "node:fs";

const file = "src/tabs/AcademyTabV4.tsx";
let source = fs.readFileSync(file, "utf8");

const languageImport = 'import { useTerminalLanguage } from "../lib/useTerminalLanguage";';
if (!source.includes('from "../lib/usePremiumAccess"')) {
  source = source.replace(
    languageImport,
    `${languageImport}\nimport { usePremiumAccess } from "../lib/usePremiumAccess";\nimport { WalletGrantProofPanel } from "../components/WalletGrantProofPanel";`,
  );
}

const oldAccess = `  const hasWallet = isWalletAddress(walletAddress);\n  const accessUnlocked = hasWallet && isAccessVerified(loadAccessState(walletAddress));\n  const accountName = getOttAccountName(user);`;
const newAccess = `  const hasWallet = isWalletAddress(walletAddress);\n  const localAccessUnlocked = hasWallet && isAccessVerified(loadAccessState(walletAddress));\n  const premiumAccess = usePremiumAccess(hasWallet ? walletAddress : "");\n  const accessUnlocked = localAccessUnlocked || premiumAccess.entitlements.academyPremium;\n  const walletAcademyUnlocked = localAccessUnlocked || premiumAccess.entitlements.walletAcademy;\n  const accountName = getOttAccountName(user);`;
if (source.includes(oldAccess)) {
  source = source.replace(oldAccess, newAccess);
}

const oldWalletView = `      {view === "wallets" && (\n        <WalletAcademyTracks\n          isEnglish={isEnglish}\n          accessUnlocked={accessUnlocked}\n          onNavigate={onNavigate}\n        />\n      )}`;
const newWalletView = `      {view === "wallets" && (\n        <>\n          <WalletGrantProofPanel\n            isEnglish={isEnglish}\n            signedIn={signedIn}\n            hasWallet={hasWallet}\n            walletAddress={hasWallet ? walletAddress : ""}\n            setupRequired={premiumAccess.setupRequired}\n            loading={premiumAccess.loading}\n            linkBusy={premiumAccess.linkBusy}\n            walletLinked={premiumAccess.walletLinked}\n            walletGrantAvailable={premiumAccess.walletGrantAvailable}\n            entitlements={premiumAccess.entitlements}\n            source={premiumAccess.source}\n            error={premiumAccess.error}\n            onStartProof={() => {\n              void premiumAccess.startWalletProof().catch(() => undefined);\n            }}\n            onRefresh={() => {\n              void premiumAccess.refresh();\n            }}\n            onNavigate={onNavigate}\n          />\n          <WalletAcademyTracks\n            isEnglish={isEnglish}\n            accessUnlocked={walletAcademyUnlocked}\n            onNavigate={onNavigate}\n          />\n        </>\n      )}`;
if (source.includes(oldWalletView)) {
  source = source.replace(oldWalletView, newWalletView);
}

if (!source.includes("const walletAcademyUnlocked")) {
  throw new Error("Premium Academy entitlement variables were not integrated.");
}
if (!source.includes("<WalletGrantProofPanel")) {
  throw new Error("Wallet grant proof panel was not integrated.");
}

fs.writeFileSync(file, source);
console.log("Founder premium grants integrated into Academy.");
