// Where AI-native startups actually post: HN "Who is hiring" and RemoteOK.
import type { Job } from "../types.js";
const get = async (u: string) => { const r = await fetch(u); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json() as Promise<any>; };
const strip = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();

export async function hnWhoIsHiring(): Promise<Job[]> {
  const s = await get("https://hn.algolia.com/api/v1/search_by_date?query=%22Ask%20HN%3A%20Who%20is%20hiring%22&tags=story,author_whoishiring&hitsPerPage=1");
  const id = s.hits[0]?.objectID; if (!id) return [];
  const t = await get(`https://hn.algolia.com/api/v1/items/${id}`);
  return t.children.filter((c: any) => c.text).map((c: any): Job => {
    const text = strip(c.text);
    return { id: `hn:${c.id}`, source: "hn", company: text.split("|")[0].slice(0, 60), title: text.slice(0, 120), location: "", url: `https://news.ycombinator.com/item?id=${c.id}`, description: text, status: "new" };
  });
}
export async function remoteok(): Promise<Job[]> {
  const d = await get("https://remoteok.com/api");
  return d.slice(1).map((j: any): Job => ({ id: `rok:${j.id}`, source: "remoteok", company: j.company, title: j.position, location: j.location ?? "Remote", url: j.url, description: strip(j.description), postedAt: j.date, status: "new" }));
}
