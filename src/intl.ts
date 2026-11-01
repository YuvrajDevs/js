import type { Job } from "./types.js"; import { client, MODEL } from "./rank.js";
const CJK = /[぀-ヿ㐀-鿿가-힯]/;
export const isForeignText = (t: string) => CJK.test(t.slice(0, 600)) || /\b(wir suchen|Stelle|Mitarbeiter|Bewerbung|emploi|recrutons)\b/i.test(t);

// One call: translate to English AND extract the facts we filter on.
export async function normalizeIntl(j: Job): Promise<Job> {
  const r = await client().messages.create({ model: MODEL, max_tokens: 1800, messages: [{ role: "user", content:
`Translate this job posting to English if it is not already (keep it faithful), and extract facts. Reply ONLY JSON:
{"title":"english title","description":"english description, max 3500 chars","country":"country name or Remote","language_required":"none|<language and level, e.g. Japanese N2, German B2>","english_only_workplace":true|false|null,"visa_sponsorship":true|false|null,"relocation_support":true|false|null,"salary_inr_monthly":number|null}
Rules: language_required="none" ONLY if the posting says English is enough or never asks for a local language; if it asks for fluent/business-level local language (including "Japanese N2/N1", "business Japanese", "ネイティブ") it is NOT none. If unclear use "unclear". Convert any stated salary to INR per MONTH (assume 1 JPY=0.55 INR, 1 EUR=95, 1 USD=84, 1 SGD=62, 1 AED=23, 1 GBP=110); null if no salary stated. Use null for unknown, never guess.
POSTING:\n${j.title}\n${j.location}\n${j.description.slice(0, 6000)}` }] });
  const o = JSON.parse(r.content.map((b: any) => b.text ?? "").join("").match(/\{[\s\S]*\}/)![0]);
  return { ...j, title: o.title ?? j.title, description: o.description ?? j.description, country: o.country, lang: "translated", langRequired: o.language_required, visa: o.visa_sponsorship, relocation: o.relocation_support, salaryInrMonthly: o.salary_inr_monthly };
}
// Hard rule: a role that needs the local language is dropped.
export const languageOk = (j: Job) => !j.langRequired || /^(none|unclear)$/i.test(j.langRequired);
