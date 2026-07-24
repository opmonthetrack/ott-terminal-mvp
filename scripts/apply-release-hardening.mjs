import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const changed = new Set();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content);
  changed.add(relativePath);
}

function replaceRequired(relativePath, from, to, label) {
  const current = read(relativePath);
  if (!current.includes(from)) {
    throw new Error(`${relativePath}: required pattern missing (${label})`);
  }
  write(relativePath, current.replace(from, to));
}

function replaceAllIfPresent(relativePath, from, to) {
  const current = read(relativePath);
  if (!current.includes(from)) return 0;
  const count = current.split(from).length - 1;
  write(relativePath, current.split(from).join(to));
  return count;
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return [absolute];
  });
}

// 1. Remove nested main landmarks from route/component implementations.
for (const base of ["src/tabs", "src/components"]) {
  const directory = path.join(root, base);
  if (!fs.existsSync(directory)) continue;
  for (const absolute of walk(directory)) {
    if (!absolute.endsWith(".tsx")) continue;
    const relative = path.relative(root, absolute).replaceAll("\\", "/");
    let source = fs.readFileSync(absolute, "utf8");
    if (!source.includes("<main") && !source.includes("</main>")) continue;
    source = source.replaceAll("<main", '<div data-page-region="true"');
    source = source.replaceAll("</main>", "</div>");
    write(relative, source);
  }
}

// 2. App shell: visible mobile language switch, accessible dialogs/navigation,
// semantic H1 fallbacks, safe label fallback and Dutch fallback translations.
{
  const file = "src/App.tsx";
  let source = read(file);

  source = source.replace(
    '  const accountName = getOttAccountName(user);\n',
    `  const accountName = getOttAccountName(user);\n\n  useEffect(() => {\n    const dutchFallbacks: Record<string, string> = {\n      "Privacy Policy": "Privacybeleid",\n      "Terms of Use": "Gebruiksvoorwaarden",\n      "OTT COMMAND DASHBOARD": "OTT-DAGOVERZICHT",\n      "DAILY INTELLIGENCE SNAPSHOT": "DAGELIJKSE INTELLIGENCE-MOMENTOPNAME",\n      "XAMAN PAYMENT": "XAMAN-BETALING",\n      "Free": "Gratis",\n      "Verify Access": "Toegang verifiëren",\n    };\n\n    const applyAccessibilityFallbacks = () => {\n      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(\n        "input, textarea, select",\n      ).forEach((control) => {\n        const hasName = control.hasAttribute("aria-label") ||\n          control.hasAttribute("aria-labelledby") ||\n          Boolean(control.id && document.querySelector(\`label[for=\"\${CSS.escape(control.id)}\"]\`)) ||\n          Boolean(control.closest("label"));\n\n        if (!hasName) {\n          const fallback = control.getAttribute("placeholder") ||\n            control.getAttribute("name") ||\n            (language === "en" ? "Input field" : "Invoerveld");\n          control.setAttribute("aria-label", fallback);\n        }\n      });\n\n      if (language !== "nl") return;\n\n      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);\n      let node = walker.nextNode();\n      while (node) {\n        const value = node.nodeValue ?? "";\n        const trimmed = value.trim();\n        const replacement = dutchFallbacks[trimmed];\n        if (replacement) {\n          node.nodeValue = value.replace(trimmed, replacement);\n        }\n        node = walker.nextNode();\n      }\n    };\n\n    applyAccessibilityFallbacks();\n    const observer = new MutationObserver(applyAccessibilityFallbacks);\n    observer.observe(document.body, { childList: true, subtree: true });\n    return () => observer.disconnect();\n  }, [activeTab, language]);\n`,
  );

  source = source.replace(
    '<main className="min-h-[calc(100vh-72px)] bg-white">',
    `<main id="main-content" className="min-h-[calc(100vh-72px)] bg-white" tabIndex={-1}>\n        {(["dashboard", "news", "ottintelligence"] as ActiveTab[]).includes(activeTab) && (\n          <h1 className="sr-only">{activeItem?.label ?? "OTT Terminal"}</h1>\n        )}`,
  );

  source = source.replace(
    'className="hidden items-center rounded-lg border border-slate-200 p-1 sm:flex"',
    'className="flex items-center rounded-lg border border-slate-200 p-1"',
  );

  source = source.replaceAll(
    'onClick={() => setLanguage("en")}\n',
    'onClick={() => setLanguage("en")}\n              aria-pressed={language === "en"}\n',
  );
  source = source.replaceAll(
    'onClick={() => setLanguage("nl")}\n',
    'onClick={() => setLanguage("nl")}\n              aria-pressed={language === "nl"}\n',
  );

  source = source.replaceAll(
    'onClick={() => onNavigate(item.id)}\n',
    'onClick={() => onNavigate(item.id)}\n                  aria-current={selected ? "page" : undefined}\n',
  );

  source = source.replace(
    'role="dialog"\n      aria-modal="true"',
    'role="dialog"\n      aria-modal="true"\n      aria-labelledby="all-tools-title"',
  );
  source = source.replace(
    '<h2 className="text-xl font-semibold tracking-tight text-slate-950">',
    '<h2 id="all-tools-title" className="text-xl font-semibold tracking-tight text-slate-950">',
  );
  source = source.replace(
    'aria-label="Close menu"',
    'aria-label={language === "en" ? "Close menu" : "Menu sluiten"}',
  );
  source = source.replace(
    '<div className="fixed left-1/2 top-24 z-[60] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-lg">',
    '<div role="status" aria-live="polite" className="fixed left-1/2 top-24 z-[60] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-lg">',
  );

  write(file, source);
}

