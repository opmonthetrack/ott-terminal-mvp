import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content);
}

{
  const file = "src/App.tsx";
  let source = read(file);

  source = source.replaceAll(
    'aria-current={selected ? "page" : undefined}',
    'aria-current={activeTab === item.id ? "page" : undefined}',
  );

  source = source.replace(
    '(["dashboard", "news", "ottintelligence"] as ActiveTab[])',
    '(["news", "ottintelligence"] as ActiveTab[])',
  );

  const walletLine = '  const walletConnected = Boolean(walletAddress && walletAddress !== "guest");\n';
  if (!source.includes('const dialog = document.getElementById("all-tools-dialog")')) {
    source = source.replace(
      walletLine,
      `${walletLine}\n  useEffect(() => {\n    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;\n    const dialog = document.getElementById("all-tools-dialog");\n    const focusable = dialog?.querySelectorAll<HTMLElement>(\n      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',\n    );\n    focusable?.[0]?.focus();\n\n    const onKeyDown = (event: KeyboardEvent) => {\n      if (event.key === "Escape") {\n        event.preventDefault();\n        onClose();\n        return;\n      }\n      if (event.key !== "Tab" || !focusable?.length) return;\n      const first = focusable[0];\n      const last = focusable[focusable.length - 1];\n      if (event.shiftKey && document.activeElement === first) {\n        event.preventDefault();\n        last.focus();\n      } else if (!event.shiftKey && document.activeElement === last) {\n        event.preventDefault();\n        first.focus();\n      }\n    };\n\n    dialog?.addEventListener("keydown", onKeyDown);\n    return () => {\n      dialog?.removeEventListener("keydown", onKeyDown);\n      previous?.focus();\n    };\n  }, [onClose]);\n`,
    );
  }

  source = source.replace(
    '<div\n      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/30 p-3 backdrop-blur-sm sm:p-6"\n      role="dialog"',
    '<div\n      id="all-tools-dialog"\n      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/30 p-3 backdrop-blur-sm sm:p-6"\n      role="dialog"',
  );

  source = source.replace(
    '<div className="min-h-screen bg-white text-[#111827] selection:bg-[#2563EB]/15">',
    '<div className="min-h-screen bg-white text-[#111827] selection:bg-[#2563EB]/15">\n      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-slate-950 focus:shadow-lg">\n        {language === "en" ? "Skip to main content" : "Ga naar de hoofdinhoud"}\n      </a>',
  );

  write(file, source);
}

{
  const file = "src/tabs/TerminalHomeTab.tsx";
  let source = read(file);

  source = source.replace(
    '<h2 id="welcome-choice-title" className="mt-3 text-3xl font-semibold tracking-tight">\n            {isEnglish ? "Choose what you need right now." : "Kies wat je nu nodig hebt."}',
    '<h2 className="mt-3 text-3xl font-semibold tracking-tight">\n            {isEnglish ? "Choose what you need right now." : "Kies wat je nu nodig hebt."}',
  );

  const functionStart = source.indexOf("function WelcomeChoice(");
  if (functionStart < 0) {
    throw new Error("WelcomeChoice function not found");
  }

  const before = source.slice(0, functionStart);
  let welcome = source.slice(functionStart);
  welcome = welcome.replace(
    '<h2 className="mt-3 text-3xl font-semibold tracking-tight">',
    '<h2 id="welcome-choice-title" className="mt-3 text-3xl font-semibold tracking-tight">',
  );
  source = before + welcome;

  write(file, source);
}

console.log("Corrected hardening output semantics and dialog focus management.");
