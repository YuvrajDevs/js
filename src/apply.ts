// Human-in-the-loop: opens the application, prefills what it can, then STOPS. You review and click submit.
import { chromium } from "playwright"; import type { Job } from "./types.js"; import { profile } from "./profile.js";
export async function prefill(j: Job, resumePdf?: string) {
  const p = profile();
  const b = await chromium.launch({ headless: false }); const page = await b.newPage();
  await page.goto(j.url);
  const fill = async (re: RegExp, v: string) => { const l = page.getByLabel(re).first(); if (await l.count()) await l.fill(v).catch(() => {}); };
  await fill(/first name/i, p.name.split(" ")[0]); await fill(/last name/i, p.name.split(" ").slice(1).join(" "));
  await fill(/^(full )?name/i, p.name); await fill(/email/i, p.email); await fill(/phone/i, p.phone);
  await fill(/linkedin/i, p.links.linkedin); await fill(/github/i, p.links.github); await fill(/website|portfolio/i, p.links.portfolio);
  if (resumePdf) await page.locator('input[type=file]').first().setInputFiles(resumePdf).catch(() => {});
  console.log("Prefilled. Review the form in the browser, submit manually, then close the window.");
  await new Promise(r => b.on("disconnected", () => r(null)));
}
