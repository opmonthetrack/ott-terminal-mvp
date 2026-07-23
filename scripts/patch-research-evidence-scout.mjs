import fs from "node:fs";

const serviceFile = "src/server/researchReviewService.ts";
let service = fs.readFileSync(serviceFile, "utf8");

service = service.replace(
  `  evidenceIds: string[];\n};`,
  `  evidenceIds: string[];\n  sourceIds: string[];\n};`,
);
service = service.replace(
  `      evidenceIds: stringArray(raw?.evidenceIds),\n    };`,
  `      evidenceIds: stringArray(raw?.evidenceIds),\n      sourceIds: stringArray(raw?.sourceIds),\n    };`,
);
service = service.replace(
  `    admin.from("token_research_watchlist").select("*").eq("research_request_id", requestId).maybeSingle(),\n  ]);`,
  `    admin.from("token_research_watchlist").select("*").eq("research_request_id", requestId).maybeSingle(),\n  ]);`,
);
service = service.replace(
  `      const evidenceIds = [...new Set(items.flatMap((item) => item.evidenceIds))];`,
  `      const evidenceIds = [...new Set(items.flatMap((item) => item.evidenceIds))];\n      const sourceIds = [...new Set(items.flatMap((item) => item.sourceIds))];`,
);
service = service.replace(
  `      const scoreInputs: OttResearchScoreInput[] = items.map((item) => ({`,
  `      if (sourceIds.length > 0) {\n        const { data, error } = await admin\n          .from("token_research_sources")\n          .select("id,request_id,review_status")\n          .in("id", sourceIds);\n        if (error) throw error;\n        const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;\n        const invalid = rows.some((row) => (\n          String(row.request_id) !== requestId\n          || String(row.review_status) !== "verified"\n        ));\n        if (invalid || rows.length !== sourceIds.length) {\n          return res.status(400).json({\n            ok: false,\n            error: "Every linked web source must belong to this case and have founder status verified.",\n          });\n        }\n      }\n\n      const scoreInputs: OttResearchScoreInput[] = items.map((item) => ({`,
);
service = service.replace(
  `        evidenceCount: item.evidenceIds.length,`,
  `        evidenceCount: item.evidenceIds.length + item.sourceIds.length,`,
);
service = service.replace(
  `        evidence_ids: item.evidenceIds,\n        checked_at: checkedAt,`,
  `        evidence_ids: item.evidenceIds,\n        source_ids: item.sourceIds,\n        checked_at: checkedAt,`,
);

if (!service.includes("sourceIds: string[]") || !service.includes("source_ids: item.sourceIds")) {
  throw new Error("Research review source ID integration failed.");
}
fs.writeFileSync(serviceFile, service);

const clientFile = "src/lib/researchReviewClient.ts";
let client = fs.readFileSync(clientFile, "utf8");
client = client.replace(
  `  evidence_ids: string[];\n  checked_at?: string | null;`,
  `  evidence_ids: string[];\n  source_ids: string[];\n  checked_at?: string | null;`,
);
client = client.replace(
  `    evidenceIds: string[];\n  }>;`,
  `    evidenceIds: string[];\n    sourceIds: string[];\n  }>;`,
);
if (!client.includes("source_ids: string[]") || !client.includes("sourceIds: string[]")) {
  throw new Error("Research review client source ID integration failed.");
}
fs.writeFileSync(clientFile, client);

