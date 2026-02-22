"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

type Card = {
  id: string;
  image_url: string;
  player: string;
  year: string;
  set_name: string;
  brand: string;
  card_number: string;
  sport: string;
  graded_company: string;
  grade: string;
  serial_number: string;
  flags: string[];
  estimated_price_cad: number | null;
  price_source: string;
};

export default function Home() {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const camUploadRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [form, setForm] = useState({ sport: "Hockey", player: "", year: "", brand: "", set_name: "", card_number: "" });
  const [cards, setCards] = useState<Card[]>([]);
  const total = useMemo(() => cards.reduce((s, c) => s + (c.estimated_price_cad || 0), 0), [cards]);

  const runQuickHeuristics = (text: string) => {
    const flags: string[] = [];
    const serial = (text.match(/\b(\d{1,3})\s*\/\s*(\d{2,4})\b/) || [])[0] || "";
    if (serial) flags.push("Serial");
    if (/\bRC\b|ROOKIE/i.test(text)) flags.push("RC");
    if (/AUTO|AUTOGRAPH/i.test(text)) flags.push("Auto");
    if (/PATCH|RELIC|JERSEY/i.test(text)) flags.push("Relic");
    const graded_company = (text.match(/\b(PSA|SGC|BGS|CGC)\b/i) || [])[0]?.toUpperCase?.() || "";
    const grade = (text.match(/\b10\b|\b9\.5\b|\b9\b|\b8\.5\b|\b8\b|\b7\b/i) || [])[0] || "";
    return { flags, serial_number: serial, graded_company, grade };
  };

  const ebayLookup = async (guess: string) => {
    const res = await fetch("/api/ebay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: guess, limit: 12 }),
    });
    return res.json();
  };

  const uploadToServer = async (file: File, meta: any) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("meta", JSON.stringify(meta));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Upload failed");
    return json.card as Card;
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    setStatus("Preparing preview…");
    setPreviewUrl(URL.createObjectURL(file));

    const guess = `${form.year} ${form.player} ${form.brand} ${form.set_name} ${form.card_number}`.trim() || file.name;

    setStatus("Checking eBay Canada for price…");
    let median: number | null = null;
    try {
      const ebay = await ebayLookup(guess);
      median = ebay?.medianPriceCAD ?? null;
    } catch {}

    const heur = runQuickHeuristics(guess);

    setStatus("Saving to your collection…");
    const card = await uploadToServer(file, {
      ...form,
      ...heur,
      estimated_price_cad: median,
      price_source: "eBay CA (active listings median)",
    });

    setCards((prev) => [card, ...prev]);
    setStatus("Saved ✅");
    setBusy(false);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logo">
          <Image src="/shadowfox-logo.png" alt="ShadowFox Sports Cards" width={96} height={96} />
        </div>
        <div className="brand">
          <strong>ShadowFox SC - CardTrack</strong>
          <span>Scan • Confirm • Collect</span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span className="badge">Est. Total (CAD): ${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Add a card</h2>

          <div className="row">
            <div style={{ flex: "1 1 150px" }}>
              <label className="small">Sport</label>
              <select className="input" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                <option>Hockey</option><option>Baseball</option><option>Football</option><option>Basketball</option><option>Soccer</option>
              </select>
            </div>
            <div style={{ flex: "2 1 220px" }}>
              <label className="small">Player</label>
              <input className="input" value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} placeholder="Connor McDavid" />
            </div>
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <div style={{ flex: "1 1 120px" }}>
              <label className="small">Year</label>
              <input className="input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2023" />
            </div>
            <div style={{ flex: "2 1 220px" }}>
              <label className="small">Brand</label>
              <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Upper Deck" />
            </div>
            <div style={{ flex: "2 1 220px" }}>
              <label className="small">Set</label>
              <input className="input" value={form.set_name} onChange={(e) => setForm({ ...form, set_name: e.target.value })} placeholder="Series 1" />
            </div>
            <div style={{ flex: "1 1 130px" }}>
              <label className="small">Card #</label>
              <input className="input" value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value })} placeholder="201" />
            </div>
          </div>

          <div style={{ marginTop: 12 }} className="preview">
            {previewUrl ? <img src={previewUrl} alt="preview" /> : <div className="small">Preview will appear here</div>}
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" disabled={busy} onClick={() => uploadRef.current?.click()}>Upload</button>
            <input ref={uploadRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; e.target.value=""; void handleFile(f); }} />

            <button className="btn accent" disabled={busy} onClick={() => camUploadRef.current?.click()}>Camera/Upload</button>
            <input ref={camUploadRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; e.target.value=""; void handleFile(f); }} />
          </div>

          <div className="small" style={{ marginTop: 10 }}>
            {busy ? "Working…" : status || "Tip: Fill in what you know, then Upload. Next we’ll add OCR + auto-fill safely."}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Your Collection</h2>
          {cards.length === 0 ? (
            <div className="small">No cards yet. Upload your first card to start.</div>
          ) : (
            <table className="table">
              <thead><tr><th>Card</th><th>Details</th><th>Est. (CAD)</th></tr></thead>
              <tbody>
                {cards.map((c) => (
                  <tr key={c.id}>
                    <td><img src={c.image_url} alt="" style={{ width: 74, height: 54, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,.10)" }} /></td>
                    <td>
                      <div><strong>{c.player || "Unknown"}</strong> <span className="small">{c.year}</span></div>
                      <div className="small">{c.brand} {c.set_name} #{c.card_number}</div>
                      <div className="small">
                        {c.graded_company ? `${c.graded_company} ${c.grade}` : ""}{c.serial_number ? ` • ${c.serial_number}` : ""}{c.flags?.length ? ` • ${c.flags.join(", ")}` : ""}
                      </div>
                    </td>
                    <td>{c.estimated_price_cad ? `$${Number(c.estimated_price_cad).toFixed(2)}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="small" style={{ marginTop: 10 }}>
            Deploy tip: keep eBay & Supabase keys in Vercel Environment Variables (never in GitHub).
          </div>
        </div>
      </div>
    </div>
  );
}
