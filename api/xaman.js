export default async function handler(req, res) {
  // Altijd JSON terugsturen
  res.setHeader("Content-Type", "application/json");

  // Alleen POST toestaan
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Gebruik POST.",
    });
  }

  try {
    const { endpoint, body } = req.body || {};

    // Deze keys moeten in Vercel staan ZONDER VITE_
    const XAMAN_KEY = process.env.XAMAN_API_KEY;
    const XAMAN_SECRET = process.env.XAMAN_API_SECRET;

    if (!XAMAN_KEY || !XAMAN_SECRET) {
      return res.status(500).json({
        error: "Xaman API keys missen op de server.",
      });
    }

    if (!endpoint) {
      return res.status(400).json({
        error: "Endpoint ontbreekt.",
      });
    }

    const response = await fetch(`https://xumm.app/api/v1/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": XAMAN_KEY,
        "x-api-secret": XAMAN_SECRET,
      },
      body: JSON.stringify(body || {}),
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Xaman Proxy Error:", error);

    return res.status(500).json({
      error: "Server error in Xaman proxy.",
    });
  }
}
