import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "api", "roadmap-vote.ts");
let source = fs.readFileSync(file, "utf8");

const oldReturnUrl = `function getVoteReturnUrl(voteId: string) {
  return (
    \`${OTT_PUBLIC_APP_URL}/?ott_xaman_return=1\` +
    \`&payload={id}\` +
    \`&action=roadmap-vote\` +
    \`&target=roadmap\` +
    \`&vote=\${encodeURIComponent(voteId)}\` +
    \`&sourceTag=\${MAKE_WAVES_SOURCE_TAG}\`
  );
}`;

const newReturnUrl = `function getVoteReturnUrl(_voteId: string) {
  return (
    \`${OTT_PUBLIC_APP_URL}/?ott_xaman_return=1\` +
    \`&payload={id}\` +
    \`&action=roadmap-vote\` +
    \`&target=roadmap\`
  );
}`;

const oldMeta = `      custom_meta: {
        identifier: \`ott-roadmap-vote-\${ROADMAP_VOTE_CYCLE}-\${voteId}\`,
        instruction: \`Vote for \${option.title}. This sends 1 drop as on-chain proof and creates no governance, token or financial rights.\`,
        blob: {
          mode: "ott-roadmap-vote",
          brand: "XRPL OnTheTrack Terminal",
          actionId: "roadmap-vote",
          returnTarget: "roadmap",
          cycle: ROADMAP_VOTE_CYCLE,
          voteId,
          voteTitle: option.title,
          sourceTag: MAKE_WAVES_SOURCE_TAG,
          destinationWallet: ROADMAP_VOTE_WALLET,
          amountDrops: ROADMAP_VOTE_AMOUNT_DROPS,
          memoText,
        },
      },`;

const newMeta = `      custom_meta: {
        identifier: \`ott-vote-\${voteId}\`,
        instruction: \`OTT roadmap vote: \${option.title}\`,
        blob: {
          actionId: "roadmap-vote",
          voteId,
          sourceTag: MAKE_WAVES_SOURCE_TAG,
        },
      },`;

if (!source.includes(oldReturnUrl)) {
  throw new Error("Expected roadmap return URL block not found.");
}
if (!source.includes(oldMeta)) {
  throw new Error("Expected roadmap custom_meta block not found.");
}

source = source.replace(oldReturnUrl, newReturnUrl).replace(oldMeta, newMeta);
fs.writeFileSync(file, source);
console.log("Reduced Xaman roadmap payload size while preserving transaction proof fields.");
