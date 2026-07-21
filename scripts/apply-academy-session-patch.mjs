import fs from "node:fs/promises";

async function patchFile(path, replacements) {
  let content = await fs.readFile(path, "utf8");
  let changed = false;

  for (const replacement of replacements) {
    if (content.includes(replacement.after)) {
      continue;
    }

    if (!content.includes(replacement.before)) {
      throw new Error(`Could not find expected patch target in ${path}: ${replacement.before.slice(0, 100)}`);
    }

    content = content.replace(replacement.before, replacement.after);
    changed = true;
  }

  if (changed) {
    await fs.writeFile(path, content);
  }

  return changed;
}

const appChanged = await patchFile("src/App.tsx", [
  {
    before: 'import type { TerminalLanguage } from "./lib/terminalCopy";\n',
    after:
      'import type { TerminalLanguage } from "./lib/terminalCopy";\nimport { clearWalletSession, getStoredWalletAddress, saveWalletSession } from "./lib/walletSession";\n',
  },
  {
    before: '  const [walletAddress, setWalletAddress] = useState<string>("guest");',
    after: '  const [walletAddress, setWalletAddress] = useState<string>(() => getStoredWalletAddress());',
  },
  {
    before: '          setWalletAddress(response.verified.account);\n          setActiveTab(returnState.returnTarget);',
    after:
      '          saveWalletSession(response.verified.account);\n          setWalletAddress(response.verified.account);\n          setActiveTab(returnState.returnTarget);',
  },
  {
    before: '  function connectWallet(address: string) {\n    setWalletAddress(address);',
    after: '  function connectWallet(address: string) {\n    saveWalletSession(address);\n    setWalletAddress(address);',
  },
  {
    before:
      '  function connectWallet(address: string) {\n    saveWalletSession(address);\n    setWalletAddress(address);\n    setActiveTab("wallet");\n    setIsMobileMenuOpen(false);\n  }\n\n  return (',
    after:
      '  function connectWallet(address: string) {\n    saveWalletSession(address);\n    setWalletAddress(address);\n    setActiveTab("wallet");\n    setIsMobileMenuOpen(false);\n  }\n\n  function disconnectWallet() {\n    clearWalletSession();\n    setWalletAddress("guest");\n    setAccessUnlocked(false);\n    setActiveTab("home");\n    setIsMobileMenuOpen(false);\n    setXamanReturnStatus("Wallet session disconnected.");\n\n    window.setTimeout(() => setXamanReturnStatus(""), 2500);\n  }\n\n  return (',
  },
  {
    before: '            {activeTab === "wallet" && <WalletTab walletAddress={walletAddress} />}',
    after: '            {activeTab === "wallet" && <WalletTab walletAddress={walletAddress} onDisconnect={disconnectWallet} />}',
  },
  {
    before: '            {activeTab === "academy" && <AcademyTab />}',
    after: '            {activeTab === "academy" && <AcademyTab walletAddress={walletAddress} onNavigate={navigateTo} />}',
  },
  {
    before: '        { id: "wallet", label: isEnglish ? "Wallet Dashboard" : "Wallet Overzicht", status: "Xaman" },',
    after: '        { id: "wallet", label: isEnglish ? "Wallet & Profile" : "Wallet & Profiel", status: "Xaman" },',
  },
  {
    before:
      '  useEffect(() => {\n    if (!isMobileMenuOpen) {\n      return;\n    }',
    after:
      '  useEffect(() => {\n    const syncWalletSession = () => {\n      const storedAddress = getStoredWalletAddress();\n      setWalletAddress((currentAddress) =>\n        currentAddress === storedAddress ? currentAddress : storedAddress,\n      );\n    };\n\n    window.addEventListener("storage", syncWalletSession);\n    window.addEventListener("ott-wallet-session-changed", syncWalletSession);\n\n    return () => {\n      window.removeEventListener("storage", syncWalletSession);\n      window.removeEventListener("ott-wallet-session-changed", syncWalletSession);\n    };\n  }, []);\n\n  useEffect(() => {\n    if (!isMobileMenuOpen) {\n      return;\n    }',
  },
]);

const clientChanged = await patchFile("src/lib/xamanClient.ts", [
  {
    before: 'import { addMainnetLockedEvent, addXpRewardEvent } from "./rewardStore";\n',
    after:
      'import { addMainnetLockedEvent, addXpRewardEvent } from "./rewardStore";\nimport { saveWalletSession } from "./walletSession";\n',
  },
  {
    before:
      '  creditXamanReturnReward(response, actionId);\n\n  return response;',
    after:
      '  if (response.verified?.makeWavesVerified && response.verified.account) {\n    saveWalletSession(response.verified.account);\n  }\n\n  creditXamanReturnReward(response, actionId);\n\n  return response;',
  },
]);

console.log(JSON.stringify({ appChanged, clientChanged }));
