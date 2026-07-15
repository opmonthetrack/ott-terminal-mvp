// api/news.js
// XRPL OnTheTrack Terminal — XRPL Intelligence API V2
// Clean feed-only + curated source model. Keep separate from api/ott.ts.

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 2;
const DEFAULT_LIMIT = 36;
const FETCH_TIMEOUT_MS = 6500;
const SOURCE_TAG = 2606170002;

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
    feedUrls: [
      "https://xrpl.org/blog/index.xml",
      "https://xrpl.org/blog/rss.xml",
      "https://xrpl.org/feed.xml",
    ],
    allowedUrlPatterns: [/^https:\/\/xrpl\.org\/blog\/20\d{2}\//i],
    relevanceKeywords: ["xrpl", "xrp ledger", "rippled", "amendment", "validator", "xls"],
  },
  {
    name: "XRPLF Standards",
    category: "XLS Standards",
    sourceType: SOURCE_TYPES.TECHNICAL,
    feedUrls: [
      "https://github.com/XRPLF/XRPL-Standards/commits/master.atom",
      "https://github.com/XRPLF/XRPL-Standards/commits/main.atom",
    ],
    allowedUrlPatterns: [/^https:\/\/github\.com\/XRPLF\/XRPL-Standards\/.+/i],
    relevanceKeywords: ["xls", "standard", "proposal", "specification", "xrpl"],
  },
  {
    name: "XRPLF rippled Releases",
    category: "XRPL Core / Amendments",
    sourceType: SOURCE_TYPES.TECHNICAL,
    feedUrls: ["https://github.com/XRPLF/rippled/releases.atom"],
    allowedUrlPatterns: [/^https:\/\/github\.com\/XRPLF\/rippled\/releases\/.+/i],
    relevanceKeywords: ["rippled", "xrpld", "release", "amendment", "validator"],
  },
  {
    name: "Ripple Insights",
    category: "Ripple / RLUSD / Partnerships",
    sourceType: SOURCE_TYPES.OFFICIAL,
    feedUrls: ["https://ripple.com/insights/feed/", "https://ripple.com/feed/"],
    allowedUrlPatterns: [/^https:\/\/ripple\.com\/insights\/[a-z0-9-]+\/?$/i],
    relevanceKeywords: ["ripple", "rlusd", "stablecoin", "tokenization", "payments", "custody", "institutional"],
  },
  {
    name: "Ripple Press Releases",
    category: "Ripple / RLUSD / Partnerships",
    sourceType: SOURCE_TYPES.OFFICIAL,
    feedUrls: ["https://ripple.com/press-releases/feed/"],
    allowedUrlPatterns: [/^https:\/\/ripple\.com\/press-releases\/[a-z0-9-]+\/?$/i],
    relevanceKeywords: ["ripple", "partnership", "rlusd", "license", "custody", "payments"],
  },
  {
    name: "Xaman Blog",
    category: "Xaman / XRPL Labs",
    sourceType: SOURCE_TYPES.OFFICIAL,
    feedUrls: ["https://xaman.app/blog/rss.xml", "https://xaman.app/blog/feed.xml"],
    allowedUrlPatterns: [/^https:\/\/xaman\.app\/blog\/[a-z0-9-]+\/?$/i, /^https:\/\/blog\.xaman\.app\/[a-z0-9-]+\/?$/i],
    relevanceKeywords: ["xaman", "xumm", "xrpl", "wallet", "signing", "xapp"],
  },
  {
    name: "BIS",
    category: "CBDC / Central Banks",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    feedUrls: [
      "https://www.bis.org/list/press_releases/index.rss",
      "https://www.bis.org/list/cpmi/index.rss",
      "https://www.bis.org/list/workpap/index.rss",
    ],
    allowedUrlPatterns: [/^https:\/\/www\.bis\.org\/(press|publ|cpmi)\/.+/i],
    relevanceKeywords: ["cbdc", "central bank", "digital currency", "tokenisation", "tokenization", "cross-border", "settlement", "payment", "stablecoin", "iso 20022"],
  },
];

