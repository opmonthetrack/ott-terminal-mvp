import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, "utf8");
}

function replaceOnce(content, before, after, label) {
  const first = content.indexOf(before);
  if (first < 0) throw new Error(`Patch stopped: expected block not found for ${label}.`);
  if (content.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Patch stopped: expected block is not unique for ${label}.`);
  }
  return content.slice(0, first) + after + content.slice(first + before.length);
}

function patchFile(relativePath, transformations) {
  let content = read(relativePath);
  for (const transformation of transformations) {
    content = replaceOnce(content, transformation.before, transformation.after, transformation.label);
  }
  write(relativePath, content);
  console.log(`updated ${relativePath}`);
}

patchFile("src/components/TerminalStartTour.tsx", [
  {
    label: "center Start Tour launch button",
    before: 'className="ott-tour-launch fixed bottom-[7.75rem] right-4 z-[135] inline-flex min-h-12 items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold shadow-2xl transition hover:-translate-y-0.5 md:bottom-5 md:right-5"',
    after: 'className="ott-tour-launch fixed bottom-[7.75rem] left-1/2 z-[135] inline-flex min-h-12 -translate-x-1/2 items-center gap-3 rounded-2xl px-6 py-3 text-sm font-semibold shadow-2xl transition hover:-translate-x-1/2 hover:-translate-y-0.5 md:bottom-5"',
  },
]);

patchFile("src/tabs/TerminalHomeTab.tsx", [
  {
    label: "OTT branded home hero",
    before: '<section className="border-b border-slate-200">',
    after: '<section className="relative overflow-hidden border-b border-blue-200 bg-[radial-gradient(circle_at_16%_12%,rgba(49,92,255,0.24),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(239,47,145,0.20),transparent_30%),linear-gradient(135deg,#eef4ff_0%,#ffffff_52%,#fff1fa_100%)]">',
  },
  {
    label: "OTT home headline typography",
    before: '<h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">',
    after: '<h1 className="max-w-3xl font-orbitron text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">',
  },
  {
    label: "OTT gradient primary home action",
    before: 'className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"',
    after: 'className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-300/30 transition hover:brightness-95"',
  },
]);

patchFile("src/tabs/AcademyTabV4.tsx", [
  {
    label: "Academy ElementType import",
    before: 'import { useEffect, useMemo, useState, type ReactNode } from "react";',
    after: 'import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";',
  },
  {
    label: "Academy branded navigation buttons",
    before: `          <div className="flex flex-wrap gap-2">
            <ViewButton active={view === "hub"} onClick={() => setView("hub")}>
              {isEnglish ? "Courses" : "Cursussen"}
            </ViewButton>
            <ViewButton active={view === "library"} onClick={() => setView("library")}>
              {isEnglish ? "Library" : "Bibliotheek"}
            </ViewButton>
            <ViewButton active={view === "wallets"} onClick={() => setView("wallets")}>
              {isEnglish ? "Wallet Academy" : "Wallet Academy"}
            </ViewButton>
            <ViewButton active={view === "certificate"} onClick={() => setView("certificate")}>
              {isEnglish ? "NFT certificate" : "NFT-certificaat"}
            </ViewButton>
          </div>`,
    after: `          <div className="grid w-full grid-cols-2 gap-3 lg:w-auto lg:grid-cols-4">
            <ViewButton icon={BookOpen} active={view === "hub"} onClick={() => setView("hub")}>
              {isEnglish ? "Courses" : "Cursussen"}
            </ViewButton>
            <ViewButton icon={Library} active={view === "library"} onClick={() => setView("library")}>
              {isEnglish ? "Library" : "Bibliotheek"}
            </ViewButton>
            <ViewButton icon={ShieldCheck} active={view === "wallets"} onClick={() => setView("wallets")}>
              {isEnglish ? "Wallet Academy" : "Wallet Academy"}
            </ViewButton>
            <ViewButton icon={Award} active={view === "certificate"} onClick={() => setView("certificate")}>
              {isEnglish ? "NFT certificate" : "NFT-certificaat"}
            </ViewButton>
          </div>`,
  },
  {
    label: "Academy reusable OTT feature marks",
    before: `function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={\`rounded-xl px-4 py-2.5 text-sm font-semibold \${
        active
          ? "bg-slate-950 text-white"
          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
      }\`}
    >
      {children}
    </button>
  );
}`,
    after: `function ViewButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={\`group flex min-h-[104px] min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border px-4 py-4 text-center text-sm font-semibold transition \${
        active
          ? "border-transparent bg-slate-950 text-white shadow-xl"
          : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
      }\`}
    >
      <span className={\`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl \${
        active
          ? "bg-white/10 text-white"
          : "bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] text-white shadow-lg shadow-violet-200/50"
      }\`}>
        <span className="absolute h-7 w-7 rotate-45 rounded-[7px] border border-white/35" aria-hidden="true" />
        <Icon className="relative z-10" size={21} strokeWidth={1.9} />
      </span>
      <span className="leading-tight">{children}</span>
    </button>
  );
}`,
  },
]);

patchFile("src/tabs/RoadmapTab.tsx", [
  {
    label: "Phase 6 XP token NFT utility roadmap",
    before: `    {
      id: "token-tools-review",
      phase: en ? "Phase 6" : "Fase 6",
      title: en ? "Token Tools + Legal Review" : "Tokenhulpmiddelen + juridische toetsing",
      summary: en ? "Advanced token tooling only after demand, safety testing and legal review." : "Geavanceerde tokentools pas na vraag, veiligheidstests en juridische toetsing.",
      deliverables: en ? ["Labs-first tooling", "No value promise", "Legal review before public release"] : ["Eerst in labs", "Geen waardebelofte", "Juridische toetsing vóór publieke release"],
    },`,
    after: `    {
      id: "token-tools-review",
      phase: en ? "Phase 6" : "Fase 6",
      title: en ? "XP, OTT Utility + NFT Holder Rewards" : "XP, OTT-utility + NFT-holderbeloningen",
      summary: en
        ? "Verified XP, OTT utility concepts, monthly NFT-holder campaigns and capped voting leverage only after technical, abuse-control and legal review."
        : "Geverifieerde XP, OTT-utilityconcepten, maandelijkse NFT-holdercampagnes en begrensde stemweging pas na technische, misbruik- en juridische controle.",
      deliverables: en
        ? ["XP-to-utility rules", "Monthly NFT-holder campaigns", "Capped auditable voting leverage"]
        : ["XP-naar-utilityregels", "Maandelijkse NFT-holdercampagnes", "Begrensde controleerbare stemweging"],
    },`,
  },
  {
    label: "Whitepaper roadmap CTA",
    before: `            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-medium text-slate-500">Make Waves SourceTag</p>
              <p className="mt-1 text-xl font-semibold">{MAKE_WAVES_SOURCE_TAG}</p>
            </div>`,
    after: `            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-medium text-slate-500">Make Waves SourceTag</p>
                <p className="mt-1 text-xl font-semibold">{MAKE_WAVES_SOURCE_TAG}</p>
              </div>
              <a
                href="/ott-whitepaper-roadmap.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-200/40"
              >
                {en ? "Open whitepaper roadmap" : "Open whitepaper-roadmap"}
                <ExternalLink size={17} />
              </a>
            </div>`,
  },
]);

console.log("OTT UX theme phase 1 applied. Run npm run quality before committing.");
