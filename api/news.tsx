import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // We roepen de CryptoPanic API aan (de industriestandaard)
    const response = await fetch('https://cryptopanic.com/api/v1/posts/?auth_token=' + process.env.CRYPTO_PANIC_API_KEY + '&currencies=XRP&kind=news');
    const data = await response.json();
    
    // Stuur de data door naar je frontend
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
}