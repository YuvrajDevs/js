import fs from "node:fs"; import type { Job } from "./types.js"; import { profile } from "./profile.js"; import { client, MODEL } from "./rank.js";
export async function tailor(j: Job): Promise<string> {
  const p = profile();
  const r = await client().messages.create({ model: MODEL, max_tokens: 2500, messages: [{ role: "user", content:
`Produce a one-page resume in Markdown tailored to this job, then after a line "---COVER---" a 90-word cover note.
HARD RULES: use ONLY facts in the profile. Never invent employers, metrics, skills or dates. You may reorder, select, and reword to mirror the job's language. Lead with the projects/experience most relevant to shipping fast with AI. Mirror keywords from the job honestly.
PROFILE: ${JSON.stringify(p)}
JOB: ${j.title} @ ${j.company}\n${j.description.slice(0, 5000)}` }] });
  const out = r.content.map((b: any) => b.text ?? "").join("");
  fs.mkdirSync("out", { recursive: true });
  fs.writeFileSync(`out/${j.id.replace(/[^\w-]/g, "_")}.md`, out);
  return out;
}
