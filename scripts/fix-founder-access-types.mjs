import fs from "node:fs";

const file = "src/server/premiumAccessService.ts";
let source = fs.readFileSync(file, "utf8");

source = source.replace(/const GRANT_FIELDS = \[[\s\S]*?\]\.join\(","\);\nconst LINK_FIELDS = \[[\s\S]*?\]\.join\(","\);\n/, "");
source = source.replaceAll(".select(GRANT_FIELDS)", '.select("*")');
source = source.replaceAll(".select(LINK_FIELDS)", '.select("*")');
source = source.replace('.select("id,starts_at,expires_at,status")', '.select("*")');
source = source.replaceAll("as GrantRow[]", "as unknown as GrantRow[]");
source = source.replaceAll("as WalletLinkRow[]", "as unknown as WalletLinkRow[]");
source = source.replaceAll("as GrantRow;", "as unknown as GrantRow;");
source = source.replace(
  "    const found = data.users.find((user) => user.email?.toLowerCase() === expected);\n    if (found) return found;\n    if (data.users.length < 100) break;",
  "    const listedUsers = data.users as User[];\n    const found = listedUsers.find((listedUser) => listedUser.email?.toLowerCase() === expected);\n    if (found) return found;\n    if (listedUsers.length < 100) break;",
);

if (source.includes("GRANT_FIELDS") || source.includes("LINK_FIELDS")) {
  throw new Error("Dynamic Supabase select fields remain.");
}
if (!source.includes("const listedUsers = data.users as User[]")) {
  throw new Error("Auth user list cast was not applied.");
}

fs.writeFileSync(file, source);
console.log("Founder access Supabase types fixed.");
