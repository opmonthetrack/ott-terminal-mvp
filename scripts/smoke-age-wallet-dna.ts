import { scanAgeWalletDna, quoteAgeWalletDna } from "../src/lib/ageWalletDna";
import type { XrplNetwork } from "../src/lib/walletRegistry";

// Supply a public address explicitly. This script cannot create or sign transactions.
const account = process.argv[2];
const network = (process.argv[3] || "mainnet") as XrplNetwork;
if (!account || !["mainnet", "testnet", "devnet"].includes(network)) throw new Error("Usage: tsx scripts/smoke-age-wallet-dna.ts <public-address> [network]");
const controller = new AbortController();
const deadline = setTimeout(() => controller.abort(), 90000);
try {
  const scan = await scanAgeWalletDna(account, network, controller.signal);
  console.log(JSON.stringify({ check: "read-only scan", network, ledger: scan.ledger, assets: scan.assets.length, historyCount: scan.historyCount, historyComplete: scan.historyComplete, knownBasis: scan.assets.filter(asset => asset.basis.status === "known").length }));
  const asset = scan.assets.find(asset => !asset.frozen);
  if (asset) {
    const quote = await quoteAgeWalletDna(scan, asset, controller.signal);
    console.log(JSON.stringify({ check: "fresh direct-book estimate", ledger: quote.ledger, fullCoverage: quote.fullCoverage, profitEstablished: quote.estimatedPnlXrp !== null }));
  } else console.log("No unrestricted issued token to quote in this wallet.");
} finally { clearTimeout(deadline); }
