import { load, save } from "./store.js"; import { profile } from "./profile.js";
import * as ats from "./sources/ats.js"; import * as com from "./sources/community.js";
import { prefilter, scoreJob } from "./rank.js"; import { tailor } from "./tailor.js"; import { prefill } from "./apply.js";
const [cmd, arg] = process.argv.slice(2);
const jobs = load();
const safe = async (n: string, f: () => Promise<any[]>) => { try { const r = await f(); console.log(`${n}: ${r.length}`); return r; } catch (e: any) { console.warn(`${n} failed: ${e.message}`); return []; } };

if (cmd === "scan") {
  const p = profile(); const all = [
    ...(await Promise.all([
      ...(p.companies.greenhouse ?? []).map((s: string) => safe(`gh/${s}`, () => ats.greenhouse(s))),
      ...(p.companies.lever ?? []).map((s: string) => safe(`lever/${s}`, () => ats.lever(s))),
      ...(p.companies.ashby ?? []).map((s: string) => safe(`ashby/${s}`, () => ats.ashby(s))),
      safe("hn", com.hnWhoIsHiring), safe("remoteok", com.remoteok),
    ])).flat() ];
  let n = 0; for (const j of all) if (!jobs[j.id] && prefilter(j, p)) { jobs[j.id] = j; n++; }
  save(jobs); console.log(`${n} new relevant jobs`);
} else if (cmd === "rank") {
  for (const j of Object.values(jobs).filter(j => j.status === "new")) {
    try { Object.assign(j, await scoreJob(j), { status: "ranked" }); console.log(j.score, j.company, "-", j.title); } catch (e: any) { console.warn(e.message); }
  } save(jobs);
} else if (cmd === "list") {
  Object.values(jobs).filter(j => j.score != null).sort((a, b) => b.score! - a.score!).slice(0, 30)
    .forEach(j => console.log(`${j.score}\t${j.id}\t${j.company} | ${j.title}\n\t${j.reason}\n\t${j.url}`));
} else if (cmd === "tailor" && arg) {
  const j = jobs[arg]; if (!j) throw new Error("unknown id"); await tailor(j); j.status = "tailored"; save(jobs); console.log(`written to out/`);
} else if (cmd === "apply" && arg) {
  const j = jobs[arg]; if (!j) throw new Error("unknown id"); await prefill(j); j.status = "applied"; save(jobs);
} else console.log("usage: scan | rank | list | tailor <id> | apply <id>");
