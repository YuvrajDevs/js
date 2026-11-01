import type { Job } from "./types.js"; import { client, MODEL } from "./rank.js";
// Structured requirements per listing, cached on the job. Terms are short, lowercase and normalised so they can be counted across listings.
export async function extractReq(j: Job) {
  const r = await client().messages.create({ model: MODEL, max_tokens: 900, messages: [{ role: "user", content:
`Extract what this job asks for. Reply ONLY JSON:
{"must":["hard requirements, 1-4 words each"],"nice":["nice-to-haves"],"tech":["specific tools/languages/frameworks/platforms"],"ai":["AI/LLM concepts and tools, e.g. rag, tool use, agents, evals, prompt engineering, claude api, mcp"],"responsibilities":["what you'd actually do, as short verb phrases e.g. 'ship features end-to-end'"],"signals":["culture/trait signals e.g. ownership, fast iteration, 0 to 1, talk to users, async"],"seniority":"intern|junior|mid|senior|unclear"}
Rules: lowercase, normalise synonyms (nextjs -> next.js, js -> javascript, "large language models" -> llm), max 12 items per list, only things stated in the posting.
JOB: ${j.title} @ ${j.company}\n${j.description.slice(0, 5000)}` }] });
  j.req = JSON.parse(r.content.map((b: any) => b.text ?? "").join("").match(/\{[\s\S]*\}/)![0]);
}
