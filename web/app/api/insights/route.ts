import { NextResponse } from "next/server"; import fs from "node:fs"; import path from "node:path"; import YAML from "yaml"; import Anthropic from "@anthropic-ai/sdk";
import { ROOT, readJobs } from "@/lib/server";
const CACHE = path.join(ROOT, "data/insights.json");
export const dynamic = "force-dynamic";
const SKILLS = ["typescript","javascript","react","next.js","node","python","claude","llm","openai","rag","agents","prompt","mcp","postgres","supabase","vercel","aws","docker","tailwind","stripe","figma","sql","graphql","fastapi","langchain","evals","vector","cursor","product","startup","ownership","0 to 1","end-to-end","remote","japanese","english"];
function freq() {
  const { jobs, demo } = readJobs(); const pool = jobs.filter(j => (j.score ?? 0) >= 50 || demo).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 80);
  const counts = SKILLS.map(s => ({ name: s, count: pool.filter(j => new RegExp("(^|[^a-z])" + s.replace(/[.+]/g, "\\$&") + "([^a-z]|$)", "i").test(j.title + " " + j.description)).length })).filter(x => x.count).sort((a, b) => b.count - a.count).slice(0, 14);
  return { pool, counts };
}
export function GET() { const { pool, counts } = freq(); const cached = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : null; return NextResponse.json({ jobsAnalysed: pool.length, counts, ai: cached }); }
export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Set ANTHROPIC_API_KEY (web/.env.local) to generate AI insights." }, { status: 400 });
  const { pool, counts } = freq(); if (!pool.length) return NextResponse.json({ error: "No jobs yet. Run a scan + rank first." }, { status: 400 });
  const pf = path.join(ROOT, "profile/profile.yml"); const profile = fs.existsSync(pf) ? YAML.parse(fs.readFileSync(pf, "utf8")) : {};
  const digest = pool.slice(0, 40).map(j => `- ${j.title} @ ${j.company}: ${j.description.slice(0, 600)}`).join("\n");
  const r = await new Anthropic().messages.create({ model: process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5", max_tokens: 3000, messages: [{ role: "user", content:
`You are a career strategist. From these job listings, find what employers actually want from an AI-native builder with 0-2 years' experience, compare to the candidate, and propose portfolio projects that would most increase interview odds.
Reply ONLY JSON: {"lookingFor":["5-8 concise patterns employers want, citing frequency"],"gaps":["skills/proof the candidate lacks vs listings"],"strengths":["what they already have that matches"],"projects":[{"title":"","pitch":"one sentence","stack":["..."],"proves":"what hiring managers learn from it","weekPlan":["day 1-2 ...","..."],"demandedBy":"how many/which listings"}]} with 4 projects, ordered by impact, each shippable in 1-2 weeks using Claude/AI tools.
CANDIDATE: ${JSON.stringify({ skills: profile.skills, projects: profile.projects, experience: profile.experience })}
SKILL FREQUENCY: ${JSON.stringify(counts)}
LISTINGS:\n${digest}` }] });
  try { const o = JSON.parse(r.content.map((b: any) => b.text ?? "").join("").match(/\{[\s\S]*\}/)![0]); fs.mkdirSync(path.dirname(CACHE), { recursive: true }); fs.writeFileSync(CACHE, JSON.stringify(o)); return NextResponse.json({ ai: o }); }
  catch { return NextResponse.json({ error: "Could not parse model output. Try again." }, { status: 502 }); }
}
