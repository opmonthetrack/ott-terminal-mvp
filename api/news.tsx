import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // We halen de RSS feed direct van Ripple Insights
  const RSS_FEED_URL = "https://ripple.com/insights/feed/";
  
  try {
    // Gebruik rss2json (gratis & publiek) om RSS om te zetten naar bruikbare JSON
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`);
    const data = await response.json();
    
    // We sturen de 'items' (de nieuwsberichten) terug naar je frontend
    res.status(200).json({ items: data.items || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feed" });
  }
}
