"use client"; import { useEffect, useState } from "react"; import type { Job } from "@/lib/types"; import JobDrawer from "@/components/JobDrawer";
const COLS = ["tailored", "applied", "interview", "offer", "rejected"];
export default function Tracker() {
  const [jobs, setJobs] = useState<Job[]>([]); const [demo, setDemo] = useState(false); const [sel, setSel] = useState<string | null>(null);
  const load = () => fetch("/api/jobs").then(r => r.json()).then(d => { setJobs(d.jobs); setDemo(d.demo); }); useEffect(() => { load(); }, []);
  const cur = jobs.find(j => j.id === sel);
  return (<><h1>Tracker</h1><p className="sub">Everything you’ve tailored or applied to. Change status inside a job.</p>
    <div className="cols">{COLS.map(c => (<div className="col" key={c}><h3>{c} · {jobs.filter(j => j.status === c).length}</h3>
      {jobs.filter(j => j.status === c).map(j => <div className="card" key={j.id} onClick={() => setSel(j.id)}><b>{j.title}</b><div className="m">{j.company}</div></div>)}</div>))}</div>
    {cur && <JobDrawer job={cur} demo={demo} onClose={() => setSel(null)} onChange={load} />}</>);
}
