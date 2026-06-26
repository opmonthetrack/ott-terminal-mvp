// api/news.js

const FALLBACK_ITEMS = [
  {
    title: "XRPL OnTheTrack Terminal Daily Brief",
    link: "https://xrpl.org/blog",
    pubDate: new Date().toISOString(),
    author: "OTT Terminal",
    source: "OTT Fallback",
    category: "XRPL",
    description:
      "De live nieuwsfeed kon nog niet worden opgehaald. De terminal blijft werken met veilige fallback intelligence.",
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
    title: "Ledger Intel Ready: XRPL, Ripple, Xaman, Stablecoins, CBDC and ISO 20022",
    link: "https://ripple.com/insights/",
    pubDate: new Date().toISOString(),
    author: "OTT Terminal",
    source: "OTT Fallback",
    category: "Ledger Intel",
    description:
      "Ledger Intel wordt de dagelijkse intelligence-laag van XRPL OnTheTrack Terminal.",
  },
];

const FEEDS = [
  {
    name: "XRPL Blog",
    category: "XRPL",
    url: "https://xrpl.org/blog/index.xml",
  },
  {
    name: "Ripple Insights",
    category: "Ripple",
    url: "https://ripple.com/insights/feed/",
  },
  {
    name: "Xaman Blog",
    category: "Xaman",
    url: "https://xaman.app/blog/rss.xml",
  },
];

function cleanText(value = "") {
  return value
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
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

function parseRssItems(xml, feed) {
  const items = [];
  const matches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of matches) {
    const title = getTagValue(itemXml, "title");
    const link = getTagValue(itemXml, "link");
    const pubDate = getTagValue(itemXml, "pubDate");
    const author =
      getTagValue(itemXml, "dc:creator") ||
      getTagValue(itemXml, "author") ||
      feed.name;

    const description =
      getTagValue(itemXml, "description") ||
      getTagValue(itemXml, "content:encoded");

    if (title) {
      items.push({
        title,
        link,
        pubDate: pubDate || new Date().toISOString(),
        author,
        source: feed.name,
        category: feed.category,
        description,
      });
    }
  }

  return items;
}

async function fetchFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: {
        "User-Agent": "XRPL-OnTheTrack-Terminal/1.0",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    return parseRssItems(xml, feed);
  } catch (error) {
    console.error(`Feed failed: ${feed.name}`, error);
    return [];
  }
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

    for (const feed of FEEDS) {
      const items = await fetchFeed(feed);
      allItems.push(...items);
    }

    const sortedItems = allItems.sort((a, b) => {
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    const finalItems =
      sortedItems.length > 0 ? sortedItems.slice(0, 30) : FALLBACK_ITEMS;

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      count: finalItems.length,
      items: finalItems,
      fallback: sortedItems.length === 0,
    });
  } catch (error) {
    console.error("News API crashed:", error);

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      count: FALLBACK_ITEMS.length,
      items: FALLBACK_ITEMS,
      fallback: true,
    });
  }
}