// 3. Welcome modal: name, Escape, focus containment and restoration.
{
  const file = "src/tabs/TerminalHomeTab.tsx";
  let source = read(file);
  source = source.replace(
    '}) {\n  return (\n    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">',
    `}) {\n  useEffect(() => {\n    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;\n    const dialog = document.getElementById("welcome-choice-dialog");\n    const focusable = dialog?.querySelectorAll<HTMLElement>(\n      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',\n    );\n    focusable?.[0]?.focus();\n\n    const onKeyDown = (event: KeyboardEvent) => {\n      if (event.key === "Escape") {\n        event.preventDefault();\n        onClose();\n        return;\n      }\n      if (event.key !== "Tab" || !focusable?.length) return;\n      const first = focusable[0];\n      const last = focusable[focusable.length - 1];\n      if (event.shiftKey && document.activeElement === first) {\n        event.preventDefault();\n        last.focus();\n      } else if (!event.shiftKey && document.activeElement === last) {\n        event.preventDefault();\n        first.focus();\n      }\n    };\n\n    dialog?.addEventListener("keydown", onKeyDown);\n    return () => {\n      dialog?.removeEventListener("keydown", onKeyDown);\n      previous?.focus();\n    };\n  }, [onClose]);\n\n  return (\n    <div id="welcome-choice-dialog" className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="welcome-choice-title">`,
  );
  source = source.replace(
    '<button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close" />',
    '<button type="button" className="absolute inset-0" onClick={onClose} aria-label={isEnglish ? "Close welcome" : "Welkom sluiten"} />',
  );
  source = source.replace(
    '<h2 className="mt-3 text-3xl font-semibold tracking-tight">',
    '<h2 id="welcome-choice-title" className="mt-3 text-3xl font-semibold tracking-tight">',
  );
  write(file, source);
}

// 4. Support amount buttons expose selected state and Dutch heading.
{
  const file = "src/tabs/SupportDonationTab.tsx";
  let source = read(file);
  source = source.replace(
    '<p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">Xaman payment</p>',
    '<p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">{en ? "Xaman payment" : "Xaman-betaling"}</p>',
  );
  source = source.replace(
    '<button key={amount} type="button" onClick={() => setSelectedAmount(amount)} className={`rounded-2xl border px-5 py-5 text-left transition ${selectedAmount === amount ? "border-slate-950 bg-slate-950 text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-400"}`}>',
    '<button key={amount} type="button" aria-pressed={selectedAmount === amount} aria-label={`${amount} XRP`} onClick={() => setSelectedAmount(amount)} className={`rounded-2xl border px-5 py-5 text-left transition ${selectedAmount === amount ? "border-slate-950 bg-slate-950 text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-400"}`}>',
  );
  write(file, source);
}

