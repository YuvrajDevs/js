import { NextResponse } from "next/server"; import fs from "node:fs"; import path from "node:path"; import YAML from "yaml"; import Anthropic from "@anthropic-ai/sdk"; import { ROOT } from "@/lib/server";
export async function POST(req: Request) { // build a full project spec around chosen keywords
  const { terms, quotes } = await req.json();
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Set ANTHROPIC_API_KEY (web/.env.local)." }, { status: 400 });
  if (!terms?.length) return NextResponse.json({ error: "Pick at least one keyword." }, { status: 400 });
  const pf = path.join(ROOT, "profile/profile.yml"); const profile = fs.existsSync(pf) ? YAML.parse(fs.readFileSync(pf, "utf8")) : {};
  const r = await new Anthropic().messages.create({ model: process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5", max_tokens: 3000, messages: [{ role: "user", content:
`Design ONE portfolio project for a junior AI-native builder that demonstrably covers every keyword below, as real employers phrase them (quotes given). It must be genuinely useful (not a tutorial clone), shippable in about 1-2 weeks with Claude/AI-assisted coding, deployable with a live URL.
Reply ONLY JSON: {"title":"","pitch":"2 sentences","whoItsFor":"","features":["mvp features"],"architecture":["components and data flow"],"stack":[""],"keywordMap":[{"keyword":"","howCovered":""}],"milestones":["day-by-day plan"],"evals":"how to measure it works (numbers to report)","demo":"60s demo script","readmeOutline":["sections"],"resumeBullets":["2-3 bullets with placeholder metrics like [N users]"],"stretch":["optional extras"]}
KEYWORDS: ${JSON.stringify(terms)}\nEMPLOYER QUOTES: ${JSON.stringify((quotes ?? []).slice(0, 12))}\nCANDIDATE: ${JSON.stringify({ skills: profile.skills, projects: profile.projects })}` }] });
  try { return NextResponse.json({ project: JSON.parse(r.content.map((b: any) => b.text ?? "").join("").match(/\{[\s\S]*\}/)![0]) }); } catch { return NextResponse.json({ error: "Could not parse model output. Try again." }, { status: 502 }); }
}