const CURATED_ITEMS = [
  {
    title: "XRPL Known Amendments Tracker",
    link: "https://xrpl.org/resources/known-amendments",
    source: "XRPL Known Amendments",
    sourceType: SOURCE_TYPES.TECHNICAL,
    category: "XRPL Core / Amendments",
    description: "Official XRPL tracker for amendment status. Use this to monitor protocol changes, validator voting and activation context.",
    tags: ["xrpl", "amendment", "validator", "consensus"],
  },
  {
    title: "Atlantic Council CBDC Tracker",
    link: "https://www.atlanticcouncil.org/cbdctracker/",
    source: "Atlantic Council CBDC Tracker",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    category: "CBDC / Central Banks",
    description: "Institutional tracker for CBDC exploration, pilots and launches. Macro context only; it does not confirm XRPL or XRP usage.",
    tags: ["cbdc", "central bank", "digital currency", "tracker"],
  },
  {
    title: "SWIFT ISO 20022 Standards Hub",
    link: "https://www.swift.com/standards/iso-20022",
    source: "SWIFT ISO 20022",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    category: "ISO 20022 / Payments",
    description: "Institutional reference for ISO 20022 payments messaging. Payments infrastructure context, not XRP/XRPL confirmation.",
    tags: ["iso 20022", "swift", "payments", "messaging"],
  },
  {
    title: "IMF Fintech Topic Hub",
    link: "https://www.imf.org/en/Topics/fintech",
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
    source: "OTT Fallback",
    sourceType: SOURCE_TYPES.FALLBACK,
    category: "XRPL Intelligence",
    description: "De live intelligence feeds konden niet schoon worden opgehaald. De terminal blijft werken met veilige fallback intelligence.",
  },
  {
    title: "Make Waves Focus: Daily users, mainnet activity and SourceTag proof",
    link: "https://xrpl.org",
    source: "OTT Fallback",
    sourceType: SOURCE_TYPES.FALLBACK,
    category: "Make Waves",
    description: "De belangrijkste productroute blijft: Xaman connect, Mainnet proof, SourceTag 2606170002, XP en Reward Ledger.",
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

function cleanText(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function getTagValue(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(regex);
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
    return url || baseUrl;
  }
}

function isAllowedLink(link, source) {
  return Boolean(link && source.allowedUrlPatterns.some((pattern) => pattern.test(link)));
}

function isBadTitle(title) {
  const lower = title.toLowerCase();
  if (title.length < 14 || title.length > 220) return true;
  return BLOCKED_TITLE_WORDS.some((word) => lower.includes(word));
}

function getYear(value) {
  const dateYear = new Date(value || "").getFullYear();
  return Number.isNaN(dateYear) ? null : dateYear;
}

function isRecentEnough(item) {
  const year = getYear(item.pubDate) || Number(item.link.match(/\/(20\d{2})\//)?.[1]);
  return !year || year >= MIN_YEAR;
}

function includesAny(text, words) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word.toLowerCase()));
}

function getBucket(item, source) {
  const category = source?.category || item.category || "XRPL Intelligence";
  const text = `${item.title} ${item.description || ""}`.toLowerCase();
  if (category.includes("CBDC")) return "CBDC / Central Banks";
  if (category.includes("ISO")) return "ISO 20022 / Payments";
  if (category.includes("XLS")) return "XLS Standards";
  if (category.includes("Ripple")) return "Ripple / RLUSD / Partnerships";
  if (category.includes("Xaman")) return "Xaman / XRPL Labs";
  if (text.includes("tokenization") || text.includes("tokenisation") || text.includes("rwa")) return "RWA / Tokenization";
  if (text.includes("brics")) return "BRICS / Geopolitics";
  if (text.includes("defi") || text.includes("amm") || text.includes("dex")) return "DeFi / AMM / Lending";
  if (text.includes("security") || text.includes("scam") || text.includes("phishing")) return "Security / Scam Alerts";
  return category;
}

function getTags(item, bucket) {
  const text = `${item.title} ${item.description || ""}`.toLowerCase();
  const tags = new Set(item.tags || []);
  for (const word of ["xrp", "xrpl", "ripple", "rlusd", "xaman", "xls", "amendment", "rippled", "cbdc", "iso 20022", "swift", "brics", "stablecoin", "tokenization", "rwa", "amm", "defi"]) {
    if (text.includes(word)) tags.add(word);
  }
  if (bucket.includes("CBDC")) tags.add("cbdc");
  if (bucket.includes("ISO")) tags.add("iso 20022");
  return Array.from(tags).slice(0, 12);
}

function getWhyItMatters(bucket) {
  if (bucket.includes("XRPL Core")) return "Protocol/core update. Relevant voor validators, builders, tooling en long-term XRPL reliability.";
  if (bucket.includes("XLS")) return "Standards signal. Relevant omdat XLS-voorstellen kunnen bepalen hoe builders interoperabele XRPL-features ontwerpen.";
  if (bucket.includes("Ripple")) return "Ripple ecosystem signal. Relevant voor institutional payments, custody, RLUSD, tokenization of enterprise adoption context.";
  if (bucket.includes("Xaman")) return "Wallet/onboarding signal. Relevant omdat Xaman een belangrijke self-custody route is in OTT Terminal.";
  if (bucket.includes("CBDC")) return "Macro payments signal. Relevant voor digital money infrastructure, maar niet automatisch bewijs van XRPL/XRP adoption.";
  if (bucket.includes("ISO")) return "Payments messaging signal. Relevant voor financial infrastructure, interoperability en settlement narrative.";
  if (bucket.includes("BRICS")) return "Geopolitical payments signal. Alleen gebruiken als context; claims over XRP/XRPL vereisen extra bevestiging.";
  return "Ecosystem signal. Relevant voor dagelijkse XRPL intelligence en community awareness.";
}

function normalizeItem(item, source) {
  const pubDate = item.pubDate || new Date().toISOString();
  const bucket = getBucket(item, source);
  const sourceType = item.sourceType || source?.sourceType || SOURCE_TYPES.FALLBACK;
  const confidenceBase = sourceType === SOURCE_TYPES.OFFICIAL ? 92 : sourceType === SOURCE_TYPES.TECHNICAL ? 90 : sourceType === SOURCE_TYPES.INSTITUTIONAL ? 86 : 50;
  return {
    title: cleanText(item.title),
    link: item.link,
    pubDate,
    author: item.author || item.source || source?.name || "OTT Terminal",
    source: item.source || source?.name || "OTT Terminal",
    sourceType,
    category: bucket,
    bucket,
    description: cleanText(item.description || `Nieuw item gevonden via ${item.source || source?.name}.`).slice(0, 500),
    tags: getTags(item, bucket),
    signalType: bucket.includes("CBDC") || bucket.includes("BRICS") || bucket.includes("ISO") ? "macro-signal" : bucket.includes("XLS") || bucket.includes("XRPL Core") ? "technical-signal" : "ecosystem-signal",
    officialSource: sourceType !== SOURCE_TYPES.FALLBACK,
    needsConfirmation: sourceType === SOURCE_TYPES.FALLBACK || bucket.includes("BRICS"),
    confidenceScore: Math.min(98, confidenceBase + (bucket.includes("Ripple") || bucket.includes("XRPL") ? 4 : 0)),
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
        "User-Agent": "XRPL-OnTheTrack-Terminal/1.0",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    return response.ok ? await response.text() : null;
  } catch {
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
    const link = resolveUrl(getTagValue(itemXml, "link"), source.feedUrls[0]);
    const pubDate = getTagValue(itemXml, "pubDate") || getTagValue(itemXml, "published") || getTagValue(itemXml, "updated");
    const description = getTagValue(itemXml, "description") || getTagValue(itemXml, "content:encoded");
    if (title) items.push({ title, link, pubDate, description, source: source.name, sourceType: source.sourceType, category: source.category });
  }

  for (const entryXml of atomEntries) {
    const title = getTagValue(entryXml, "title");
    const link = resolveUrl(getAtomLink(entryXml), source.feedUrls[0]);
    const pubDate = getTagValue(entryXml, "published") || getTagValue(entryXml, "updated");
    const description = getTagValue(entryXml, "summary") || getTagValue(entryXml, "content");
    if (title) items.push({ title, link, pubDate, description, source: source.name, sourceType: source.sourceType, category: source.category });
  }

  return items;
}

async function fetchSourceItems(source) {
  for (const feedUrl of source.feedUrls) {
    const xml = await fetchText(feedUrl);
    if (!xml) continue;
    const parsed = parseRssOrAtom(xml, source)
      .filter((item) => !isBadTitle(item.title))
      .filter((item) => isAllowedLink(item.link, source))
      .filter((item) => isRecentEnough(item))
      .filter((item) => source.sourceType !== SOURCE_TYPES.INSTITUTIONAL || includesAny(`${item.title} ${item.description || ""}`, source.relevanceKeywords))
      .map((item) => normalizeItem(item, source));
    if (parsed.length > 0) return parsed;
  }
  return [];
}

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item.link || item.title).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByDate(items) {
  return items.sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());
}

