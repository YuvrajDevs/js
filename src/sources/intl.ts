// International sources. Boards with a real API are used directly; everything else goes through
// the generic page reader so Japanese/German/etc. pages work too (translated later in intl.ts).
import type { Job } from "../types.js"; import { client, MODEL } from "../rank.js";
const strip = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();

// Germany, lots of visa-sponsored English roles. API shape from Arbeitnow's public docs (UNVERIFIED from this sandbox).
export async function arbeitnow(): Promise<Job[]> {
  const r = await fetch("https://www.arbeitnow.com/api/job-board-api"); if (!r.ok) throw new Error(String(r.status));
  const d: any = await r.json();
  return d.data.map((j: any): Job => ({ id: `an:${j.slug}`, source: "arbeitnow", company: j.company_name, title: j.title, location: j.location, country: "Germany", url: j.url, description: strip(j.description), postedAt: new Date(j.created_at * 1000).toISOString(), status: "new" }));
}
// Generic: fetch any careers/listing page (e.g. Japan Dev, TokyoDev, a company's /careers) and let Claude pull out the postings.
export async function pageReader(url: string): Promise<Job[]> {
  const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 js-jobseek" } }); if (!r.ok) throw new Error(`${r.status} ${url}`);
  const html = (await r.text()).replace(/<(script|style)[\s\S]*?<\/\1>/g, "");
  const links = [...html.matchAll(/<a[^>]+href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(m => `${new URL(m[1], url).href} :: ${strip(m[2]).slice(0, 120)}`).slice(0, 300);
  const out = await client().messages.create({ model: MODEL, max_tokens: 3000, messages: [{ role: "user", content:
`From these links on a job board page, return ONLY a JSON array of links that are individual job postings: [{"url":"","title":"","company":""}]. Titles may be Japanese or another language; keep original text.\n${links.join("\n")}` }] });
  const arr = JSON.parse(out.content.map((b: any) => b.text ?? "").join("").match(/\[[\s\S]*\]/)![0]);
  const jobs: Job[] = [];
  for (const a of arr.slice(0, 40)) { // fetch each posting body
    try { const p = await fetch(a.url, { headers: { "user-agent": "Mozilla/5.0 js-jobseek" } }); const t = strip((await p.text()).replace(/<(script|style)[\s\S]*?<\/\1>/g, ""));
      jobs.push({ id: `pg:${a.url}`, source: new URL(url).hostname, company: a.company ?? new URL(url).hostname, title: a.title, location: "", url: a.url, description: t.slice(0, 7000), status: "new" }); } catch {}
  }
  return jobs;
}
