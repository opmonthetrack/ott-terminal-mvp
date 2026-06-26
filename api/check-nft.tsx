// api/check-nft.js (Vercel ondersteunt dit als CommonJS)
module.exports = async (req, res) => {
  // Zorg dat we alleen POST requests accepteren
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ success: false, error: "No address provided" });
  }

  try {
    const response = await fetch('https://xrplcluster.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: "account_nfts",
        params: [{ account: address, ledger_index: "validated" }]
      })
    });

    const data = await response.json();
    
    // Stuur de data door naar je frontend
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error("Ledger Fetch Error:", error);
    return res.status(500).json({ success: false, error: "Kon Ledger niet bereiken" });
  }
};
