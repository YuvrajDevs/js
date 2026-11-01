import { NextResponse } from "next/server"; import fs from "node:fs"; import path from "node:path"; import { ROOT } from "@/lib/server";
export const dynamic = "force-dynamic";
const f = (n: string) => path.join(ROOT, n); const rd = (n: string, d: any) => fs.existsSync(f(n)) ? JSON.parse(fs.readFileSync(f(n), "utf8")) : d;
const wr = (n: string, v: any) => { fs.mkdirSync(path.dirname(f(n)), { recursive: true }); fs.writeFileSync(f(n), JSON.stringify(v, null, 1)); };
export function GET() {
  const stats = rd("data/source-stats.json", {}); const off: string[] = rd("data/source-prefs.json", { disabled: [] }).disabled;
  const jobs = fs.existsSync(f("data/jobs.json")) ? Object.values(rd("data/jobs.json", {})) as any[] : [];
  const sources = [...rd("sources.json", []), ...rd("data/custom-sources.json", []).map((s: any) => ({ ...s, custom: true }))]
    .map((s: any) => ({ ...s, enabled: !off.includes(s.id), stats: stats[s.id] ?? null, kept: jobs.filter(j => j.source === s.id).length }));
  const extra = Object.keys(stats).filter(k => !sources.some((s: any) => s.id === k)).map(k => ({ id: k, name: k, kind: "ats/careers", competition: k === "careers-pages" || k.startsWith("page/") ? "low" : "medium", enabled: true, stats: stats[k], kept: jobs.filter(j => j.source === k.split("/").pop() || (k === "careers-pages" && j.id.startsWith("pg:"))).length }));
  return NextResponse.json({ sources: [...sources, ...extra] });
}
export async function POST(req: Request) { // add custom source {name,url,kind: rss|page, competition}
  const b = await req.json(); if (!/^https?:\/\//.test(b.url ?? "") || !["rss", "page"].includes(b.kind)) return NextResponse.json({ error: "Need an http(s) URL and kind rss or page" }, { status: 400 });
  const list = rd("data/custom-sources.json", []); const id = "c-" + (b.name || new URL(b.url).hostname).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (list.some((s: any) => s.id === id)) return NextResponse.json({ error: "Already added" }, { status: 409 });
  list.push({ id, name: b.name || new URL(b.url).hostname, kind: b.kind, url: b.url, competition: b.competition ?? "low", remote: !!b.remote }); wr("data/custom-sources.json", list); return NextResponse.json({ ok: true });
}
export async function PATCH(req: Request) { // toggle {id, enabled}
  const { id, enabled } = await req.json(); const prefs = rd("data/source-prefs.json", { disabled: [] });
  prefs.disabled = enabled ? prefs.disabled.filter((x: string) => x !== id) : [...new Set([...prefs.disabled, id])]; wr("data/source-prefs.json", prefs); return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) { const { id } = await req.json(); wr("data/custom-sources.json", rd("data/custom-sources.json", []).filter((s: any) => s.id !== id)); return NextResponse.json({ ok: true }); }
