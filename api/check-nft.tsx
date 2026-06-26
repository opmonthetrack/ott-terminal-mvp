import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
  
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "No address provided" });
  
  try {
    const response = await fetch('https://xrplcluster.com/', { // Gebruik een stabielere node
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: "account_nfts",
        params: [{ account: address }]
      })
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    // Stuur de foutmelding terug naar je frontend in plaats van een algemene melding
    res.status(500).json({ error: error.message || "Unknown error" });
  }
}
