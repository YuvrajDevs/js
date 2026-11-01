import fs from "node:fs"; import path from "node:path"; import { spawn, type ChildProcess } from "node:child_process";
import type { Job } from "./types";
export const ROOT = path.resolve(process.cwd(), "..");
const JOBS = path.join(ROOT, "data/jobs.json");
export const resumePath = (id: string) => path.join(ROOT, "out", id.replace(/[^\w-]/g, "_") + ".md");
export function readJobs(): { jobs: Job[]; demo: boolean } {
  if (fs.existsSync(JOBS)) return { jobs: Object.values(JSON.parse(fs.readFileSync(JOBS, "utf8"))) as Job[], demo: false };
  return { jobs: JSON.parse(fs.readFileSync(path.join(process.cwd(), "sample-jobs.json"), "utf8")), demo: true };
}
export function patchJob(id: string, patch: Partial<Job>) {
  if (!fs.existsSync(JOBS)) throw new Error("Demo data is read-only. Run a scan first.");
  const all = JSON.parse(fs.readFileSync(JOBS, "utf8")); if (!all[id]) throw new Error("Unknown job");
  Object.assign(all[id], patch); fs.writeFileSync(JOBS, JSON.stringify(all, null, 1));
}
// One engine process at a time (scan / rank); log is polled by the UI.
const g = globalThis as any; g.__run ??= { proc: null as ChildProcess | null, cmd: "", log: "" };
export const runState = () => ({ running: !!g.__run.proc, cmd: g.__run.cmd, log: g.__run.log.slice(-4000) });
export function startRun(cmd: string, args: string[] = []) {
  if (g.__run.proc) throw new Error("Already running " + g.__run.cmd);
  g.__run.cmd = cmd; g.__run.log = "";
  const p = spawn("npx", ["tsx", "src/cli.ts", cmd, ...args], { cwd: ROOT, env: process.env }); g.__run.proc = p;
  const add = (b: Buffer) => { g.__run.log += b.toString(); };
  p.stdout.on("data", add); p.stderr.on("data", add);
  p.on("close", c => { g.__run.log += `\n[exit ${c}]`; g.__run.proc = null; });
}
export function runOnce(cmd: string, args: string[]): Promise<string> {
  return new Promise((res, rej) => { const p = spawn("npx", ["tsx", "src/cli.ts", cmd, ...args], { cwd: ROOT, env: process.env }); let o = "";
    p.stdout.on("data", b => o += b); p.stderr.on("data", b => o += b); p.on("close", c => c === 0 ? res(o) : rej(new Error(o.slice(-600) || "failed"))); });
}
export function detach(cmd: string, args: string[]) { spawn("npx", ["tsx", "src/cli.ts", cmd, ...args], { cwd: ROOT, env: process.env, detached: true, stdio: "ignore" }).unref(); }
