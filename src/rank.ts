import Anthropic from "@anthropic-ai/sdk"; import type { Job } from "./types.js"; import { profile } from "./profile.js";
export const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5";
export const client = () => new Anthropic();

// Minimum years of experience stated in the text (null if none). Used to drop 3+ year roles before spending tokens.
export function minYears(t: string): number | null {
  const m = [...t.toLowerCase().matchAll(/(\d{1,2})\s*(?:\+|-\s*\d{1,2}|to\s*\d{1,2})?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:\w+\s+){0,3}?experience/g)].map(x => +x[1]);
  return m.length ? Math.min(...m) : null;
}
// Cheap keyword gate first so we only spend tokens on plausible jobs.
export function prefilter(j: Job, p: any): boolean {
  const t = `${j.title} ${j.description}`.toLowerCase();
  const yrs = minYears(t); if (yrs != null && yrs > (p.filters?.max_years ?? 2)) return false;
  if (p.targets.avoid.some((a: string) => t.includes(a.toLowerCase()))) return false;
  const titleHit = p.targets.titles.some((x: string) => j.title.toLowerCase().includes(x.toLowerCase()));
  const signals = p.targets.must_signals.filter((s: string) => t.includes(s.toLowerCase())).length;
  return titleHit || signals >= 3;
}
export async function scoreJob(j: Job): Promise<{ score: number; reason: string }> {
  const p = profile();
  const r = await client().messages.create({ model: MODEL, max_tokens: 300, messages: [{ role: "user", content:
`Score 0-100 how well this job fits the candidate. Candidate wants AI-native builder roles (founding/product/AI engineer, ship-fast generalist who builds end-to-end with AI tools), has 0-2 years experience, needs >= ${p.targets.min_ctc_lpa} LPA. Overseas roles are a PLUS if English-only, with visa/relocation, and pay well after cost of living; reward them. Salary hint (INR/month): ${j.salaryInrMonthly ?? "unknown"}, visa sponsorship: ${j.visa ?? "unknown"}, relocation: ${j.relocation ?? "unknown"}. Penalize seniority mismatch, low pay, non-builder roles. Reply ONLY JSON {"score":n,"reason":"one sentence"}.
CANDIDATE: ${JSON.stringify({ skills: p.skills, projects: p.projects, summary: p.summary })}
JOB: ${j.title} @ ${j.company} (${j.location})\n${j.description.slice(0, 4000)}` }] });
  const txt = r.content.map((b: any) => b.text ?? "").join("");
  return JSON.parse(txt.match(/\{[\s\S]*\}/)![0]);
}