// 5. Dashboard title is a localized H1 instead of a hardcoded H2.
{
  const file = "src/tabs/DashboardTab.tsx";
  let source = read(file);
  source = source.replace(
    '<h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">\n                Daily Intelligence Snapshot\n              </h2>',
    '<h1 className="font-orbitron text-3xl xl:text-4xl font-black mb-4">\n                {isEnglish ? "Daily intelligence snapshot" : "Dagelijkse intelligence-momentopname"}\n              </h1>',
  );
  source = source.replace(
    'OTT Command Dashboard',
    '{isEnglish ? "OTT command dashboard" : "OTT-dagoverzicht"}',
  );
  write(file, source);
}

// 6. Complete the central Dutch copy dictionary.
{
  const file = "src/lib/terminalCopy.ts";
  let source = read(file);
  const replacements = new Map([
    ['continueRoute: "Ga verder"', 'continueRoute: "Ga verder"'],
    ['connectXaman: "Connect Xaman"', 'connectXaman: "Xaman koppelen"'],
    ['openExplorer: "Open Explorer"', 'openExplorer: "Open verkenner"'],
    ['openWallet: "Open Wallet"', 'openWallet: "Open wallet"'],
    ['openProofLayer: "Open Proof Layer"', 'openProofLayer: "Open bewijslaag"'],
    ['startExplorer: "Start Explorer"', 'startExplorer: "Start verkenner"'],
    ['connectXamanText: "Mobiele wallet flow"', 'connectXamanText: "Mobiele walletstroom"'],
    ['threeLayerTitle: "Three-Layer XRPL Terminal"', 'threeLayerTitle: "XRPL-terminal met drie lagen"'],
    ['explorerTitle: "XRPL Explorer"', 'explorerTitle: "XRPL-verkenner"'],
    ['explorerLabel: "Public Layer"', 'explorerLabel: "Publieke laag"'],
    ['dashboardTitle: "Xaman Wallet Dashboard"', 'dashboardTitle: "Xaman-walletoverzicht"'],
    ['dashboardLabel: "Connected Layer"', 'dashboardLabel: "Gekoppelde laag"'],
    ['proofLabel: "OnTheTrack Layer"', 'proofLabel: "OnTheTrack-laag"'],
    ['mainFlow: "Nieuwe hoofdroute"', 'mainFlow: "Nieuwe hoofdroute"'],
    ['createPayload: "Create Access Payload"', 'createPayload: "Toegangsverzoek maken"'],
    ['openBanxa: "Open Banxa"', 'openBanxa: "Banxa openen"'],
    ['verifyPayment: "Verify Access Payment"', 'verifyPayment: "Toegangsbetaling controleren"'],
    ['txHashLabel: "Access Payment Tx Hash"', 'txHashLabel: "Transactiehash van toegangsbetaling"'],
    ['destinationWallet: "Destination Wallet"', 'destinationWallet: "Bestemmingswallet"'],
    ['connectButton: "Connect With Xaman"', 'connectButton: "Koppelen met Xaman"'],
    ['connectButtonText: "Mobile deeplink first / QR fallback second"', 'connectButtonText: "Eerst mobiele deeplink, daarna QR als terugval"'],
    ['createOnly: "Create Only"', 'createOnly: "Alleen aanmaken"'],
    ['openXaman: "Open Xaman"', 'openXaman: "Xaman openen"'],
    ['verify: "Verify"', 'verify: "Controleren"'],
    ['qrFallback: "QR fallback"', 'qrFallback: "QR-terugval"'],
    ['mobileStatusReady: "Mobile mode: Xaman deeplink ready."', 'mobileStatusReady: "Mobiele modus: Xaman-deeplink is klaar."'],
    ['desktopStatusReady: "Desktop mode: QR and deeplink available."', 'desktopStatusReady: "Desktopmodus: QR en deeplink beschikbaar."'],
    ['creatingPayload: "Creating Xaman payload..."', 'creatingPayload: "Xaman-verzoek wordt aangemaakt..."'],
    ['openingXaman: "Payload saved. Opening Xaman app..."', 'openingXaman: "Verzoek opgeslagen. Xaman wordt geopend..."'],
    ['signingWaiting: "Xaman signing is still waiting."', 'signingWaiting: "De ondertekening in Xaman wacht nog."'],
    ['signatureFound: "Signature found. Wallet connected."', 'signatureFound: "Handtekening gevonden. Wallet gekoppeld."'],
    ['rejectedExpired: "Signature rejected or expired. Try again."', 'rejectedExpired: "Handtekening geweigerd of verlopen. Probeer opnieuw."'],
    ['safeTitle: "Safe Position"', 'safeTitle: "Veilige uitgangspositie"'],
  ]);
  for (const [from, to] of replacements) source = source.replace(from, to);
  source = source.replace(
    'safeLines: [\n        "No custody",\n        "No broker",\n        "No yield provider",\n        "No trade execution",\n        "User signs inside Xaman",\n      ],',
    'safeLines: [\n        "Geen custody",\n        "Geen broker",\n        "Geen yieldprovider",\n        "Geen handelsuitvoering",\n        "De gebruiker ondertekent in Xaman",\n      ],',
  );
  write(file, source);
}

