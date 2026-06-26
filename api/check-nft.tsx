import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
  
  const { address } = req.body;
  
  try {
    const response = await fetch('https://s1.ripple.com:51234/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: "account_nfts",
        params: [{ account: address, ledger_index: "validated" }]
      })
    });
    
    const data = await response.json();
    
    // Stuur de data door naar je frontend
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Ledger Fetch Error:", error); // Dit verschijnt in je Vercel logs!
    res.status(500).json({ error: "Failed to fetch from Ledger" });
  }
}
