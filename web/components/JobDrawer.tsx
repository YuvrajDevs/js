"use client"; import { useEffect, useState } from "react"; import type { Job } from "@/lib/types"; import { md } from "@/lib/md";
export const tagsOf = (j: Job) => [j.remoteFromIndia && "Remote-IN", j.competition === "low" && "Low competition", j.visa && "Visa", j.relocation && "Relocation", j.country && j.country, j.salaryInrMonthly && `~₹${Math.round(j.salaryInrMonthly / 1000)}k/mo`].filter(Boolean) as string[];
const STATUSES = ["ranked", "tailored", "applied", "interview", "offer", "rejected", "skipped"];
export default function JobDrawer({ job, onClose, onChange, demo }: { job: Job; onClose: () => void; onChange: () => void; demo: boolean }) {
  const [resume, setResume] = useState<string | null>(null); const [busy, setBusy] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { setResume(null); setErr(""); fetch("/api/resume?id=" + encodeURIComponent(job.id)).then(r => r.json()).then(d => setResume(d.resume)); }, [job.id]);
  const act = async (action: string, extra: object = {}) => {
    setBusy(action); setErr("");
    const r = await fetch("/api/job", { method: "POST", body: JSON.stringify({ id: job.id, action, ...extra }) }); const d = await r.json(); setBusy("");
    if (!d.ok) return setErr(d.error); if (d.resume) setResume(d.resume); onChange();
  };
  const [cv, cover] = (resume ?? "").split("---COVER---");
  return (<aside className="drawer">
    <div className="row noprint"><button onClick={onClose}>Close</button><span className="grow" /><a className="btn" href={job.url} target="_blank" rel="noreferrer">Open posting ↗</a></div>
    <h1 style={{ marginTop: 16 }}>{job.title}</h1><div className="m">{job.company} · {job.location || job.country || "—"}</div>
    <div className="tags">{tagsOf(job).map(t => <span className="tag" key={t}>{t}</span>)}</div>
    {job.reason && <p className="card" style={{ marginTop: 14 }}><b>Why it fits ({job.score}): </b>{job.reason}</p>}
    <div className="row noprint" style={{ marginTop: 14 }}>
      <button className="pri" disabled={!!busy || demo} onClick={() => act("tailor")}>{busy === "tailor" ? "Tailoring…" : resume ? "Re-tailor resume" : "Tailor resume"}</button>
      <button disabled={!!busy || demo} onClick={() => act("apply")} title="Opens a browser, prefills, stops before submit">Prefill application</button>
      <select value={job.status} disabled={demo} onChange={e => act("status", { status: e.target.value })}>{[job.status, ...STATUSES].filter((s, i, a) => a.indexOf(s) === i).map(s => <option key={s}>{s}</option>)}</select>
    </div>
    {err && <div className="msg">{err}</div>}
    {demo && <div className="msg">Demo data: run a scan to enable actions.</div>}
    {resume && <><div className="row noprint" style={{ marginTop: 18 }}><h2 className="grow" style={{ margin: 0 }}>Tailored resume</h2><button onClick={() => navigator.clipboard.writeText(resume)}>Copy</button><button onClick={() => window.print()}>Save as PDF</button></div>
      <div className="resume" dangerouslySetInnerHTML={{ __html: md(cv) }} />
      {cover && <div className="card noprint" style={{ marginTop: 12 }}><h2>Cover note</h2><div dangerouslySetInnerHTML={{ __html: md(cover) }} /></div>}</>}
    <h2 className="noprint" style={{ marginTop: 22 }}>Posting</h2><div className="desc noprint">{job.description}</div>
  </aside>);
}
