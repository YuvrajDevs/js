// Extra boards + generic RSS. Shapes are written from public docs/memory and are UNVERIFIED from the build sandbox (no outbound web):
// every fetcher is defensive, and a failure only marks that source as failed in the Sources page.
import type { Job } from "../types.js";
const UA = { "user-agent": "Mozilla/5.0 js-jobseek" };
const j = async (u: string) => { const r = await fetch(u, { headers: UA }); if (!r.ok) throw new Error(`${r.status}`); return r.json() as Promise<any>; };
const strip = (h = "") => String(h).replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
const iso = (d: any) => { const t = typeof d === "number" ? (d < 1e12 ? d * 1000 : d) : Date.parse(d); return isNaN(t) ? undefined : new Date(t).toISOString(); };
const mk = (o: Omit<Job, "status">): Job => ({ ...o, status: "new" });

export const remotive = async () => (await j("https://remotive.com/api/remote-jobs?category=software-dev")).jobs.map((x: any) => mk({ id: `remotive:${x.id}`, source: "remotive", company: x.company_name, title: x.title, location: x.candidate_required_location ?? "Remote", url: x.url, description: strip(x.description), postedAt: iso(x.publication_date) }));
export const jobicy = async () => (await j("https://jobicy.com/api/v2/remote-jobs?count=50&tag=developer")).jobs.map((x: any) => mk({ id: `jobicy:${x.id}`, source: "jobicy", company: x.companyName, title: x.jobTitle, location: x.jobGeo ?? "Remote", url: x.url, description: strip(x.jobDescription ?? x.jobExcerpt), postedAt: iso(x.pubDate) }));
export const workingnomads = async () => (await j("https://www.workingnomads.com/api/exposed_jobs/")).map((x: any) => mk({ id: `wn:${x.url}`, source: "workingnomads", company: x.company_name, title: x.title, location: x.location ?? "Remote", url: x.url, description: strip(x.description), postedAt: iso(x.pub_date) }));
export const himalayas = async () => (await j("https://himalayas.app/jobs/api?limit=100")).jobs.map((x: any) => mk({ id: `him:${x.guid ?? x.applicationLink ?? x.title + x.companyName}`, source: "himalayas", company: x.companyName, title: x.title, location: (x.locationRestrictions?.length ? x.locationRestrictions.join(", ") : "Worldwide"), url: x.applicationLink ?? x.guid, description: strip(x.description ?? x.excerpt), postedAt: iso(x.pubDate) }));

export async function hnJobs(): Promise<Job[]> {
  const ids: number[] = (await j("https://hacker-news.firebaseio.com/v0/jobstories.json")).slice(0, 60);
  const items = await Promise.all(ids.map(id => j(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).catch(() => null)));
  return items.filter(Boolean).map((x: any) => mk({ id: `hnj:${x.id}`, source: "hn-jobs", company: String(x.title).split(/ is hiring| \(/i)[0], title: x.title, location: "", url: x.url ?? `https://news.ycombinator.com/item?id=${x.id}`, description: strip(x.title + " " + (x.text ?? "")), postedAt: iso(x.time) }));
}
export async function reddit(url: string): Promise<Job[]> {
  const d = await j(url);
  return d.data.children.map((c: any) => c.data).filter((x: any) => /\[hiring\]/i.test(x.title)).map((x: any) => mk({ id: `rd:${x.id}`, source: "reddit", company: x.author, title: x.title, location: "Remote", url: "https://reddit.com" + x.permalink, description: strip(x.selftext), postedAt: iso(x.created_utc) }));
}
// Generic RSS/Atom: works for any custom feed the user adds (company blogs, boards, newsletters).
export async function rss(url: string, id: string): Promise<Job[]> {
  const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(`${r.status}`); const x = await r.text();
  const tag = (b: string, t: string) => b.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i"))?.[1] ?? "";
  return [...x.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)].map(m => m[0]).map((b, i) => {
    const title = strip(tag(b, "title")); const link = strip(tag(b, "link")) || b.match(/<link[^>]+href="([^"]+)"/i)?.[1] || "";
    const [co, t] = title.includes(": ") ? [title.split(": ")[0], title.split(": ").slice(1).join(": ")] : [new URL(url).hostname, title];
    return mk({ id: `rss:${id}:${link || i}`, source: id, company: co, title: t, location: strip(tag(b, "region")) || "Remote", url: link, description: strip(tag(b, "description") || tag(b, "content:encoded") || tag(b, "summary")), postedAt: iso(strip(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated"))) });
  });
}
