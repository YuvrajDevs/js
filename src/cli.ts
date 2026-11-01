import { load, save } from "./store.js"; import { profile } from "./profile.js";
import * as ats from "./sources/ats.js"; import * as com from "./sources/community.js";
import { prefilter, scoreJob } from "./rank.js"; import * as intl from "./sources/intl.js"; import { normalizeIntl, languageOk, isForeignText, arrangementOk } from "./intl.js"; import { tailor } from "./tailor.js"; import { prefill } from "./apply.js";
import { companiesFromDirectory, loadCos, saveCos, scanCompanies } from "./discover.js";
import fs from "node:fs";
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
      safe("careers-pages", () => scanCompanies()),
      ...(p.international?.use_arbeitnow ? [safe("arbeitnow", intl.arbeitnow)] : []),
      ...(p.international?.boards ?? []).map((u: string) => safe(`page/${u}`, () => intl.pageReader(u))),
    ])).flat() ];
  let n = 0, drop = 0, drop2 = 0;
  for (let j of all) {
    if (jobs[j.id]) continue;
    const isIntl = j.country || j.source.includes(".") || j.source === "arbeitnow" || (j.location && !/india|remote|anywhere|worldwide/i.test(j.location));
    if (isIntl || isForeignText(j.title + j.description)) { // translate + extract language/visa/salary
      try { j = await normalizeIntl(j); } catch (e: any) { console.warn("normalize failed", j.id); continue; }
      if (!languageOk(j)) { drop++; continue; } // needs local language -> skip
      if (!arrangementOk(j)) { drop2++; continue; } // not remote-from-India and no visa+relocation -> skip
    }
    if (prefilter(j, p)) { jobs[j.id] = j; n++; }
  }
  console.log(`${drop} dropped (local language required), ${drop2} dropped (not remote-from-India and no visa+relocation)`);
  save(jobs); console.log(`${n} new relevant jobs`);
} else if (cmd === "discover" && arg) { // npm run discover -- <directory-url | file-with-domains.txt>
  const cos = loadCos();
  const doms = fs.existsSync(arg) ? fs.readFileSync(arg, "utf8").split(/\s+/).filter(Boolean) : await companiesFromDirectory(arg);
  let n = 0; for (const d of doms) { const dom = d.replace(/^https?:\/\//, "").replace(/\/.*/, "").replace(/^www\./, ""); if (dom && !cos[dom]) { cos[dom] = { domain: dom }; n++; } }
  saveCos(cos); console.log(`${n} new companies (${Object.keys(cos).length} total). Run: npm run scan`);
} else if (cmd === "rank") {
  for (const j of Object.values(jobs).filter(j => j.status === "new")) {
    try { Object.assign(j, await scoreJob(j), { status: "ranked" }); console.log(j.score, j.company, "-", j.title); } catch (e: any) { console.warn(e.message); }
  } save(jobs);
} else if (cmd === "list") {
  Object.values(jobs).filter(j => j.score != null).sort((a, b) => b.score! - a.score!).slice(0, 30)
    .forEach(j => console.log(`${j.score}\t${j.id}\t${j.company} | ${j.title}${j.country ? " [" + j.country + "]" : ""}${j.salaryInrMonthly ? " ~₹" + Math.round(j.salaryInrMonthly / 1000) + "k/mo" : ""}${j.remoteFromIndia ? " REMOTE-IN" : ""}${j.visa ? " VISA" : ""}${j.relocation ? " RELO" : ""}\n\t${j.reason}\n\t${j.url}`));
} else if (cmd === "tailor" && arg) {
  const j = jobs[arg]; if (!j) throw new Error("unknown id"); await tailor(j); j.status = "tailored"; save(jobs); console.log(`written to out/`);
} else if (cmd === "apply" && arg) {
  const j = jobs[arg]; if (!j) throw new Error("unknown id"); await prefill(j); j.status = "applied"; save(jobs);
} else console.log("usage: discover <url|file> | scan | rank | list | tailor <id> | apply <id>");
