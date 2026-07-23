import fs from "node:fs";

const file = "src/tabs/AcademyTabV4.tsx";
let source = fs.readFileSync(file, "utf8");

const importNeedle = 'import { useTerminalLanguage } from "../lib/useTerminalLanguage";';
const importReplacement = `${importNeedle}\nimport { WalletAcademyTracks } from "./WalletAcademyTracks";`;
if (!source.includes('from "./WalletAcademyTracks"')) {
  if (!source.includes(importNeedle)) throw new Error("Academy import anchor not found.");
  source = source.replace(importNeedle, importReplacement);
}

source = source.replace(
  'type AcademyView = "hub" | "library" | "course" | "certificate";',
  'type AcademyView = "hub" | "library" | "wallets" | "course" | "certificate";',
);

const libraryRender = `      {view === "library" && (\n        <AcademyLibrary\n          isEnglish={isEnglish}\n          query={libraryQuery}\n          setQuery={setLibraryQuery}\n          courses={libraryCourses}\n          onOpenCourse={openCourse}\n        />\n      )}\n`;
const walletRender = `${libraryRender}\n      {view === "wallets" && (\n        <WalletAcademyTracks\n          isEnglish={isEnglish}\n          accessUnlocked={accessUnlocked}\n          onNavigate={onNavigate}\n        />\n      )}\n`;
if (!source.includes('view === "wallets"')) {
  if (!source.includes(libraryRender)) throw new Error("Academy library render anchor not found.");
  source = source.replace(libraryRender, walletRender);
}

const libraryButton = `            <ViewButton active={view === "library"} onClick={() => setView("library")}>\n              {isEnglish ? "Library" : "Bibliotheek"}\n            </ViewButton>\n`;
const walletButton = `${libraryButton}            <ViewButton active={view === "wallets"} onClick={() => setView("wallets")}>\n              {isEnglish ? "Wallet Academy" : "Wallet Academy"}\n            </ViewButton>\n`;
if (!source.includes('active={view === "wallets"}')) {
  if (!source.includes(libraryButton)) throw new Error("Academy header button anchor not found.");
  source = source.replace(libraryButton, walletButton);
}

if (!source.includes('type AcademyView = "hub" | "library" | "wallets"')) {
  throw new Error("Academy view type was not extended.");
}

fs.writeFileSync(file, source);
console.log("Premium Wallet Academy integrated.");