const apiFile = "api/access-payment.ts";
let api = fs.readFileSync(apiFile, "utf8");
const reviewImport = 'import researchReviewHandler from "../src/server/researchReviewService";';
if (!api.includes('from "../src/server/researchEvidenceScoutService"')) {
  api = api.replace(
    reviewImport,
    `${reviewImport}\nimport researchEvidenceScoutHandler from "../src/server/researchEvidenceScoutService";`,
  );
}
api = api.replace(
  `const RESEARCH_SCOPES = new Set(["research-review", "watchlist"]);`,
  `const RESEARCH_SCOPES = new Set(["research-review", "watchlist"]);\nconst EVIDENCE_SCOUT_SCOPES = new Set(["evidence-scout"]);`,
);
api = api.replace(
  `return !["status", "metadata", "image", "readiness", ...PREMIUM_SCOPES, ...RESEARCH_SCOPES].includes(scope);`,
  `return !["status", "metadata", "image", "readiness", ...PREMIUM_SCOPES, ...RESEARCH_SCOPES, ...EVIDENCE_SCOUT_SCOPES].includes(scope);`,
);
const reviewRoute = `  if (RESEARCH_SCOPES.has(scope)) {\n    return researchReviewHandler(req, res);\n  }`;
if (!api.includes("EVIDENCE_SCOUT_SCOPES.has(scope)")) {
  api = api.replace(
    reviewRoute,
    `  if (EVIDENCE_SCOUT_SCOPES.has(scope)) {\n    return researchEvidenceScoutHandler(req, res);\n  }\n\n${reviewRoute}`,
  );
}
if (!api.includes("researchEvidenceScoutHandler") || !api.includes("EVIDENCE_SCOUT_SCOPES.has(scope)")) {
  throw new Error("Evidence scout API routing failed.");
}
fs.writeFileSync(apiFile, api);

const reviewFile = "src/tabs/FounderResearchReview.tsx";
let review = fs.readFileSync(reviewFile, "utf8");
const reviewClientImport = `} from "../lib/researchReviewClient";`;
if (!review.includes('from "../components/ResearchEvidenceScout"')) {
  review = review.replace(
    reviewClientImport,
    `${reviewClientImport}\nimport { ResearchEvidenceScout } from "../components/ResearchEvidenceScout";\nimport type { ResearchWebSource } from "../lib/researchEvidenceScoutClient";`,
  );
}
review = review.replace(
  `  evidenceIds: string[];\n};`,
  `  evidenceIds: string[];\n  sourceIds: string[];\n};`,
);
review = review.replace(
  `      evidenceIds: saved?.evidence_ids ?? [],\n    };`,
  `      evidenceIds: saved?.evidence_ids ?? [],\n      sourceIds: saved?.source_ids ?? [],\n    };`,
);
review = review.replace(
  `  const [scores, setScores] = useState<EditableScore[]>(makeEditableScores([]));`,
  `  const [scores, setScores] = useState<EditableScore[]>(makeEditableScores([]));\n  const [webSources, setWebSources] = useState<ResearchWebSource[]>([]);`,
);
review = review.replace(
  `    evidenceCount: item.evidenceIds.length,`,
  `    evidenceCount: item.evidenceIds.length + item.sourceIds.length,`,
);
review = review.replace(
  `  function toggleEvidence(categoryId: OttResearchCategoryId, evidenceId: string) {`,
  `  function toggleSource(categoryId: OttResearchCategoryId, sourceId: string) {\n    const current = scores.find((item) => item.categoryId === categoryId);\n    if (!current) return;\n    const selected = current.sourceIds.includes(sourceId);\n    updateScore(categoryId, {\n      sourceIds: selected\n        ? current.sourceIds.filter((id) => id !== sourceId)\n        : [...current.sourceIds, sourceId],\n    });\n  }\n\n  function toggleEvidence(categoryId: OttResearchCategoryId, evidenceId: string) {`,
);
review = review.replace(
  `                <EvidenceSection evidence={researchCase.evidence} onOpen={(id) => void openFounderEvidence(id)} busy={busy} />`,
  `                <ResearchEvidenceScout requestId={researchCase.request.id} onSourcesChange={setWebSources} />\n                <EvidenceSection evidence={researchCase.evidence} onOpen={(id) => void openFounderEvidence(id)} busy={busy} />`,
);
review = review.replace(
  `return <ScoreCategoryCard key={category.id} category={category} score={score} evidence={researchCase.evidence} expanded={expandedCategory === category.id} onToggle={() => setExpandedCategory((current) => current === category.id ? null : category.id)} onUpdate={(patch) => updateScore(category.id, patch)} onToggleEvidence={(evidenceId) => toggleEvidence(category.id, evidenceId)} />;`,
  `return <ScoreCategoryCard key={category.id} category={category} score={score} evidence={researchCase.evidence} webSources={webSources} expanded={expandedCategory === category.id} onToggle={() => setExpandedCategory((current) => current === category.id ? null : category.id)} onUpdate={(patch) => updateScore(category.id, patch)} onToggleEvidence={(evidenceId) => toggleEvidence(category.id, evidenceId)} onToggleSource={(sourceId) => toggleSource(category.id, sourceId)} />;`,
);

