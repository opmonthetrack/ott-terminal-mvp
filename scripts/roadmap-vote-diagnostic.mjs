import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.AUDIT_BASE_URL || "https://ott-terminal-mvp.vercel.app";
const outputDir = path.resolve(process.env.AUDIT_OUTPUT_DIR || "artifacts/roadmap-vote-diagnostic");
fs.mkdirSync(outputDir, { recursive: true });

const response = await fetch(new URL("/api/roadmap-vote", baseUrl), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "xaman.createRoadmapVotePayload",
    voteId: "academy-expansion",
  }),
});

let data;
try {
  data = await response.json();
} catch {
  data = { error: `Non-JSON response (${response.status})` };
}

const result = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  status: response.status,
  responseOk: response.ok,
  data,
};
fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
