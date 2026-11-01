import type { Job } from "./types.js";
// Priority = fit + remote (remote beats visa) + low competition + freshness + experience fit + non-English employer country first.
const ENGLISH = /^(us|usa|united states|uk|united kingdom|canada|australia|new zealand|ireland|singapore|india|remote|worldwide|anywhere|global|)$/i;
export function priority(j: Job): number {
  let p = j.score ?? 0;
  p += j.remoteFromIndia ? 15 : j.visa && j.relocation ? 5 : 0;
  p += j.competition === "low" ? 10 : j.competition === "high" ? -8 : 0;
  const age = j.postedAt ? (Date.now() - Date.parse(j.postedAt)) / 864e5 : NaN;
  if (!isNaN(age)) p += age < 3 ? 8 : age <= 14 ? 3 : age > 45 ? -8 : 0;
  const yrs = j.req?.yearsRequired ?? j.minYears ?? null; p += yrs == null ? 6 : yrs <= 1 ? 4 : yrs >= 3 ? -15 : 0; // no experience listed is good
  if (j.req?.urgent) p += 4;
  const c = (j.country ?? j.req?.employerCountry ?? "").trim(); if (c && !ENGLISH.test(c)) p += 6; // non-English-speaking employer country first
  return Math.round(p);
}
