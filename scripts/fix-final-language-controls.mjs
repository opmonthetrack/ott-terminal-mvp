import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "src", "App.tsx");
let source = fs.readFileSync(file, "utf8");
const anchor = '      "Verify Access": "Toegang verifiëren",\n';
const addition = '      "Verify Access": "Toegang verifiëren",\n      "Refresh": "Vernieuwen",\n      "Open X Post": "X-bericht openen",\n';

if (source.includes('"Open X Post": "X-bericht openen"')) {
  console.log("Final Dutch control translations already present.");
  process.exit(0);
}
if (!source.includes(anchor)) throw new Error("Dutch fallback anchor not found.");
source = source.replace(anchor, addition);
fs.writeFileSync(file, source);
console.log("Added final Dutch control translations.");
