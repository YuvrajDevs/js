import { load, save } from "./store.js"; import { profile } from "./profile.js";
import * as ats from "./sources/ats.js"; import * as com from "./sources/community.js";
import { prefilter, scoreJob } from "./rank.js"; import * as intl from "./sources/intl.js"; import { normalizeIntl, languageOk, isForeignText, arrangementOk } from "./intl.js"; import { tailor } from "./tailor.js"; import { prefill } from "./apply.js";
import { companiesFromDirectory, loadCos, saveCos, scanCompanies } from "./discover.js";
import fs from "node:fs"; import { extractReq } from "./extract.js"; import { scan, allSources } from "./scan.js"; import { priority } from "./priority.js";
const [cmd, arg] = process.argv.slice(2);
const jobs = load();
const safe = async (n: string, f: () => Promise<any[]>) => { try { const r = await f(); console.log(`${n}: ${r.length}`); return r; } catch (e: any) { console.warn(`${n} failed: ${e.message}`); return []; } };

if (cmd === "scan") {
  await scan(jobs); save(jobs);
} else if (cmd === "discover" && arg) { // npm run discover -- <directory-url | file-with-domains.txt>
  const cos = loadCos();
  const doms = fs.existsSync(arg) ? fs.readFileSync(arg, "utf8").split(/\s+/).filter(Boolean) : await companiesFromDirectory(arg);
  let n = 0; for (const d of doms) { const dom = d.replace(/^https?:\/\//, "").replace(/\/.*/, "").replace(/^www\./, ""); if (dom && !cos[dom]) { cos[dom] = { domain: dom }; n++; } }
  saveCos(cos); console.log(`${n} new companies (${Object.keys(cos).length} total). Run: npm run scan`);
} else if (cmd === "sources") {
  allSources().forEach(x => console.log(`${x.competition.padEnd(6)} ${x.id.padEnd(16)} ${x.name}${x.custom ? " (custom)" : ""}`));
} else if (cmd === "rank") {
  for (const j of Object.values(jobs).filter(j => j.status === "new")) {
    try { Object.assign(j, await scoreJob(j), { status: "ranked" }); console.log(j.score, j.company, "-", j.title); } catch (e: any) { console.warn(e.message); }
  } save(jobs);
} else if (cmd === "extract") { // structured requirements for every ranked job that has none yet (score >= 40)
  const todo = Object.values(jobs).filter(j => !j.req && (j.score ?? 0) >= 40);
  for (let i = 0; i < todo.length; i += 4) { await Promise.all(todo.slice(i, i + 4).map(j => extractReq(j).then(() => console.log("req:", j.company, "-", j.title)).catch(e => console.warn(j.id, e.message)))); save(jobs); }
  console.log(`${todo.length} listings analysed`);
} else if (cmd === "list") {
  Object.values(jobs).filter(j => j.score != null).sort((a, b) => priority(b) - priority(a)).slice(0, 30)
    .forEach(j => console.log(`${priority(j)}(fit ${j.score})\t${j.id}\t${j.company} | ${j.title}${j.country ? " [" + j.country + "]" : ""}${j.salaryInrMonthly ? " ~₹" + Math.round(j.salaryInrMonthly / 1000) + "k/mo" : ""}${j.remoteFromIndia ? " REMOTE-IN" : ""}${j.visa ? " VISA" : ""}${j.competition === "low" ? " LOW-COMP" : ""}${j.relocation ? " RELO" : ""}\n\t${j.reason}\n\t${j.url}`));
} else if (cmd === "tailor" && arg) {
  const j = jobs[arg]; if (!j) throw new Error("unknown id"); await tailor(j); j.status = "tailored"; save(jobs); console.log(`written to out/`);
} else if (cmd === "apply" && arg) {
  const j = jobs[arg]; if (!j) throw new Error("unknown id"); await prefill(j); j.status = "applied"; save(jobs);
} else console.log("usage: discover <url|file> | scan | rank | list | tailor <id> | apply <id>");
