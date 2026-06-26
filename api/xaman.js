module.exports = async (req, res) => {
  // Zorg dat we altijd JSON terugsturen, ook bij fouten
  res.setHeader('Content-Type', 'application/json');

  try {
    const { endpoint, body } = req.body;
    const XAMAN_KEY = process.env.VITE_XAMAN_API_KEY;
    const XAMAN_SECRET = process.env.VITE_XAMAN_API_SECRET;

    if (!XAMAN_KEY || !XAMAN_SECRET) {
      return res.status(500).json({ error: "API Keys missen op server" });
    }

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
    return res.status(500).json({ error: "Server error in proxy" });
  }
};
