// api/news.js
// XRPL OnTheTrack Terminal — XRPL Intelligence API V3
// Clean feed-only + curated source model. Keep separate from api/ott.ts.

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 2;
const DEFAULT_LIMIT = 36;
const FETCH_TIMEOUT_MS = 6500;

const SOURCE_TYPES = {
  OFFICIAL: "official",
  TECHNICAL: "technical",
  INSTITUTIONAL: "institutional",
  FALLBACK: "fallback",
};

const SOURCES = [
  {
    name: "XRPL Blog",
    category: "XRPL Core / Amendments",
    sourceType: SOURCE_TYPES.OFFICIAL,
    homeUrl: "https://xrpl.org/blog/index.xml",
    feedUrls: ["https://xrpl.org/blog/index.xml", "https://xrpl.org/blog/rss.xml"],
    allowedUrlPatterns: [/^https:\/\/xrpl\.org\/blog\/20\d{2}\//i],
  },
  {
    name: "XRPLF Standards",
    category: "XLS Standards",
    sourceType: SOURCE_TYPES.TECHNICAL,
    homeUrl: "https://github.com/XRPLF/XRPL-Standards/commits/master.atom",
    feedUrls: [
      "https://github.com/XRPLF/XRPL-Standards/commits/master.atom",
      "https://github.com/XRPLF/XRPL-Standards/commits/main.atom",
    ],
    allowedUrlPatterns: [/^https:\/\/github\.com\/XRPLF\/XRPL-Standards\/commit\//i],
  },
  {
    name: "XRPLF rippled Releases",
    category: "XRPL Core / Amendments",
    sourceType: SOURCE_TYPES.TECHNICAL,
    homeUrl: "https://github.com/XRPLF/rippled/releases.atom",
    feedUrls: ["https://github.com/XRPLF/rippled/releases.atom"],
    allowedUrlPatterns: [/^https:\/\/github\.com\/XRPLF\/rippled\/releases\//i],
  },
  {
    name: "Ripple Insights",
    category: "Ripple / RLUSD / Partnerships",
    sourceType: SOURCE_TYPES.OFFICIAL,
    homeUrl: "https://ripple.com/insights/feed/",
    feedUrls: ["https://ripple.com/insights/feed/", "https://ripple.com/feed/"],
    allowedUrlPatterns: [/^https:\/\/ripple\.com\/insights\/[a-z0-9-]+\/?$/i],
  },
  {
    name: "Ripple Press Releases",
    category: "Ripple / RLUSD / Partnerships",
    sourceType: SOURCE_TYPES.OFFICIAL,
    homeUrl: "https://ripple.com/press-releases/feed/",
    feedUrls: ["https://ripple.com/press-releases/feed/"],
    allowedUrlPatterns: [/^https:\/\/ripple\.com\/press-releases\/[a-z0-9-]+\/?$/i],
  },
  {
    name: "Xaman Blog",
    category: "Xaman / XRPL Labs",
    sourceType: SOURCE_TYPES.OFFICIAL,
    homeUrl: "https://xaman.app/blog/rss.xml",
    feedUrls: ["https://xaman.app/blog/rss.xml", "https://xaman.app/blog/feed.xml"],
    allowedUrlPatterns: [/^https:\/\/xaman\.app\/blog\/[a-z0-9-]+\/?$/i, /^https:\/\/blog\.xaman\.app\/[a-z0-9-]+\/?$/i],
  },
  {
    name: "BIS",
    category: "CBDC / Central Banks",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    homeUrl: "https://www.bis.org/list/press_releases/index.rss",
    feedUrls: [
      "https://www.bis.org/list/press_releases/index.rss",
      "https://www.bis.org/list/cpmi/index.rss",
      "https://www.bis.org/list/workpap/index.rss",
    ],
    allowedUrlPatterns: [/^https:\/\/www\.bis\.org\/(press|publ|cpmi)\//i],
  },
];

const CURATED_ITEMS = [
  {
    title: "XRPL Known Amendments Tracker",
    link: "https://xrpl.org/resources/known-amendments",
    author: "XRPL.org",
    source: "XRPL Known Amendments",
    sourceType: SOURCE_TYPES.TECHNICAL,
    category: "XRPL Core / Amendments",
    description: "Official XRPL tracker for amendment status. Use this to monitor protocol changes, validator voting and activation context.",
    tags: ["xrpl", "amendment", "validator", "consensus"],
  },
  {
    title: "Atlantic Council CBDC Tracker",
    link: "https://www.atlanticcouncil.org/cbdctracker/",
    author: "Atlantic Council",
    source: "Atlantic Council CBDC Tracker",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    category: "CBDC / Central Banks",
    description: "Institutional tracker for CBDC exploration, pilots and launches. Macro context only; not a confirmation of any specific blockchain usage.",
    tags: ["cbdc", "central bank", "digital currency", "tracker"],
  },
  {
    title: "SWIFT ISO 20022 Standards Hub",
    link: "https://www.swift.com/standards/iso-20022",
    author: "SWIFT",
    source: "SWIFT ISO 20022",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    category: "ISO 20022 / Payments",
    description: "Institutional reference for ISO 20022 payments messaging. Payments infrastructure context, not a trading signal or adoption claim.",
    tags: ["iso 20022", "swift", "payments", "messaging"],
  },
  {
    title: "IMF Fintech Topic Hub",
    link: "https://www.imf.org/en/Topics/fintech",
    author: "IMF",
    source: "IMF Fintech",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    category: "CBDC / Central Banks",
    description: "IMF fintech and digital money topic hub. Macro policy context around digital money, not trading or adoption claims.",
    tags: ["cbdc", "digital money", "policy", "stablecoin"],
  },
];

const FALLBACK_ITEMS = [
  {
    title: "XRPL OnTheTrack Terminal Daily Brief",
    link: "https://xrpl.org/blog",
    pubDate: new Date().toISOString(),
    author: "OTT Terminal",
    source: "OTT Fallback",
    sourceType: SOURCE_TYPES.FALLBACK,
    category: "XRPL Intelligence",
    description: "De live intelligence feeds konden niet schoon worden opgehaald. De terminal blijft werken met veilige fallback intelligence.",
    tags: ["xrpl", "intelligence", "fallback"],
  },
];

const BUCKETS = [
  "XRPL Core / Amendments",
  "XLS Standards",
  "Ripple / RLUSD / Partnerships",
  "Xaman / XRPL Labs",
  "RWA / Tokenization",
  "CBDC / Central Banks",
  "BRICS / Geopolitics",
  "ISO 20022 / Payments",
  "DeFi / AMM / Lending",
  "AI Agents / Agentic Payments",
  "Security / Scam Alerts",
];

const TAG_GROUPS = [
  { bucket: "XRPL Core / Amendments", tags: ["xrpl", "xrp ledger", "rippled", "xrpld", "amendment", "validator", "consensus", "sidechain"] },
  { bucket: "XLS Standards", tags: ["xls", "standard", "specification", "proposal", "smart escrow", "credential", "mpt", "dynamic mpt", "token pre-authorization"] },
  { bucket: "Ripple / RLUSD / Partnerships", tags: ["ripple", "rlusd", "stablecoin", "partnership", "license", "custody", "institutional"] },
  { bucket: "Xaman / XRPL Labs", tags: ["xaman", "xumm", "xrpl labs", "wallet", "signing", "xapp"] },
  { bucket: "RWA / Tokenization", tags: ["rwa", "real world asset", "tokenization", "tokenisation"] },
  { bucket: "CBDC / Central Banks", tags: ["cbdc", "central bank", "digital currency", "wholesale cbdc", "retail cbdc", "pilot"] },
  { bucket: "BRICS / Geopolitics", tags: ["brics", "geopolitics", "multipolar", "de-dollar", "dedollar"] },
  { bucket: "ISO 20022 / Payments", tags: ["iso 20022", "swift", "payments", "cross-border", "messaging", "settlement"] },
  { bucket: "DeFi / AMM / Lending", tags: ["defi", "amm", "dex", "lending", "liquidity", "oracle"] },
  { bucket: "AI Agents / Agentic Payments", tags: ["ai agent", "agentic", "mcp", "x402", "automation"] },
  { bucket: "Security / Scam Alerts", tags: ["security", "scam", "phishing", "exploit", "vulnerability", "fraud"] },
];

const BLOCKED_TITLE_WORDS = [
  "link to home",
  "company logo",
  "customers overview",
  "privacy",
  "terms",
  "cookie",
  "careers",
  "contact",
  "login",
  "sign up",
  "subscribe",
  "read more",
  "learn more",
  "showing all",
  "javascript",
  "skip to content",
  "copyright and permissions",
  "see more",
  "more from",
  "site map",
];

const GITHUB_HOUSEKEEPING_WORDS = [
  "ci(",
  "ci:",
  "deps(",
  "bump ",
  "dependabot",
  "github-script",
  "setup-python",
  "upload-pages-artifact",
  "create-github-app-token",
  "markdown-it-py",
  "copilot review instructions",
  "close discussions",
  "workflow",
  "action",
  "lint",
  "prettier",
];

const XLS_KEEP_WORDS = [
  "xls",
  "spec",
  "amendment",
  "escrow",
  "mpt",
  "credential",
  "permissioned",
  "pre-authorization",
  "preauthorization",
  "token",
  "flag",
  "wasm vm",
  "host function",
];

function decodeEntities(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(value = "") {
  return decodeEntities(value)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/`/g, "'")
    .trim();
}

function getTagValue(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? cleanText(match[1]) : "";
}

function getAtomLink(entryXml) {
  const hrefMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
  return hrefMatch?.[1] || getTagValue(entryXml, "link");
}

function resolveUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

function isAllowedLink(link, source) {
  return Boolean(link && source.allowedUrlPatterns.some((pattern) => pattern.test(link)));
}

function isBadTitle(title) {
  const lower = title.toLowerCase();
  if (title.length < 12 || title.length > 220) return true;
  return BLOCKED_TITLE_WORDS.some((word) => lower.includes(word));
}

function isGitHubHousekeeping(item, source) {
  if (source.name !== "XRPLF Standards") return false;
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  if (GITHUB_HOUSEKEEPING_WORDS.some((word) => text.includes(word))) return true;
  return !XLS_KEEP_WORDS.some((word) => text.includes(word));
}

function getYear(item) {
  const fromDate = new Date(item.pubDate || "").getFullYear();
  if (!Number.isNaN(fromDate)) return fromDate;
  return CURRENT_YEAR;
}

function hasInstitutionalRelevance(item, source) {
  if (source.sourceType !== SOURCE_TYPES.INSTITUTIONAL) return true;
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  return ["cbdc", "central bank", "digital currency", "tokenisation", "tokenization", "cross-border", "payment", "settlement", "stablecoin", "iso 20022"].some((word) => text.includes(word));
}

function keepItem(item, source) {
  if (!item.title || isBadTitle(item.title)) return false;
  if (!isAllowedLink(item.link, source)) return false;
  if (getYear(item) < MIN_YEAR) return false;
  if (isGitHubHousekeeping(item, source)) return false;
  if (!hasInstitutionalRelevance(item, source)) return false;
  return true;
}

function classifyBucket(item, source) {
  if (source?.category) return source.category;
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  for (const group of TAG_GROUPS) {
    if (group.tags.some((tag) => text.includes(tag))) return group.bucket;
  }
  return "XRPL Intelligence";
}

function getTags(item, bucket) {
  if (Array.isArray(item.tags) && item.tags.length > 0) return item.tags.slice(0, 12);
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  const group = TAG_GROUPS.find((entry) => entry.bucket === bucket);
  if (!group) return [];
  return group.tags.filter((tag) => text.includes(tag)).slice(0, 12);
}

function getSignalType(bucket, sourceType) {
  if (bucket.includes("CBDC") || bucket.includes("BRICS") || bucket.includes("ISO")) return "macro-signal";
  if (bucket.includes("XLS") || bucket.includes("Amendments") || sourceType === SOURCE_TYPES.TECHNICAL) return "technical-signal";
  if (bucket.includes("Ripple") || bucket.includes("Tokenization")) return "institutional-signal";
  if (bucket.includes("Security")) return "risk-signal";
  return "ecosystem-signal";
}

function getWhyItMatters(bucket) {
  if (bucket.includes("XLS")) return "Standards signal. Relevant omdat XLS-voorstellen kunnen bepalen hoe builders interoperabele XRPL-features ontwerpen.";
  if (bucket.includes("XRPL Core")) return "Protocol/core update. Relevant voor validators, builders, tooling en long-term XRPL reliability.";
  if (bucket.includes("Ripple")) return "Ripple ecosystem signal. Relevant voor institutional payments, custody, RLUSD, tokenization of enterprise adoption context.";
  if (bucket.includes("Xaman")) return "Wallet/onboarding signal. Relevant omdat Xaman een belangrijke self-custody route is in OTT Terminal.";
  if (bucket.includes("CBDC")) return "Macro payments signal. Relevant voor digital money infrastructure, maar niet automatisch bewijs van XRPL/XRP adoption.";
  if (bucket.includes("ISO")) return "Payments messaging signal. Relevant voor financial infrastructure, interoperability en settlement narrative.";
  if (bucket.includes("BRICS")) return "Geopolitical payments signal. Alleen gebruiken als context; claims over XRP/XRPL vereisen extra bevestiging.";
  return "Ecosystem signal. Relevant voor dagelijkse XRPL intelligence en community awareness.";
}

function getConfidenceScore(sourceType, bucket) {
  let score = 70;
  if (sourceType === SOURCE_TYPES.OFFICIAL) score = 92;
  if (sourceType === SOURCE_TYPES.TECHNICAL) score = 90;
  if (sourceType === SOURCE_TYPES.INSTITUTIONAL) score = 86;
  if (sourceType === SOURCE_TYPES.FALLBACK) score = 50;
  if (bucket.includes("BRICS")) score -= 6;
  return Math.max(35, Math.min(98, score));
}

function normalizeItem(item, source) {
  const title = cleanText(item.title);
  const description = cleanText(item.description || `Nieuw item gevonden via ${item.source}.`).slice(0, 500);
  const bucket = classifyBucket({ ...item, title, description }, source);
  const sourceType = item.sourceType || source?.sourceType || SOURCE_TYPES.FALLBACK;
  const tags = getTags({ ...item, title, description }, bucket);

  return {
    ...item,
    title,
    description,
    sourceType,
    category: bucket,
    bucket,
    tags,
    signalType: getSignalType(bucket, sourceType),
    officialSource: sourceType !== SOURCE_TYPES.FALLBACK,
    needsConfirmation: bucket.includes("BRICS") || sourceType === SOURCE_TYPES.FALLBACK,
    confidenceScore: getConfidenceScore(sourceType, bucket),
    whyItMatters: getWhyItMatters(bucket),
  };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "XRPL-OnTheTrack-Terminal/1.0 (+https://ott-terminal-mvp.vercel.app)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error("Fetch failed:", url, error?.message || error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseRssOrAtom(xml, source) {
  const items = [];
  const rssItems = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  const atomEntries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];

  for (const itemXml of rssItems) {
    const title = getTagValue(itemXml, "title");
    const link = getTagValue(itemXml, "link");
    const pubDate = getTagValue(itemXml, "pubDate") || getTagValue(itemXml, "published") || getTagValue(itemXml, "updated");
    const description = getTagValue(itemXml, "description") || getTagValue(itemXml, "content:encoded") || "";
    if (title) {
      items.push({
        title,
        link: resolveUrl(link || source.homeUrl, source.homeUrl),
        pubDate: pubDate || new Date().toISOString(),
        author: getTagValue(itemXml, "dc:creator") || getTagValue(itemXml, "author") || source.name,
        source: source.name,
        sourceType: source.sourceType,
        category: source.category,
        description,
      });
    }
  }

  for (const entryXml of atomEntries) {
    const title = getTagValue(entryXml, "title");
    const link = getAtomLink(entryXml);
    const pubDate = getTagValue(entryXml, "published") || getTagValue(entryXml, "updated");
    const description = getTagValue(entryXml, "summary") || getTagValue(entryXml, "content") || "";
    if (title) {
      items.push({
        title,
        link: resolveUrl(link || source.homeUrl, source.homeUrl),
        pubDate: pubDate || new Date().toISOString(),
        author: getTagValue(entryXml, "name") || source.name,
        source: source.name,
        sourceType: source.sourceType,
        category: source.category,
        description,
      });
    }
  }

  return items;
}

async function fetchSourceItems(source) {
  const allItems = [];
  for (const feedUrl of source.feedUrls) {
    const xml = await fetchText(feedUrl);
    if (!xml) continue;
    const parsed = parseRssOrAtom(xml, source)
      .map((item) => normalizeItem(item, source))
      .filter((item) => keepItem(item, source));
    if (parsed.length > 0) {
      allItems.push(...parsed);
      break;
    }
  }
  return allItems;
}

function getCuratedItems() {
  return CURATED_ITEMS.map((item) => normalizeItem({ ...item, pubDate: new Date().toISOString() }, item));
}

function dedupeItems(items) {
  const seen = new Set();
  const finalItems = [];
  for (const item of items) {
    const key = `${item.link || item.title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    finalItems.push(item);
  }
  return finalItems;
}

function sortByDate(items) {
  return items.sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());
}

function enrichFallbackItems() {
  return FALLBACK_ITEMS.map((item) => normalizeItem(item, item));
}

function buildBrief(items) {
  const buckets = new Map();
  for (const item of items) buckets.set(item.bucket, (buckets.get(item.bucket) || 0) + 1);
  const topBuckets = Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([bucket, count]) => ({ bucket, count }));

  return {
    title: "XRPL Intelligence Daily Brief",
    generatedAt: new Date().toISOString(),
    topBuckets,
    summary: `Vandaag zijn ${items.length} intelligence items opgehaald en geclassificeerd voor XRPL, Ripple, Xaman, XLS, CBDC, ISO 20022, RWA en macro payments.`,
    legalNote: "Education only. This feed is not financial advice, not trading signals and not confirmation that XRP/XRPL is used by any macro system unless official sources explicitly confirm it.",
  };
}

function getLimit(req) {
  const rawLimit = req.query?.limit;
  const value = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;
  const limit = Number(value);
  if (!Number.isFinite(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(80, Math.max(1, Math.round(limit)));
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed. Gebruik GET." });
  }

  try {
    const limit = getLimit(req);
    const sourceResults = await Promise.allSettled(
      SOURCES.map(async (source) => ({ source, items: await fetchSourceItems(source) }))
    );

    const allItems = [...getCuratedItems()];
    const debug = [];

    for (const result of sourceResults) {
      if (result.status === "fulfilled") {
        debug.push({
          source: result.value.source.name,
          sourceType: result.value.source.sourceType,
          category: result.value.source.category,
          count: result.value.items.length,
        });
        allItems.push(...result.value.items);
      } else {
        debug.push({ source: "unknown", count: 0, error: result.reason?.message || String(result.reason) });
      }
    }

    const cleanedItems = sortByDate(dedupeItems(allItems)).slice(0, limit);
    const finalItems = cleanedItems.length > 0 ? cleanedItems : enrichFallbackItems();

    return res.status(200).json({
      success: true,
      mode: "xrpl-intelligence",
      generatedAt: new Date().toISOString(),
      count: finalItems.length,
      fallback: cleanedItems.length === 0,
      sourceTag: 2606170002,
      sources: [
        ...SOURCES.map((source) => ({
          name: source.name,
          category: source.category,
          sourceType: source.sourceType,
          homeUrl: source.homeUrl,
        })),
        ...CURATED_ITEMS.map((item) => ({
          name: item.source,
          category: item.category,
          sourceType: item.sourceType,
          homeUrl: item.link,
        })),
      ],
      buckets: BUCKETS,
      brief: buildBrief(finalItems),
      debug,
      items: finalItems,
    });
  } catch (error) {
    console.error("News API crashed:", error);
    const fallbackItems = enrichFallbackItems();
    return res.status(200).json({
      success: true,
      mode: "xrpl-intelligence",
      generatedAt: new Date().toISOString(),
      count: fallbackItems.length,
      fallback: true,
      sourceTag: 2606170002,
      error: "News API fallback activated.",
      brief: buildBrief(fallbackItems),
      items: fallbackItems,
    });
  }
}
