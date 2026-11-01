"use client"; import { useCallback, useEffect, useMemo, useState } from "react"; import type { Job } from "@/lib/types"; import { priority } from "@/lib/priority"; import JobDrawer, { tagsOf } from "@/components/JobDrawer";
export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]); const [demo, setDemo] = useState(false); const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState(""); const [remote, setRemote] = useState(false); const [visa, setVisa] = useState(false); const [low, setLow] = useState(false); const [min, setMin] = useState(0); const [run, setRun] = useState<{ running: boolean; cmd: string; log: string }>({ running: false, cmd: "", log: "" }); const [err, setErr] = useState("");
  const load = useCallback(() => fetch("/api/jobs").then(r => r.json()).then(d => { setJobs(d.jobs); setDemo(d.demo); }), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!run.running) return; const t = setInterval(async () => { const s = await (await fetch("/api/run")).json(); setRun(s); if (!s.running) load(); }, 1500); return () => clearInterval(t); }, [run.running, load]);
  const start = async (cmd: string) => { setErr(""); const r = await fetch("/api/run", { method: "POST", body: JSON.stringify({ cmd }) }); const d = await r.json(); if (!r.ok) setErr(d.error); else setRun(d); };
  const shown = useMemo(() => jobs.filter(j => j.status !== "skipped" && (j.score != null || demo)).filter(j => (j.score ?? 0) >= min && (!remote || j.remoteFromIndia) && (!visa || (j.visa && j.relocation)) && (!low || j.competition === "low") && (`${j.title} ${j.company} ${j.country ?? ""}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => priority(b) - priority(a)), [jobs, q, remote, visa, low, min, demo]);
  const cur = jobs.find(j => j.id === sel);
  return (<>
    <div className="row"><div className="grow"><h1>Jobs</h1><p className="sub" style={{ margin: 0 }}>{shown.length} matches, ranked by priority: fit, remote, low competition, freshness.{demo && " Showing demo data."}</p></div>
      <button disabled={run.running} onClick={() => start("scan")}>{run.running && run.cmd === "scan" ? "Scanning…" : "Scan sources"}</button>
      <button className="pri" disabled={run.running} onClick={() => start("rank")}>{run.running && run.cmd === "rank" ? "Ranking…" : "Rank new jobs"}</button></div>
    {err && <div className="msg">{err}</div>}{(run.running || run.log) && <div className="log">{run.log}</div>}
    <div className="row" style={{ marginTop: 18 }}>
      <input className="grow" placeholder="Search title, company, country" value={q} onChange={e => setQ(e.target.value)} />
      <button className={"chip " + (remote ? "on" : "")} onClick={() => setRemote(!remote)}>Remote from India</button>
      <button className={"chip " + (low ? "on" : "")} onClick={() => setLow(!low)}>Low competition</button>
      <button className={"chip " + (visa ? "on" : "")} onClick={() => setVisa(!visa)}>Visa + relocation</button>
      <select value={min} onChange={e => setMin(+e.target.value)}><option value={0}>Any score</option><option value={60}>60+</option><option value={75}>75+</option><option value={85}>85+</option></select></div>
    <div className="list">{shown.map(j => (<div key={j.id} className={"job " + (sel === j.id ? "sel" : "")} onClick={() => setSel(j.id)}>
      <div className={"score " + ((j.score ?? 0) >= 75 ? "" : (j.score ?? 0) >= 55 ? "mid" : "low")}>{j.score ?? "–"}</div>
      <div><div className="t">{j.title}</div><div className="m">{j.company} · {j.location || j.country || "—"}</div><div className="tags">{tagsOf(j).map(t => <span className="tag" key={t}>{t}</span>)}</div></div>
      <span className="tag n">{j.status}</span></div>))}
      {!shown.length && <div className="card m">No jobs yet. Fill in your Profile, then press “Scan sources” and “Rank new jobs”.</div>}</div>
    {cur && <JobDrawer job={cur} demo={demo} onClose={() => setSel(null)} onChange={load} />}</>);
}
