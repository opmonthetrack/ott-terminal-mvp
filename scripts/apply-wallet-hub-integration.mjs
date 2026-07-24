import fs from "node:fs";
import path from "node:path";

function updateFile(relativePath, transform) {
  const file = path.join(process.cwd(), relativePath);
  const source = fs.readFileSync(file, "utf8");
  const updated = transform(source);
  if (updated === source) {
    console.log(`${relativePath}: already integrated`);
    return;
  }
  fs.writeFileSync(file, updated);
  console.log(`${relativePath}: integrated`);
}

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Missing integration anchor: ${label}`);
  return source.replace(before, after);
}

updateFile("src/App.tsx", (input) => {
  let source = input;
  source = replaceRequired(
    source,
    'import type { TerminalLanguage } from "./lib/terminalCopy";\n',
    'import type { TerminalLanguage } from "./lib/terminalCopy";\nimport type { WalletProviderId, WalletVerificationMethod, XrplNetwork } from "./lib/walletRegistry";\n',
    "App wallet registry types",
  );
  source = replaceRequired(
    source,
    `  function connectWallet(address: string) {\n    saveWalletSession(address);\n    setWalletAddress(address);\n    setActiveTab("wallet");\n    setMenuOpen(false);\n  }`,
    `  function connectWallet(\n    address: string,\n    providerId: WalletProviderId = "xaman",\n    network: XrplNetwork = "mainnet",\n    verificationMethod: WalletVerificationMethod = "signed",\n  ) {\n    saveWalletSession({ walletAddress: address, providerId, network, verificationMethod });\n    setWalletAddress(address);\n    setActiveTab("wallet");\n    setMenuOpen(false);\n  }`,
    "App provider-neutral connectWallet",
  );
  source = replaceRequired(
    source,
    '{activeTab === "wallet" && <WalletTab walletAddress={walletAddress} onDisconnect={disconnectWallet} />}',
    '{activeTab === "wallet" && (\n              <WalletTab\n                walletAddress={walletAddress}\n                onWalletConnected={connectWallet}\n                onNavigate={navigateTo}\n                onDisconnect={disconnectWallet}\n              />\n            )}',
    "App WalletTab props",
  );
  return source;
});

updateFile("src/tabs/WalletTab.tsx", (input) => {
  let source = input;
  source = replaceRequired(
    source,
    'import { useEffect, useMemo, useState, type ElementType } from "react";\n',
    'import { useEffect, useMemo, useState, type ElementType } from "react";\nimport { WalletHub } from "../components/WalletHub";\n',
    "WalletTab WalletHub import",
  );
  source = replaceRequired(
    source,
    'import { useTerminalLanguage } from "../lib/useTerminalLanguage";\n',
    'import { useTerminalLanguage } from "../lib/useTerminalLanguage";\nimport type { WalletProviderId, WalletVerificationMethod, XrplNetwork } from "../lib/walletRegistry";\n',
    "WalletTab wallet types",
  );
  source = replaceRequired(
    source,
    `type WalletTabProps = {\n  walletAddress?: string;\n  onDisconnect?: () => void;\n};`,
    `type WalletTabProps = {\n  walletAddress?: string;\n  onWalletConnected?: (\n    address: string,\n    providerId: WalletProviderId,\n    network: XrplNetwork,\n    verificationMethod: WalletVerificationMethod,\n  ) => void;\n  onNavigate?: (target: string) => void;\n  onDisconnect?: () => void;\n};`,
    "WalletTab provider-neutral props",
  );
  source = replaceRequired(
    source,
    'export function WalletTab({ walletAddress = "guest", onDisconnect }: WalletTabProps) {',
    'export function WalletTab({ walletAddress = "guest", onWalletConnected, onNavigate, onDisconnect }: WalletTabProps) {',
    "WalletTab function signature",
  );
  source = replaceRequired(
    source,
    `            <WalletConnectionCard\n              walletAddress={walletAddress}\n              hasWallet={hasWallet}\n              snapshot={walletSnapshot}\n              busy={walletBusy}\n              error={walletError}\n              onRefresh={() => void refreshWallet()}\n              onCopy={copyWallet}\n              onDisconnect={onDisconnect}\n              isEnglish={isEnglish}\n            />\n\n`,
    "",
    "remove legacy wallet summary card",
  );
  source = replaceRequired(
    source,
    `        <section className="mt-8 rounded-3xl border border-slate-200 p-6 sm:p-8">\n          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">`,
    `        <div className="mt-8">\n          <WalletHub\n            walletAddress={walletAddress}\n            onWalletConnected={onWalletConnected}\n            onUseXaman={() => onNavigate?.("xaman")}\n            onOpenAcademy={() => onNavigate?.("academy")}\n            onDisconnect={onDisconnect}\n          />\n        </div>\n\n        <section className="mt-8 rounded-3xl border border-slate-200 p-6 sm:p-8">\n          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">`,
    "WalletHub render",
  );
  source = source.replace(
    'range="#0001–#5000"',
    'range="#00001–#50000"',
  );
  return source;
});
