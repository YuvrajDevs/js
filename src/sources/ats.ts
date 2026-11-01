// Public, no-auth JSON endpoints of the big ATS vendors. Legit and stable; no HTML scraping.
import type { Job } from "../types.js";
const get = async (u: string) => { const r = await fetch(u); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json() as Promise<any>; };
const strip = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const mk = (o: Omit<Job, "status">): Job => ({ ...o, status: "new" });

export async function greenhouse(slug: string): Promise<Job[]> {
  const d = await get(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
  return d.jobs.map((j: any) => mk({ id: `gh:${slug}:${j.id}`, source: "greenhouse", company: slug, title: j.title, location: j.location?.name ?? "", url: j.absolute_url, description: strip(j.content), postedAt: j.updated_at }));
}
export async function lever(slug: string): Promise<Job[]> {
  const d = await get(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  return d.map((j: any) => mk({ id: `lv:${slug}:${j.id}`, source: "lever", company: slug, title: j.text, location: j.categories?.location ?? "", url: j.hostedUrl, description: j.descriptionPlain ?? "", postedAt: new Date(j.createdAt).toISOString() }));
}
export async function ashby(slug: string): Promise<Job[]> {
  const d = await get(`https://api.ashbyhq.com/posting-api/job-board/${slug}`);
  return d.jobs.map((j: any) => mk({ id: `ab:${slug}:${j.id}`, source: "ashby", company: slug, title: j.title, location: j.location ?? "", url: j.jobUrl, description: j.descriptionPlain ?? "", postedAt: j.publishedAt }));
}
