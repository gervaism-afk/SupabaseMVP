import { NextRequest, NextResponse } from "next/server";
import { getEbayAppToken } from "@/lib/ebay";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 10 } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const token = await getEbayAppToken();
    const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(Math.min(50, Math.max(1, limit))));
    url.searchParams.set("filter", "priceCurrency:CAD");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_CA"
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "eBay browse error", details: data }, { status: 502 });

    const prices: number[] = (data.itemSummaries || [])
      .map((it: any) => Number(it?.price?.value))
      .filter((n: any) => Number.isFinite(n))
      .sort((a: number, b: number) => a - b);

    const median = prices.length ? prices[Math.floor(prices.length / 2)] : null;

    return NextResponse.json({ marketplace: "EBAY_CA", query, medianPriceCAD: median, results: data.itemSummaries || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
