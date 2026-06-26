// /api/xaman.js
module.exports = async (req, res) => {
  const { endpoint, body } = req.body;
  
  // De geheime keys die in Vercel staan
  const XAMAN_KEY = process.env.VITE_XAMAN_API_KEY;
  const XAMAN_SECRET = process.env.VITE_XAMAN_API_SECRET;

  try {
    const response = await fetch(`https://xumm.app/api/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': XAMAN_KEY,
        'x-api-secret': XAMAN_SECRET
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Xaman Proxy Error:", error);
    return res.status(500).json({ error: "Proxy call failed" });
  }
};
