// api/news.js

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 2;

const SOURCES = [
  {
    name: "XRPL Blog",
    category: "XRPL",
    homeUrl: "https://xrpl.org/blog",
    feedUrls: [
      "https://xrpl.org/blog/index.xml",
      "https://xrpl.org/blog/rss.xml",
      "https://xrpl.org/feed.xml",
      "https://xrpl.org/rss.xml",
    ],
    allowedUrlPatterns: [
      /^https:\/\/xrpl\.org\/blog\/20\d{2}\//i,
    ],
  },
  {
    name: "Ripple Insights",
    category: "Ripple",
    homeUrl: "https://ripple.com/insights/",
    feedUrls: [
      "https://ripple.com/insights/feed/",
      "https://ripple.com/feed/",
      "https://ripple.com/rss.xml",
    ],
    allowedUrlPatterns: [
      /^https:\/\/ripple\.com\/insights\/[a-z0-9-]+\/?$/i,
    ],
  },
  {
    name: "Xaman Blog",
    category: "Xaman",
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
  },
];

const FALLBACK_ITEMS = [
  {
    title: "XRPL OnTheTrack Terminal Daily Brief",
    link: "https://xrpl.org/blog",
    pubDate: new Date().toISOString(),
    author: "OTT Terminal",
    source: "OTT Fallback",
    category: "XRPL",
    description:
      "De live nieuwsfeed kon nog niet schoon worden opgehaald. De terminal blijft werken met veilige fallback intelligence.",
  },
  {
    title: "Make Waves Focus: Daily users, mainnet activity and source tags",
    link: "https://xrpl.org",
    pubDate: new Date().toISOString(),
    author: "OTT Terminal",
    source: "OTT Fallback",
    category: "Make Waves",
    description:
      "De volgende bouwstap is dagelijkse gebruikersactivatie via Xaman en een source-tagged XRPL mainnet actie.",
  },
  {
    title:
      "Ledger Intel Ready: XRPL, Ripple, Xaman, Stablecoins, CBDC and ISO 20022",
    link: "https://ripple.com/insights/",
    pubDate: new Date().toISOString(),
    author: "OTT Terminal",
    source: "OTT Fallback",
    category: "Ledger Intel",
    description:
      "Ledger Intel wordt de dagelijkse intelligence-laag van XRPL OnTheTrack Terminal.",
  },
];

const BLOCKED_TITLE_WORDS = [
  "link to home",
  "company logo",
  "treasury management",
  "customers overview",
  "customer case studies",
  "compliance",
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

  if (title.length < 20 || title.length > 180) return true;

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

function normalizeItem(item) {
  const extractedDate = extractDateFromTitle(item.title);
  const title = cleanTitle(item.title);

  return {
    ...item,
    title,
    pubDate: item.pubDate || extractedDate || new Date().toISOString(),
    description:
      item.description && item.description.length > 10
        ? item.description
        : `Nieuw Ledger Intel item via ${item.source}.`,
  };
}

function keepHighQualityItem(item, source) {
  if (!item.title || isBadTitle(item.title)) return false;
  if (!isAllowedLink(item.link, source)) return false;

  const year = getYearFromItem(item);

  if (year < MIN_YEAR) return false;

  return true;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "XRPL-OnTheTrack-Terminal/1.0",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html",
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
            type.includes("NewsArticle");

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
              category: source.category,
              description: cleanText(description),
            });
          }
        }
      }
    } catch {
      // JSON-LD kan soms meerdere formats hebben. Geen probleem.
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
      category: source.category,
      description: `Nieuw Ledger Intel item gevonden via ${source.name}.`,
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
      .map(normalizeItem)
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
    .map(normalizeItem)
    .filter((item) => keepHighQualityItem(item, source));

  if (jsonLdItems.length > 0) {
    return jsonLdItems;
  }

  return parseHtmlLinks(html, source)
    .map(normalizeItem)
    .filter((item) => keepHighQualityItem(item, source));
}

function dedupeItems(items) {
  const seen = new Set();
  const finalItems = [];

  for (const item of items) {
    const key = `${item.link || ""}`.toLowerCase();

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

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Gebruik GET.",
    });
  }

  try {
    const allItems = [];
    const debug = [];

    for (const source of SOURCES) {
      const sourceItems = await fetchSourceItems(source);

      debug.push({
        source: source.name,
        count: sourceItems.length,
      });

      allItems.push(...sourceItems);
    }

    const cleanedItems = sortByDate(dedupeItems(allItems)).slice(0, 30);
    const finalItems = cleanedItems.length > 0 ? cleanedItems : FALLBACK_ITEMS;

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      count: finalItems.length,
      fallback: cleanedItems.length === 0,
      sources: SOURCES.map((source) => source.name),
      debug,
      items: finalItems,
    });
  } catch (error) {
    console.error("News API crashed:", error);

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      count: FALLBACK_ITEMS.length,
      fallback: true,
      error: "News API fallback activated.",
      items: FALLBACK_ITEMS,
    });
  }
}
