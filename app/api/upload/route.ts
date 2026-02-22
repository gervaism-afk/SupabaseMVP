import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const metaRaw = form.get("meta") as string | null;

    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const meta = metaRaw ? JSON.parse(metaRaw) : {};
    const sb = supabaseServer();

    const bytes = Buffer.from(await file.arrayBuffer());
    const key = `cards/${Date.now()}_${safeName(file.name || "upload.jpg")}`;

    const { error: upErr } = await sb.storage.from("card-images").upload(key, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (upErr) return NextResponse.json({ error: "Upload failed", details: upErr }, { status: 502 });

    const { data: pub } = sb.storage.from("card-images").getPublicUrl(key);

    const row = {
      image_url: pub.publicUrl,
      player: meta.player || "",
      year: meta.year || "",
      set_name: meta.set_name || "",
      brand: meta.brand || "",
      card_number: meta.card_number || "",
      sport: meta.sport || "",
      graded_company: meta.graded_company || "",
      grade: meta.grade || "",
      serial_number: meta.serial_number || "",
      flags: meta.flags || [],
      estimated_price_cad: meta.estimated_price_cad ?? null,
      price_source: meta.price_source || "",
    };

    const { data, error } = await sb.from("cards").insert(row).select("*").single();
    if (error) return NextResponse.json({ error: "DB insert failed", details: error }, { status: 502 });

    return NextResponse.json({ ok: true, card: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
