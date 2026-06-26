import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const feedUrls = [
    "https://www.bis.org/rss/feed.xml",
    "https://www.federalreserve.gov/feeds/press.xml",
    "https://xrpl.org/blog/feed.xml",
    "https://www.iso.org/contents/news/rss.xml"
  ];

  try {
    // Haal alle feeds tegelijk op
    const fetchPromises = feedUrls.map(url => 
      fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`)
        .then(r => r.json())
        .catch(() => ({ items: [] }))
    );

    const results = await Promise.all(fetchPromises);
    
    // Combineer alle items in één array
    let allItems = results.flatMap(r => r.items || []);

    // Sorteer op datum (nieuwste eerst)
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    res.status(200).json({ items: allItems.slice(0, 20) }); // Top 20 meest actueel
  } catch (error) {
    res.status(500).json({ error: "Failed to aggregate feeds" });
  }
}
