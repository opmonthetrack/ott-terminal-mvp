// api/check-nft.js

export default async function handler(req, res) {
  // Altijd JSON terugsturen
  res.setHeader("Content-Type", "application/json");

  // Alleen POST toestaan
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Gebruik POST.",
    });
  }

  try {
    const { address } = req.body || {};

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Geen XRPL-adres opgegeven.",
      });
    }

    const response = await fetch("https://xrplcluster.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "account_nfts",
        params: [
          {
            account: address,
            ledger_index: "validated",
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(500).json({
        success: false,
        error: "Kon NFT-data niet ophalen van de XRPL Ledger.",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      address,
      data,
    });
  } catch (error) {
    console.error("Ledger Fetch Error:", error);

    return res.status(500).json({
      success: false,
      error: "Kon XRPL Ledger niet bereiken.",
    });
  }
}