const oldSignature = `function ScoreCategoryCard({ category, score, evidence, expanded, onToggle, onUpdate, onToggleEvidence }: { category: (typeof OTT_RESEARCH_CATEGORIES)[number]; score: EditableScore; evidence: ResearchEvidenceItem[]; expanded: boolean; onToggle: () => void; onUpdate: (patch: Partial<EditableScore>) => void; onToggleEvidence: (evidenceId: string) => void }) {`;
const newSignature = `function ScoreCategoryCard({ category, score, evidence, webSources, expanded, onToggle, onUpdate, onToggleEvidence, onToggleSource }: { category: (typeof OTT_RESEARCH_CATEGORIES)[number]; score: EditableScore; evidence: ResearchEvidenceItem[]; webSources: ResearchWebSource[]; expanded: boolean; onToggle: () => void; onUpdate: (patch: Partial<EditableScore>) => void; onToggleEvidence: (evidenceId: string) => void; onToggleSource: (sourceId: string) => void }) {`;
review = review.replace(oldSignature, newSignature);
review = review.replace(
  `{score.awardedPoints}/{category.maxPoints} punten · {score.evidenceStatus} · {score.evidenceIds.length} bewijs`,
  `{score.awardedPoints}/{category.maxPoints} punten · {score.evidenceStatus} · {score.evidenceIds.length + score.sourceIds.length} bewijs`,
);
review = review.replace(
  `{evidence.length === 0 && <p className="text-sm text-slate-500">Geen bewijs beschikbaar.</p>}</div></div></div>}</article>;`,
  `{evidence.length === 0 && <p className="text-sm text-slate-500">Geen uploads beschikbaar.</p>}</div></div><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Koppel geverifieerde webbronnen</p><div className="mt-3 grid gap-2 md:grid-cols-2">{webSources.map((source) => { const verified = source.review_status === "verified"; return <label key={source.id} className={\`flex items-start gap-3 rounded-xl border p-3 \${score.sourceIds.includes(source.id) ? "border-emerald-400 bg-emerald-400/10" : "border-white/10 bg-white/[0.02]"} \${verified ? "cursor-pointer" : "cursor-not-allowed opacity-50"}\`}><input type="checkbox" checked={score.sourceIds.includes(source.id)} disabled={!verified} onChange={() => onToggleSource(source.id)} className="mt-1" /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{source.title || source.domain}</span><span className="mt-1 block text-xs text-slate-500">{source.review_status} · {source.source_kind} · {source.authority_level}</span></span></label>; })}{webSources.length === 0 && <p className="text-sm text-slate-500">Geen webbronnen opgeslagen.</p>}</div></div></div>}</article>;`,
);

if (!review.includes("sourceIds: string[]") || !review.includes("<ResearchEvidenceScout") || !review.includes("Koppel geverifieerde webbronnen")) {
  throw new Error("Founder review evidence scout UI integration failed.");
}
fs.writeFileSync(reviewFile, review);
console.log("Evidence scout, verified source linking and API routing integrated.");
