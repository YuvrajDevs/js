import fs from "node:fs"; import type { Job } from "./types.js"; import { profile } from "./profile.js"; import { prefilter } from "./rank.js";
import * as ats from "./sources/ats.js"; import * as com from "./sources/community.js"; import * as intl from "./sources/intl.js"; import * as more from "./sources/more.js";
import { normalizeIntl, languageOk, isForeignText, arrangementOk } from "./intl.js"; import { scanCompanies } from "./discover.js";
export interface Src { id: string; name: string; kind: string; url?: string; competition: "low" | "medium" | "high"; remote?: boolean; note?: string; custom?: boolean }
const rd = (f: string, d: any) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d;
export const allSources = (): Src[] => [...rd("sources.json", []), ...rd("data/custom-sources.json", []).map((s: Src) => ({ ...s, custom: true }))];
const disabled = (): string[] => rd("data/source-prefs.json", { disabled: [] }).disabled;

async function fetchSource(s: Src): Promise<Job[]> {
  switch (s.kind) {
    case "hnWho": return com.hnWhoIsHiring(); case "hnJobs": return more.hnJobs(); case "reddit": return more.reddit(s.url!);
    case "remoteok": return com.remoteok(); case "arbeitnow": return intl.arbeitnow(); case "remotive": return more.remotive(); case "jobicy": return more.jobicy();
    case "workingnomads": return more.workingnomads(); case "himalayas": return more.himalayas(); case "rss": return more.rss(s.url!, s.id); case "page": return intl.pageReader(s.url!);
  } throw new Error("unknown kind " + s.kind);
}
// Cheap India-eligibility guess from the location text so we don't spend an LLM call on every remote job.
export function locationHint(loc: string): "yes" | "no" | "unknown" {
  const l = loc.toLowerCase();
  if (/worldwide|anywhere|global|apac|asia|india|any (time ?zone|location)|international/.test(l)) return "yes";
  if (/(^|[^a-z])(us|usa|u\.s\.|united states|canada|uk|united kingdom|europe|eu|emea|latam|australia)([^a-z]|$)/.test(l)) return "no";
  return l.trim() === "" || l === "remote" ? "unknown" : "unknown";
}
const dedupeKey = (j: Job) => (j.company + "|" + j.title).toLowerCase().replace(/[^a-z0-9|]/g, "");

export async function scan(jobs: Record<string, Job>) {
  const p = profile(); const stats: Record<string, any> = {}; const batches: { jobs: Job[]; comp: Src["competition"]; remote: boolean }[] = [];
  const run = async (id: string, comp: Src["competition"], remote: boolean, f: () => Promise<Job[]>) => {
    try { const r = await f(); stats[id] = { count: r.length, ok: true, at: new Date().toISOString() }; batches.push({ jobs: r, comp, remote }); }
    catch (e: any) { stats[id] = { count: 0, ok: false, error: e.message, at: new Date().toISOString() }; }
  };
  const off = disabled();
  await Promise.all([
    ...allSources().filter(s => !off.includes(s.id)).map(s => run(s.id, s.competition, !!s.remote, () => fetchSource(s))),
    ...(["greenhouse", "lever", "ashby"] as const).flatMap(k => (p.companies?.[k] ?? []).map((slug: string) => run(`${k}/${slug}`, "medium", false, () => (ats as any)[k](slug)))),
    ...(p.international?.boards ?? []).map((u: string) => run(`page/${u}`, "low", false, () => intl.pageReader(u))),
    run("careers-pages", "low", false, () => scanCompanies()),
  ]);
  const seen = new Set(Object.values(jobs).map(dedupeKey)); let n = 0, dropLang = 0, dropArr = 0;
  for (const b of batches) for (let j of b.jobs) {
    j.competition = b.comp;
    if (jobs[j.id] || seen.has(dedupeKey(j))) continue;
    if (isForeignText(j.title + j.description)) { try { j = await normalizeIntl(j); } catch { continue; } if (!languageOk(j)) { dropLang++; continue; } }
    if (!prefilter(j, p)) continue;
    const hint = locationHint(j.location);
    if (!j.langRequired && (b.remote || j.country || (j.location && !/india/i.test(j.location)))) { // overseas / remote: decide eligibility
      if (hint === "yes" && b.remote) j.remoteFromIndia = true;
      else if (hint === "no") { dropArr++; continue; }
      else { try { j = await normalizeIntl(j); } catch { continue; } if (!languageOk(j)) { dropLang++; continue; } }
    }
    if ((j.country || j.langRequired) && !arrangementOk(j)) { dropArr++; continue; }
    j.competition = b.comp; jobs[j.id] = j; seen.add(dedupeKey(j)); n++;
  }
  fs.mkdirSync("data", { recursive: true }); fs.writeFileSync("data/source-stats.json", JSON.stringify(stats, null, 1));
  console.log(Object.entries(stats).map(([k, v]: any) => `${v.ok ? "ok " : "ERR"} ${k}: ${v.ok ? v.count : v.error}`).join("\n"));
  console.log(`${dropLang} dropped (local language), ${dropArr} dropped (not remote-from-India / no visa+relocation). ${n} new relevant jobs.`);
}