// 7. Global accessibility and visual-unification layer.
{
  const file = "src/index.css";
  let source = read(file);
  const marker = "/* OTT release hardening: accessibility and unified interface */";
  if (!source.includes(marker)) {
    source += `\n\n${marker}\n:root {\n  --ott-text: #0f172a;\n  --ott-muted: #475569;\n  --ott-subtle: #334155;\n  --ott-focus: #1d4ed8;\n}\n\nhtml {\n  scroll-behavior: smooth;\n}\n\nbody {\n  font-family: var(--font-sans);\n  line-height: 1.5;\n}\n\n.font-orbitron,\n.font-mono {\n  font-family: var(--font-sans) !important;\n}\n\n[class*="uppercase"] {\n  text-transform: none !important;\n  letter-spacing: normal !important;\n}\n\n[class*="text-black/"] ,\n[class*="text-slate-400"],\n[class*="text-slate-500"],\n[class*="text-gray-400"],\n[class*="text-gray-500"] {\n  color: var(--ott-muted) !important;\n}\n\n[class*="bg-black"] [class*="text-black/"],\n[class*="bg-slate-9"] [class*="text-slate-"],\n[class*="bg-[#080808]"] [class*="text-black/"],\n[class*="bg-[#111827]"] [class*="text-slate-"] {\n  color: #e2e8f0 !important;\n}\n\n[class*="text-transparent"] {\n  color: var(--ott-text) !important;\n  -webkit-text-fill-color: var(--ott-text) !important;\n  background-image: none !important;\n}\n\nbutton,\n[role="button"] {\n  min-width: 44px;\n  min-height: 44px;\n}\n\nbutton:focus-visible,\na:focus-visible,\ninput:focus-visible,\ntextarea:focus-visible,\nselect:focus-visible,\n[tabindex]:focus-visible {\n  outline: 3px solid var(--ott-focus) !important;\n  outline-offset: 3px !important;\n}\n\ninput, textarea, select {\n  min-height: 44px;\n}\n\n.text-\\[10px\\],\n.text-\\[11px\\] {\n  font-size: 0.8125rem !important;\n  line-height: 1.35rem !important;\n}\n\n@media (max-width: 640px) {\n  header > div:first-child {\n    gap: 0.5rem;\n  }\n\n  header [aria-pressed] {\n    padding-inline: 0.625rem !important;\n  }\n}\n`;
    write(file, source);
  }
}

// 8. Make CI prove reproducibility and run on all agent hardening branches.
{
  const file = ".github/workflows/platform-quality.yml";
  let source = read(file);
  source = source.replace(
    '      - feature/complete-platform-foundations',
    '      - feature/complete-platform-foundations\n      - "agent/**"',
  );
  source = source.replace(
    /      - name: Install dependencies[\s\S]*?        run: npm install --no-audit --no-fund/,
    '      - name: Install dependencies reproducibly\n        run: npm ci --no-audit --no-fund',
  );
  write(file, source);
}

console.log("Release hardening migration updated:");
for (const file of [...changed].sort()) console.log(`- ${file}`);
