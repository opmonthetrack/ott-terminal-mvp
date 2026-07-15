// api/news.js
// XRPL OnTheTrack Terminal — XRPL Intelligence API
// Standalone Vercel serverless endpoint. Keep this route separate from api/ott.ts.
// GET /api/news

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 2;
const DEFAULT_LIMIT = 36;
const FETCH_TIMEOUT_MS = 6500;

const SOURCE_TYPES = {
  OFFICIAL: "official",
  TECHNICAL: "technical",
  INSTITUTIONAL: "institutional",
  MEDIA: "media",
  FALLBACK: "fallback",
};

const SOURCES = [
  {
    name: "XRPL Blog",
    category: "XRPL Core",
    sourceType: SOURCE_TYPES.OFFICIAL,
    homeUrl: "https://xrpl.org/blog",
    feedUrls: [
      "https://xrpl.org/blog/index.xml",
      "https://xrpl.org/blog/rss.xml",
      "https://xrpl.org/feed.xml",
      "https://xrpl.org/rss.xml",
    ],
    allowedUrlPatterns: [/^https:\/\/xrpl\.org\/blog\/20\d{2}\//i],
    relevanceKeywords: ["xrpl", "xrp ledger", "amendment", "rippled", "xls"],
  },
  {
    name: "XRPL Known Amendments",
    category: "XRPL Amendments",
    sourceType: SOURCE_TYPES.TECHNICAL,
    homeUrl: "https://xrpl.org/resources/known-amendments",
    feedUrls: [],
    allowedUrlPatterns: [
      /^https:\/\/xrpl\.org\/resources\/known-amendments/i,
      /^https:\/\/xrpl\.org\/docs\/.+/i,
    ],
    relevanceKeywords: ["amendment", "protocol", "validator", "consensus", "xrpl"],
  },
  {
    name: "XRPLF Standards",
    category: "XLS Standards",
    sourceType: SOURCE_TYPES.TECHNICAL,
    homeUrl: "https://github.com/XRPLF/XRPL-Standards",
    feedUrls: [
      "https://github.com/XRPLF/XRPL-Standards/commits/master.atom",
      "https://github.com/XRPLF/XRPL-Standards/commits/main.atom",
    ],
    allowedUrlPatterns: [
      /^https:\/\/github\.com\/XRPLF\/XRPL-Standards\/.+/i,
    ],
    relevanceKeywords: ["xls", "standard", "xrpl", "specification", "proposal"],
  },
  {
    name: "XRPLF rippled Releases",
    category: "XRPL Core",
    sourceType: SOURCE_TYPES.TECHNICAL,
    homeUrl: "https://github.com/XRPLF/rippled/releases",
    feedUrls: ["https://github.com/XRPLF/rippled/releases.atom"],
    allowedUrlPatterns: [
      /^https:\/\/github\.com\/XRPLF\/rippled\/releases\/.+/i,
    ],
    relevanceKeywords: ["rippled", "xrpld", "release", "amendment", "validator"],
  },
  {
    name: "Ripple Insights",
    category: "Ripple",
    sourceType: SOURCE_TYPES.OFFICIAL,
    homeUrl: "https://ripple.com/insights/",
    feedUrls: [
      "https://ripple.com/insights/feed/",
      "https://ripple.com/feed/",
      "https://ripple.com/rss.xml",
    ],
    allowedUrlPatterns: [/^https:\/\/ripple\.com\/insights\/[a-z0-9-]+\/?$/i],
    relevanceKeywords: [
      "ripple",
      "rlusd",
      "stablecoin",
      "tokenization",
      "payments",
      "institutional",
      "custody",
      "cbdc",
    ],
  },
  {
    name: "Ripple Press Releases",
    category: "Ripple",
    sourceType: SOURCE_TYPES.OFFICIAL,
    homeUrl: "https://ripple.com/press-releases/",
    feedUrls: [
      "https://ripple.com/press-releases/feed/",
      "https://ripple.com/feed/",
    ],
    allowedUrlPatterns: [
      /^https:\/\/ripple\.com\/press-releases\/[a-z0-9-]+\/?$/i,
    ],
    relevanceKeywords: ["ripple", "partnership", "rlusd", "license", "custody"],
  },
  {
    name: "Xaman Blog",
    category: "Xaman",
    sourceType: SOURCE_TYPES.OFFICIAL,
    homeUrl: "https://xaman.app/blog",
    feedUrls: [
      "https://xaman.app/blog/rss.xml",
      "https://xaman.app/blog/feed.xml",
      "https://xaman.app/rss.xml",
      "https://xaman.app/feed.xml",
    ],
    allowedUrlPatterns: [
      /^https:\/\/xaman\.app\/blog\/[a-z0-9-]+\/?$/i,
      /^https:\/\/blog\.xaman\.app\/[a-z0-9-]+\/?$/i,
    ],
    relevanceKeywords: ["xaman", "xumm", "xrpl", "wallet", "signing"],
  },
  {
    name: "BIS",
    category: "CBDC / Central Banks",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    homeUrl: "https://www.bis.org/",
    feedUrls: [
      "https://www.bis.org/list/press_releases/index.rss",
      "https://www.bis.org/list/cpmi/index.rss",
    ],
    allowedUrlPatterns: [/^https:\/\/www\.bis\.org\/.+/i],
    relevanceKeywords: [
      "cbdc",
      "tokenisation",
      "tokenization",
      "cross-border",
      "payment",
      "settlement",
      "stablecoin",
      "iso 20022",
    ],
  },
  {
    name: "SWIFT",
    category: "ISO 20022 / Payments",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    homeUrl: "https://www.swift.com/news-events",
    feedUrls: [],
    allowedUrlPatterns: [/^https:\/\/www\.swift\.com\/.+/i],
    relevanceKeywords: ["iso 20022", "cross-border", "payments", "cbdc", "tokenisation", "tokenization"],
  },
  {
    name: "Atlantic Council CBDC Tracker",
    category: "CBDC / Central Banks",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    homeUrl: "https://www.atlanticcouncil.org/cbdctracker/",
    feedUrls: [],
    allowedUrlPatterns: [/^https:\/\/www\.atlanticcouncil\.org\/.+/i],
    relevanceKeywords: ["cbdc", "central bank", "digital currency", "pilot", "tracker"],
  },
  {
    name: "IMF Fintech",
    category: "CBDC / Central Banks",
    sourceType: SOURCE_TYPES.INSTITUTIONAL,
    homeUrl: "https://www.imf.org/en/Topics/fintech",
    feedUrls: [],
    allowedUrlPatterns: [/^https:\/\/www\.imf\.org\/.+/i],
    relevanceKeywords: ["cbdc", "digital money", "cross-border", "stablecoin", "tokenisation", "tokenization"],
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
    description:
      "De live intelligence feeds konden niet schoon worden opgehaald. De terminal blijft werken met veilige fallback intelligence.",
  },
  {
    title: "Make Waves Focus: Daily users, mainnet activity and SourceTag proof",
    link: "https://xrpl.org",
    pubDate: new Date().toISOString(),
    author: "OTT Terminal",
    source: "OTT Fallback",
    sourceType: SOURCE_TYPES.FALLBACK,
    category: "Make Waves",
    description:
      "De belangrijkste productroute blijft: Xaman connect, Mainnet proof, SourceTag 2606170002, XP en Reward Ledger.",
  },
  {
    title: "Macro Watch: CBDC, ISO 20022, RWA, BRICS and institutional payments",
    link: "https://ripple.com/insights/",
    pubDate: new Date().toISOString(),
    author: "OTT Terminal",
    source: "OTT Fallback",
    sourceType: SOURCE_TYPES.FALLBACK,
    category: "Macro / Payments",
    description:
      "Macro intelligence moet altijd als signaal worden gelezen: officieel waar mogelijk, bevestigd waar nodig, nooit als trading advies.",
  },
];

const BLOCKED_TITLE_WORDS = [
  "link to home",
  "company logo",
  "treasury management",
  "customers overview",
  "customer case studies",
  "disclosures",
  "supplier",
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
];

const KEYWORD_BUCKETS = [
  {
    bucket: "XRPL Core / Amendments",
    tags: ["xrpl", "xrp ledger", "rippled", "xrpld", "amendment", "validator", "consensus", "sidechain"],
  },
  {
    bucket: "XLS Standards",
    tags: ["xls", "standard", "specification", "proposal", "github", "pull request"],
  },
  {
    bucket: "Ripple / RLUSD / Partnerships",
    tags: ["ripple", "rlusd", "stablecoin", "partnership", "license", "custody", "institutional"],
  },
  {
    bucket: "Xaman / XRPL Labs",
    tags: ["xaman", "xumm", "xrpl labs", "wallet", "signing", "xapp"],
  },
  {
    bucket: "RWA / Tokenization",
    tags: ["rwa", "real world asset", "tokenization", "tokenisation", "asset tokenization", "asset tokenisation"],
  },
  {
    bucket: "CBDC / Central Banks",
    tags: ["cbdc", "central bank", "digital currency", "wholesale cbdc", "retail cbdc", "pilot"],
  },
  {
    bucket: "BRICS / Geopolitics",
    tags: ["brics", "geopolitics", "multipolar", "de-dollar", "dedollar", "cross-border settlement"],
  },
  {
    bucket: "ISO 20022 / Payments",
    tags: ["iso 20022", "swift", "payments", "cross-border", "messaging", "settlement"],
  },
  {
    bucket: "DeFi / AMM / Lending",
    tags: ["defi", "amm", "dex", "lending", "liquidity", "oracle", "permissioned dex"],
  },
  {
    bucket: "AI Agents / Agentic Payments",
    tags: ["ai agent", "agentic", "mcp", "x402", "automation", "agent wallet"],
  },
  {
    bucket: "Security / Scam Alerts",
    tags: ["security", "scam", "phishing", "exploit", "vulnerability", "malware", "fraud"],
  },
];

const GLOBAL_RELEVANCE_KEYWORDS = [
  "xrp",
  "xrpl",
  "xrp ledger",
  "ripple",
  "rlusd",
  "xaman",
  "xumm",
  "xrpl labs",
  "xls",
  "amendment",
  "rippled",
  "xrpld",
  "tokenization",
  "tokenisation",
  "rwa",
  "stablecoin",
  "cbdc",
  "central bank",
  "iso 20022",
  "swift",
  "brics",
  "cross-border",
  "settlement",
  "defi",
  "amm",
  "did",
  "decentralized identity",
  "ai agent",
  "agentic",
];

const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function cleanText(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/`/g, "'")
    .trim();
}

function getTagValue(xml, tagName) {
  const regex = new RegExp(
    `<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    "i"
  );

  const match = xml.match(regex);
  return match ? cleanText(match[1]) : "";
}

