import type { Job } from "./types.js";
// Priority = fit score + remote bonus (remote beats visa) + low-competition bonus + freshness.
export function priority(j: Job): number {
  let p = j.score ?? 0;
  p += j.remoteFromIndia ? 15 : j.visa && j.relocation ? 5 : 0;
  p += j.competition === "low" ? 10 : j.competition === "high" ? -8 : 0;
  const age = j.postedAt ? (Date.now() - Date.parse(j.postedAt)) / 864e5 : NaN;
  if (!isNaN(age)) p += age < 3 ? 8 : age <= 14 ? 3 : age > 45 ? -8 : 0;
  return Math.round(p);
}
