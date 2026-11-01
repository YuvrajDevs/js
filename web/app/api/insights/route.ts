import { NextResponse } from "next/server"; import fs from "node:fs"; import path from "node:path"; import YAML from "yaml"; import Anthropic from "@anthropic-ai/sdk";
import { ROOT, readJobs } from "@/lib/server"; import type { Job } from "@/lib/types";
const CACHE = path.join(ROOT, "data/insights.json");
export const dynamic = "force-dynamic";
const STOP = new Set("the and for with you our are will your this that from have has not but all can who they their about into more other work team role also such including able etc per its was were been being any using use used new one two out job join well must may over within across through what when where which while than then them these those just only very make help build building we us a an of to in on at by as is it be or if so do how why get".split(" "));
const GROUP_LABEL: Record<string, string> = { tech: "Tech & tools", ai: "AI", must: "Must-have", nice: "Nice-to-have", responsibilities: "What you'll do", signals: "Traits & culture", mined: "Keywords" };

function pool(scope: string) {
  const { jobs, demo } = readJobs();
  return { demo, jobs: jobs.filter(j => (j.score ?? 0) >= 40 || demo).filter(j => scope === "remote" ? j.remoteFromIndia : scope === "low" ? j.competition === "low" : scope === "top" ? (j.score ?? 0) >= 75 : true) };
}
const sentence = (text: string, term: string) => { const t = text.replace(/\s+/g, " "); const i = t.toLowerCase().indexOf(term.toLowerCase()); if (i < 0) return null; const a = Math.max(t.lastIndexOf(". ", i) + 2, i - 110), b = Math.min((t.indexOf(". ", i) + 1) || t.length, i + 160); return t.slice(Math.max(a, 0), b).trim(); };
function mine(jobs: Job[]) { // no-LLM fallback: document frequency of words/bigrams
  const df = new Map<string, Set<string>>();
  for (const j of jobs) { const w = (j.title + " " + j.description).toLowerCase().replace(/[^a-z0-9.+#\s-]/g, " ").split(/\s+/).filter(Boolean); const seen = new Set<string>();
    w.forEach((x, i) => { const ok = (s: string) => s.length >= 3 && !STOP.has(s) && !/^\d+$/.test(s); if (ok(x)) seen.add(x); if (i < w.length - 1 && ok(x) && ok(w[i + 1])) seen.add(x + " " + w[i + 1]); });
    seen.forEach(k => { if (!df.has(k)) df.set(k, new Set()); df.get(k)!.add(j.id); }); }
  return [...df].filter(([, v]) => v.size >= 2).sort((a, b) => b[1].size - a[1].size || b[0].length - a[0].length).slice(0, 60).map(([term, v]) => ({ term, group: "mined", ids: [...v] }));
}
function stats(scope: string) {
  const { jobs, demo } = pool(scope); const withReq = jobs.filter(j => j.req); const byTerm = new Map<string, { term: string; group: string; ids: Set<string> }>();
  for (const j of withReq) for (const g of ["tech", "ai", "must", "nice", "responsibilities", "signals"] as const) for (const t of (j.req as any)[g] ?? []) { const k = g + "|" + t; if (!byTerm.has(k)) byTerm.set(k, { term: t, group: g, ids: new Set() }); byTerm.get(k)!.ids.add(j.id); }
  const raw = withReq.length ? [...byTerm.values()].map(v => ({ term: v.term, group: v.group, ids: [...v.ids] })) : mine(jobs);
  const merged = new Map<string, { term: string; group: string; ids: string[] }>(); // "All" view: one row per term, jobs de-duplicated across groups
  for (const k of raw) { const m = merged.get(k.term); if (!m) merged.set(k.term, { term: k.term, group: k.group, ids: [...k.ids] }); else m.ids = [...new Set([...m.ids, ...k.ids])]; }
  const enrich = (k: { term: string; group: string; ids: string[] }) => {
    const js = k.ids.map(id => jobs.find(j => j.id === id)!).filter(Boolean);
    return { term: k.term, group: k.group, count: js.length, pct: Math.round((js.length / Math.max(1, jobs.length)) * 100), jobs: js.slice(0, 8).map(j => ({ id: j.id, title: j.title, company: j.company, url: j.url })), quotes: js.map(j => sentence(j.description, k.term)).filter(Boolean).slice(0, 3) };
  };
  const byCount = (a: any, b: any) => b.ids.length - a.ids.length;
  const kws = [...merged.values()].sort(byCount).slice(0, 200).map(enrich);          // All view
  const grouped = raw.sort(byCount).slice(0, 400).map(enrich);                          // per-group views
  return { jobsAnalysed: jobs.length, withReq: withReq.length, mode: withReq.length ? "extracted" : "mined", demo, groups: GROUP_LABEL, keywords: kws, grouped };
}
export function GET(req: Request) { const scope = new URL(req.url).searchParams.get("scope") ?? "all"; return NextResponse.json({ ...stats(scope), ai: fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : null }); }
export async function POST(req: Request) { // AI gap analysis + project ideas
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Set ANTHROPIC_API_KEY (web/.env.local) to generate AI insights." }, { status: 400 });
  const scope = (await req.json().catch(() => ({}))).scope ?? "all"; const s = stats(scope); if (!s.jobsAnalysed) return NextResponse.json({ error: "No jobs yet. Run a scan + rank first." }, { status: 400 });
  const pf = path.join(ROOT, "profile/profile.yml"); const profile = fs.existsSync(pf) ? YAML.parse(fs.readFileSync(pf, "utf8")) : {};
  const r = await new Anthropic().messages.create({ model: process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5", max_tokens: 3000, messages: [{ role: "user", content:
`Career strategist. From the keyword demand below (counted across ${s.jobsAnalysed} listings), compare to the candidate (0-2 yrs, AI-native builder) and propose portfolio projects that most raise interview odds.
Reply ONLY JSON: {"lookingFor":["5-8 patterns employers want, citing counts"],"gaps":["missing skills/proof"],"strengths":["matches"],"projects":[{"title":"","pitch":"one sentence","stack":[""],"keywords":["demand keywords it covers"],"proves":"","weekPlan":["..."],"demandedBy":""}]} with 4 projects ordered by impact, each shippable in 1-2 weeks with Claude/AI tools.
CANDIDATE: ${JSON.stringify({ skills: profile.skills, projects: profile.projects, experience: profile.experience })}
KEYWORDS: ${JSON.stringify(s.keywords.slice(0, 60).map(k => [k.term, k.group, k.count]))}` }] });
  try { const o = JSON.parse(r.content.map((b: any) => b.text ?? "").join("").match(/\{[\s\S]*\}/)![0]); fs.mkdirSync(path.dirname(CACHE), { recursive: true }); fs.writeFileSync(CACHE, JSON.stringify(o)); return NextResponse.json({ ai: o }); }
  catch { return NextResponse.json({ error: "Could not parse model output. Try again." }, { status: 502 }); }
}