function getAtomLink(entryXml) {
  const hrefMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);

  if (hrefMatch?.[1]) {
    return hrefMatch[1];
  }

  return getTagValue(entryXml, "link");
}

function resolveUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

function isAllowedLink(link, source) {
  if (!link) return false;

  return source.allowedUrlPatterns.some((pattern) => pattern.test(link));
}

function isBadTitle(title) {
  const lower = title.toLowerCase();

  if (title.length < 14 || title.length > 220) return true;

  return BLOCKED_TITLE_WORDS.some((word) => lower.includes(word));
}

function extractDateFromTitle(title) {
  const match = title.match(
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),\s+(20\d{2})/i
  );

  if (!match) return null;

  const month = MONTHS[match[1].toLowerCase()];
  const day = Number(match[2]);
  const year = Number(match[3]);

  if (month === undefined || !day || !year) return null;

  return new Date(Date.UTC(year, month, day)).toISOString();
}

function cleanTitle(title) {
  return cleanText(title).replace(/^\d+\s+/, "").trim();
}

function getYearFromItem(item) {
  const fromDate = new Date(item.pubDate || "").getFullYear();

  if (!Number.isNaN(fromDate)) {
    return fromDate;
  }

  const titleYear = item.title.match(/20\d{2}/)?.[0];

  if (titleYear) {
    return Number(titleYear);
  }

  const linkYear = item.link.match(/\/(20\d{2})\//)?.[1];

  if (linkYear) {
    return Number(linkYear);
  }

  return CURRENT_YEAR;
}

function getCombinedText(item) {
  return `${item.title || ""} ${item.description || ""} ${item.link || ""} ${item.category || ""}`.toLowerCase();
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function getMatchedTags(item) {
  const text = getCombinedText(item);
  const matched = new Set();

  for (const group of KEYWORD_BUCKETS) {
    for (const tag of group.tags) {
      if (text.includes(tag.toLowerCase())) {
        matched.add(tag);
      }
    }
  }

  for (const keyword of GLOBAL_RELEVANCE_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      matched.add(keyword);
    }
  }

  return Array.from(matched).slice(0, 12);
}

function classifyBucket(item, source) {
  const text = getCombinedText(item);

  for (const group of KEYWORD_BUCKETS) {
    if (includesAny(text, group.tags)) {
      return group.bucket;
    }
  }

  return source?.category || item.category || "XRPL Intelligence";
}

function getSignalType(item, source) {
  const bucket = classifyBucket(item, source);

  if (bucket.includes("CBDC") || bucket.includes("BRICS") || bucket.includes("ISO")) {
    return "macro-signal";
  }

  if (bucket.includes("Amendments") || bucket.includes("XLS") || source?.sourceType === SOURCE_TYPES.TECHNICAL) {
    return "technical-signal";
  }

  if (bucket.includes("Ripple") || bucket.includes("RLUSD") || bucket.includes("Tokenization")) {
    return "institutional-signal";
  }

  if (bucket.includes("Security")) {
    return "risk-signal";
  }

  return "ecosystem-signal";
}

function getConfidenceScore(item, source) {
  let score = 55;

  if (source?.sourceType === SOURCE_TYPES.OFFICIAL) score = 92;
  if (source?.sourceType === SOURCE_TYPES.TECHNICAL) score = 90;
  if (source?.sourceType === SOURCE_TYPES.INSTITUTIONAL) score = 86;
  if (source?.sourceType === SOURCE_TYPES.MEDIA) score = 68;
  if (source?.sourceType === SOURCE_TYPES.FALLBACK) score = 50;

  const tags = getMatchedTags(item);
  const title = (item.title || "").toLowerCase();

  if (tags.length >= 2) score += 4;
  if (title.includes("xrp") || title.includes("xrpl") || title.includes("ripple")) score += 3;
  if (classifyBucket(item, source).includes("BRICS")) score -= 6;
  if (item.source?.toLowerCase().includes("fallback")) score -= 5;

  return Math.max(35, Math.min(98, score));
}

function needsConfirmation(item, source) {
  const bucket = classifyBucket(item, source);
  const sourceType = source?.sourceType || item.sourceType;

  if (sourceType === SOURCE_TYPES.MEDIA || sourceType === SOURCE_TYPES.FALLBACK) {
    return true;
  }

  if (bucket.includes("BRICS")) {
    return true;
  }

  if (
    bucket.includes("CBDC") &&
    sourceType !== SOURCE_TYPES.INSTITUTIONAL &&
    sourceType !== SOURCE_TYPES.OFFICIAL
  ) {
    return true;
  }

  return false;
}

function getWhyItMatters(item, source) {
  const bucket = classifyBucket(item, source);

  if (bucket.includes("XRPL Core")) {
    return "Protocol/core update. Relevant voor validators, builders, tooling en long-term XRPL reliability.";
  }

  if (bucket.includes("XLS")) {
    return "Standards signal. Relevant omdat XLS-voorstellen kunnen bepalen hoe builders interoperabele XRPL-features ontwerpen.";
  }

  if (bucket.includes("Ripple")) {
    return "Ripple ecosystem signal. Relevant voor institutional payments, custody, RLUSD, tokenization of enterprise adoption context.";
  }

  if (bucket.includes("Xaman")) {
    return "Wallet/onboarding signal. Relevant omdat Xaman een belangrijke self-custody route is in OTT Terminal.";
  }

  if (bucket.includes("RWA")) {
    return "Tokenization/RWA signal. Relevant voor asset issuance, institutional rails en toekomstige XRPL business routes.";
  }

  if (bucket.includes("CBDC")) {
    return "Macro payments signal. Relevant voor digital money infrastructure, maar niet automatisch bewijs van XRPL/XRP adoption.";
  }

  if (bucket.includes("BRICS")) {
    return "Geopolitical payments signal. Alleen gebruiken als context; claims over XRP/XRPL vereisen extra bevestiging.";
  }

  if (bucket.includes("ISO")) {
    return "Payments messaging signal. Relevant voor financial infrastructure, interoperability en settlement narrative.";
  }

  if (bucket.includes("DeFi")) {
    return "DeFi/liquidity signal. Relevant voor AMM, DEX, lending en risk-aware XRPL education.";
  }

  if (bucket.includes("AI Agents")) {
    return "Agentic payments signal. Relevant voor toekomstige wallet automation, permissions, audit trails en human control.";
  }

  if (bucket.includes("Security")) {
    return "Risk signal. Relevant voor wallet safety, user protection en scam awareness.";
  }

  return "Ecosystem signal. Relevant voor dagelijkse XRPL intelligence en community awareness.";
}

function normalizeItem(item, source) {
  const extractedDate = extractDateFromTitle(item.title);
  const title = cleanTitle(item.title);
  const normalized = {
    ...item,
    title,
    sourceType: item.sourceType || source?.sourceType || SOURCE_TYPES.MEDIA,
    pubDate: item.pubDate || extractedDate || new Date().toISOString(),
    description:
      item.description && item.description.length > 10
        ? cleanText(item.description).slice(0, 500)
        : `Nieuw XRPL Intelligence item via ${item.source}.`,
  };

  const bucket = classifyBucket(normalized, source);
  const tags = getMatchedTags(normalized);

  return {
    ...normalized,
    category: bucket,
    bucket,
    tags,
    signalType: getSignalType(normalized, source),
    officialSource:
      normalized.sourceType === SOURCE_TYPES.OFFICIAL ||
      normalized.sourceType === SOURCE_TYPES.TECHNICAL ||
      normalized.sourceType === SOURCE_TYPES.INSTITUTIONAL,
    needsConfirmation: needsConfirmation(normalized, source),
    confidenceScore: getConfidenceScore(normalized, source),
    whyItMatters: getWhyItMatters(normalized, source),
  };
}

function keepHighQualityItem(item, source) {
  if (!item.title || isBadTitle(item.title)) return false;
  if (!isAllowedLink(item.link, source)) return false;

  const year = getYearFromItem(item);

  if (year < MIN_YEAR) return false;

  const text = getCombinedText(item);
  const sourceKeywords = source.relevanceKeywords || [];

  if (source.sourceType === SOURCE_TYPES.INSTITUTIONAL) {
    return includesAny(text, sourceKeywords) || includesAny(text, GLOBAL_RELEVANCE_KEYWORDS);
  }

  return true;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "XRPL-OnTheTrack-Terminal/1.0 (+https://ott-terminal-mvp.vercel.app)",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

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
    const pubDate =
      getTagValue(itemXml, "pubDate") ||
      getTagValue(itemXml, "published") ||
      getTagValue(itemXml, "updated");

    const author =
      getTagValue(itemXml, "dc:creator") ||
      getTagValue(itemXml, "author") ||
      source.name;

    const description =
      getTagValue(itemXml, "description") ||
      getTagValue(itemXml, "content:encoded") ||
      "";

    if (title) {
      items.push({
        title,
        link: resolveUrl(link || source.homeUrl, source.homeUrl),
        pubDate: pubDate || extractDateFromTitle(title),
        author,
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

    const pubDate =
      getTagValue(entryXml, "published") || getTagValue(entryXml, "updated");

    const author = getTagValue(entryXml, "name") || source.name;

    const description =
      getTagValue(entryXml, "summary") || getTagValue(entryXml, "content") || "";

    if (title) {
      items.push({
        title,
        link: resolveUrl(link || source.homeUrl, source.homeUrl),
        pubDate: pubDate || extractDateFromTitle(title),
        author,
        source: source.name,
        sourceType: source.sourceType,
        category: source.category,
        description,
      });
    }
  }

  return items;
}

function parseJsonLd(html, source) {
  const items = [];
  const scripts =
    html.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi
    ) || [];

  for (const script of scripts) {
    try {
      const rawJson = script
        .replace(/<script[^>]*>/i, "")
        .replace(/<\/script>/i, "")
        .trim();

      const parsed = JSON.parse(rawJson);
      const queue = Array.isArray(parsed) ? parsed : [parsed];

      for (const block of queue) {
        const graph = Array.isArray(block["@graph"]) ? block["@graph"] : [block];

        for (const node of graph) {
          const type = Array.isArray(node["@type"])
            ? node["@type"].join(" ")
            : node["@type"] || "";

          const isArticle =
            type.includes("Article") ||
            type.includes("BlogPosting") ||
            type.includes("NewsArticle") ||
            type.includes("Report") ||
            type.includes("TechArticle");

          if (!isArticle) continue;

          const title = node.headline || node.name;
          const link = node.url || node.mainEntityOfPage?.["@id"];
          const pubDate = node.datePublished || node.dateModified;
          const description = node.description || "";

          if (title) {
            items.push({
              title: cleanText(title),
              link: resolveUrl(link || source.homeUrl, source.homeUrl),
              pubDate: pubDate || extractDateFromTitle(title),
              author: source.name,
              source: source.name,
              sourceType: source.sourceType,
              category: source.category,
              description: cleanText(description),
            });
          }
        }
      }
    } catch {
      // JSON-LD kan meerdere formats hebben. Geen probleem.
    }
  }

  return items;
}

function parseHtmlLinks(html, source) {
  const items = [];
  const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    const rawText = cleanText(match[2]);
    const link = resolveUrl(href, source.homeUrl);

    if (!rawText || !isAllowedLink(link, source)) continue;

    const title = cleanTitle(rawText);

    items.push({
      title,
      link,
      pubDate: extractDateFromTitle(title) || new Date().toISOString(),
      author: source.name,
      source: source.name,
      sourceType: source.sourceType,
      category: source.category,
      description: `Nieuw XRPL Intelligence item gevonden via ${source.name}.`,
    });
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
      .filter((item) => keepHighQualityItem(item, source));

    if (parsed.length > 0) {
      allItems.push(...parsed);
      break;
    }
  }

  if (allItems.length > 0) {
    return allItems;
  }

  const html = await fetchText(source.homeUrl);

  if (!html) {
    return [];
  }

  const jsonLdItems = parseJsonLd(html, source)
    .map((item) => normalizeItem(item, source))
    .filter((item) => keepHighQualityItem(item, source));

  if (jsonLdItems.length > 0) {
    return jsonLdItems;
  }

  return parseHtmlLinks(html, source)
    .map((item) => normalizeItem(item, source))
    .filter((item) => keepHighQualityItem(item, source));
}

function dedupeItems(items) {
  const seen = new Set();
  const finalItems = [];

  for (const item of items) {
    const key = `${item.link || item.title || ""}`.toLowerCase();

    if (seen.has(key)) continue;
    seen.add(key);

    finalItems.push(item);
  }

  return finalItems;
}

function sortByDate(items) {
  return items.sort((a, b) => {
    const dateA = new Date(a.pubDate || 0).getTime();
    const dateB = new Date(b.pubDate || 0).getTime();

    return dateB - dateA;
  });
}

function enrichFallbackItems() {
  return FALLBACK_ITEMS.map((item) =>
    normalizeItem(
      {
        ...item,
        sourceType: SOURCE_TYPES.FALLBACK,
      },
      {
        name: item.source,
        sourceType: SOURCE_TYPES.FALLBACK,
        category: item.category,
        allowedUrlPatterns: [/.+/],
      }
    )
  );
}

function buildBrief(items) {
  const buckets = new Map();

  for (const item of items) {
    const bucket = item.bucket || item.category || "XRPL Intelligence";
    buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
  }

  const topBuckets = Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([bucket, count]) => ({ bucket, count }));

  return {
    title: "XRPL Intelligence Daily Brief",
    generatedAt: new Date().toISOString(),
    topBuckets,
    summary:
      items.length > 0
        ? `Vandaag zijn ${items.length} intelligence items opgehaald en geclassificeerd voor XRPL, Ripple, Xaman, XLS, CBDC, ISO 20022, RWA en macro payments.`
        : "Geen live intelligence items gevonden. Fallback intelligence is geactiveerd.",
    legalNote:
      "Education only. This feed is not financial advice, not trading signals and not confirmation that XRP/XRPL is used by any macro system unless official sources explicitly confirm it.",
  };
}

function getLimit(req) {
  const rawLimit = req.query?.limit;
  const value = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;
  const limit = Number(value);

  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(80, Math.max(1, Math.round(limit)));
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Gebruik GET.",
    });
  }

  try {
    const limit = getLimit(req);
    const sourceResults = await Promise.allSettled(
      SOURCES.map(async (source) => ({
        source,
        items: await fetchSourceItems(source),
      }))
    );

    const allItems = [];
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
        debug.push({
          source: "unknown",
          count: 0,
          error: result.reason?.message || String(result.reason),
        });
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
      sources: SOURCES.map((source) => ({
        name: source.name,
        category: source.category,
        sourceType: source.sourceType,
        homeUrl: source.homeUrl,
      })),
      buckets: KEYWORD_BUCKETS.map((group) => group.bucket),
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
