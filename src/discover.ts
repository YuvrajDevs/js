// Company -> careers page discovery for small startups that never post on big boards.
import fs from "node:fs"; import crypto from "node:crypto";
import { client, MODEL } from "./rank.js"; import { pageReader } from "./sources/intl.js"; import type { Job } from "./types.js";
const F = "data/companies.json";
export interface Co { domain: string; name?: string; careers?: string; hash?: string; checked?: string }
export const loadCos = (): Record<string, Co> => fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, "utf8")) : {};
export const saveCos = (c: Record<string, Co>) => { fs.mkdirSync("data", { recursive: true }); fs.writeFileSync(F, JSON.stringify(c, null, 1)); };
const UA = { "user-agent": "Mozilla/5.0 js-jobseek" };
const PATHS = ["/careers", "/jobs", "/en/careers", "/en/jobs", "/recruit", "/en/recruit", "/join", "/about/careers", "/company/careers", "/hiring", "/work-with-us", "/careers/"];
// Third-party ATS pages (common in Japan) that a homepage links out to.
const ATS_RE = /(greenhouse\.io|lever\.co|ashbyhq\.com|smartrecruiters\.com|workable\.com|hrmos\.co|herp\.cc|wantedly\.com\/companies|talentio|recruitee\.com|notion\.site|teamtailor\.com)/i;

// 1. Pull company homepages out of any directory/list page (startup lists, "Japan startups" posts, accelerator portfolios...).
export async function companiesFromDirectory(url: string): Promise<string[]> {
  const html = (await (await fetch(url, { headers: UA })).text()).replace(/<(script|style)[\s\S]*?<\/\1>/g, "");
  const links = [...new Set([...html.matchAll(/href="(https?:\/\/[^"#?]+)/g)].map(m => new URL(m[1]).origin))].slice(0, 400);
  const r = await client().messages.create({ model: MODEL, max_tokens: 3000, messages: [{ role: "user", content:
`These are outbound links from a startup directory page (${url}). Return ONLY a JSON array of origins that are individual startup/company websites. Exclude social networks, news sites, app stores, the directory itself, CDNs.\n${links.join("\n")}` }] });
  return JSON.parse(r.content.map((b: any) => b.text ?? "").join("").match(/\[[\s\S]*\]/)![0]);
}
// 2. Find a company's careers page (probe common paths, then look for links on the homepage).
export async function findCareers(origin: string): Promise<string | undefined> {
  for (const p of PATHS) { try { const r = await fetch(origin + p, { headers: UA, redirect: "follow" }); if (r.ok && (r.headers.get("content-type") ?? "").includes("html")) return r.url; } catch {} }
  try {
    const html = await (await fetch(origin, { headers: UA })).text();
    const hrefs = [...html.matchAll(/<a[^>]+href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/g)];
    for (const [, h, t] of hrefs) if (ATS_RE.test(h) || /career|recruit|hiring|jobs|採用|求人|キャリア|join/i.test(h + t)) return new URL(h, origin).href;
  } catch {}
}
// 3. For every known company: find the page once, re-read only when its content changed.
export async function scanCompanies(limit = 60): Promise<Job[]> {
  const cos = loadCos(); const out: Job[] = [];
  for (const co of Object.values(cos).slice(0, limit)) {
    try {
      co.careers ??= await findCareers("https://" + co.domain);
      if (!co.careers) continue;
      const body = await (await fetch(co.careers, { headers: UA })).text();
      const h = crypto.createHash("md5").update(body.replace(/\s+/g, "")).digest("hex");
      if (h === co.hash) continue; // unchanged since last scan: no tokens spent
      co.hash = h; co.checked = new Date().toISOString();
      const jobs = await pageReader(co.careers); jobs.forEach(j => { j.company = co.name ?? co.domain; }); out.push(...jobs);
    } catch (e: any) { console.warn(`careers/${co.domain}: ${e.message}`); }
  }
  saveCos(cos); return out;
}
