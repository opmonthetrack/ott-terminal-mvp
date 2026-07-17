export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  return res.status(410).json({
    ok: false,
    error: "This legacy proxy is disabled. Use the allowlisted /api/ott actions.",
  });
}
