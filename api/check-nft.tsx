// /api/check-nft.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Zorg dat we alleen POST requests accepteren
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ success: false, error: "No address provided" });
  }

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
    
    // We sturen de data direct door, inclusief de eventuele Ledger-foutmeldingen
    res.status(200).json({ success: true, data: data });
  } catch (error: any) {
    console.error("Ledger Fetch Error:", error);
    res.status(500).json({ success: false, error: "Kon Ledger niet bereiken" });
  }
}
