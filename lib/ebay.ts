const EBAY_OAUTH = "https://api.ebay.com/identity/v1/oauth2/token";

export async function getEbayAppToken() {
  const clientId = process.env.EBAY_CLIENT_ID!;
  const clientSecret = process.env.EBAY_CLIENT_SECRET!;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  });

  const res = await fetch(EBAY_OAUTH, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`eBay token error: ${res.status} ${t}`);
  }
  const json = await res.json();
  return json.access_token as string;
}