function buildBrief(items) {
  const buckets = new Map();
  for (const item of items) buckets.set(item.bucket, (buckets.get(item.bucket) || 0) + 1);
  const topBuckets = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([bucket, count]) => ({ bucket, count }));
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
  return Number.isFinite(limit) && limit > 0 ? Math.min(80, Math.round(limit)) : DEFAULT_LIMIT;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed. Gebruik GET." });
  }

  try {
    const limit = getLimit(req);
    const sourceResults = await Promise.allSettled(SOURCES.map(async (source) => ({ source, items: await fetchSourceItems(source) })));
    const debug = [];
    const feedItems = [];

    for (const result of sourceResults) {
      if (result.status === "fulfilled") {
        debug.push({ source: result.value.source.name, sourceType: result.value.source.sourceType, category: result.value.source.category, count: result.value.items.length });
        feedItems.push(...result.value.items);
      } else {
        debug.push({ source: "unknown", count: 0, error: String(result.reason) });
      }
    }

    const curatedItems = CURATED_ITEMS.map((item) => normalizeItem({ ...item, pubDate: new Date().toISOString() }, { name: item.source, sourceType: item.sourceType, category: item.category }));
    const cleanedItems = sortByDate(dedupeItems([...feedItems, ...curatedItems])).slice(0, limit);
    const finalItems = cleanedItems.length > 0 ? cleanedItems : FALLBACK_ITEMS.map((item) => normalizeItem({ ...item, pubDate: new Date().toISOString() }, { name: item.source, sourceType: SOURCE_TYPES.FALLBACK, category: item.category }));

    return res.status(200).json({
      success: true,
      mode: "xrpl-intelligence",
      generatedAt: new Date().toISOString(),
      count: finalItems.length,
      fallback: cleanedItems.length === 0,
      sourceTag: SOURCE_TAG,
      sources: [
        ...SOURCES.map((source) => ({ name: source.name, category: source.category, sourceType: source.sourceType, homeUrl: source.feedUrls[0] })),
        ...CURATED_ITEMS.map((item) => ({ name: item.source, category: item.category, sourceType: item.sourceType, homeUrl: item.link })),
      ],
      buckets: BUCKETS,
      brief: buildBrief(finalItems),
      debug,
      items: finalItems,
    });
  } catch (error) {
    const fallbackItems = FALLBACK_ITEMS.map((item) => normalizeItem({ ...item, pubDate: new Date().toISOString() }, { name: item.source, sourceType: SOURCE_TYPES.FALLBACK, category: item.category }));
    return res.status(200).json({ success: true, mode: "xrpl-intelligence", generatedAt: new Date().toISOString(), count: fallbackItems.length, fallback: true, sourceTag: SOURCE_TAG, error: "News API fallback activated.", brief: buildBrief(fallbackItems), items: fallbackItems });
  }
}
