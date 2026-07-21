import fs from "node:fs/promises";

const filePath = "src/tabs/RoadmapTab.tsx";
let content = await fs.readFile(filePath, "utf8");

const replacements = [
  {
    before: '            value={leader?.title ?? "No votes"}\n            text={leader ? `${leader.votes} verified vote${leader.votes === 1 ? "" : "s"}.` : "Waiting for the first vote."}',
    after: '            value={leader\n              ? localizeVoteTitle(leader.id, leader.title)\n              : isEnglish ? "No votes" : "Geen stemmen"}\n            text={leader\n              ? isEnglish\n                ? `${leader.votes} verified vote${leader.votes === 1 ? "" : "s"}.`\n                : `${leader.votes} geverifieerde stem${leader.votes === 1 ? "" : "men"}.`\n              : isEnglish\n                ? "Waiting for the first vote."\n                : "Wachten op de eerste stem."}',
  },
  {
    before: '            text={isGuest ? "Xaman identifies the signing wallet." : shortWallet(walletAddress)}',
    after: '            text={isGuest\n              ? isEnglish\n                ? "Xaman identifies the signing wallet."\n                : "Xaman identificeert de ondertekenende wallet."\n              : shortWallet(walletAddress)}',
  },
  {
    before: '                          {item.title}\n                        </p>\n                        <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mt-1">\n                          {item.votes} votes · {percent}%',
    after: '                          {localizeVoteTitle(item.id, item.title)}\n                        </p>\n                        <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mt-1">\n                          {item.votes} {isEnglish ? "votes" : "stemmen"} · {percent}%',
  },
  {
    before: '                  value={leader ? `${leader.title} · ${leader.votes}` : "No votes"}',
    after: '                  value={leader\n                    ? `${localizeVoteTitle(leader.id, leader.title)} · ${leader.votes}`\n                    : isEnglish ? "No votes" : "Geen stemmen"}',
  },
  {
    before: '                  value={leastVoted ? `${leastVoted.title} · ${leastVoted.votes}` : "No votes"}',
    after: '                  value={leastVoted\n                    ? `${localizeVoteTitle(leastVoted.id, leastVoted.title)} · ${leastVoted.votes}`\n                    : isEnglish ? "No votes" : "Geen stemmen"}',
  },
  {
    before: '                <MiniStatus label={isEnglish ? "Proof Wallet" : "Proofwallet"} value={voteStats?.proof?.destinationWallet ?? "Loading from XRPL"} />',
    after: '                <MiniStatus\n                  label={isEnglish ? "Proof Wallet" : "Proofwallet"}\n                  value={voteStats?.proof?.destinationWallet ?? (isEnglish ? "Loading from XRPL" : "Laden vanaf XRPL")}\n                />',
  },
  {
    before: '                        {voteRecord.title}',
    after: '                        {localizeVoteTitle(voteRecord.voteId, voteRecord.title)}',
  },
];

for (const replacement of replacements) {
  if (content.includes(replacement.after)) {
    continue;
  }

  if (!content.includes(replacement.before)) {
    throw new Error(`Missing Roadmap localization target: ${replacement.before.slice(0, 100)}`);
  }

  content = content.replace(replacement.before, replacement.after);
}

await fs.writeFile(filePath, content, "utf8");
console.log("applied final Roadmap localization");
