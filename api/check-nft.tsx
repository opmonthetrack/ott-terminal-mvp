module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { address } = req.body;
    const response = await fetch('https://xrplcluster.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: "account_nfts",
        params: [{ account: address, ledger_index: "validated" }]
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error("Ledger Fetch Error:", error);
    return res.status(500).json({ success: false, error: "Kon Ledger niet bereiken" });
  }
};
