import fs from "node:fs"; import type { Job } from "./types.js";
const F = "data/jobs.json";
export const load = (): Record<string, Job> => fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, "utf8")) : {};
export const save = (j: Record<string, Job>) => { fs.mkdirSync("data", { recursive: true }); fs.writeFileSync(F, JSON.stringify(j, null, 1)); };
