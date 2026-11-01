"use client"; import { useEffect, useState } from "react";
export default function Insights() {
  const [d, setD] = useState<any>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const load = () => fetch("/api/insights").then(r => r.json()).then(setD); useEffect(() => { load(); }, []);
  const gen = async () => { setBusy(true); setErr(""); const r = await fetch("/api/insights", { method: "POST" }); const j = await r.json(); setBusy(false); if (!r.ok) setErr(j.error); else load(); };
  const max = Math.max(1, ...(d?.counts ?? []).map((c: any) => c.count)); const ai = d?.ai;
  return (<><div className="row"><div className="grow"><h1>Insights</h1><p className="sub" style={{ margin: 0 }}>What the {d?.jobsAnalysed ?? "…"} best-matching listings ask for, and what to build.</p></div>
    <button className="pri" disabled={busy} onClick={gen}>{busy ? "Analysing…" : ai ? "Regenerate" : "Generate project ideas"}</button></div>
    {err && <div className="msg">{err}</div>}
    <div className="card" style={{ marginTop: 18 }}><h2>Most requested</h2><div className="bars">{(d?.counts ?? []).map((c: any) => <div className="bar" key={c.name}><span>{c.name}</span><div><i style={{ width: `${(c.count / max) * 100}%` }} /></div><span className="m">{c.count}</span></div>)}</div></div>
    {ai && <><div className="grid2"><div className="card"><h2>What employers look for</h2><ul className="plain">{ai.lookingFor?.map((x: string) => <li key={x}>{x}</li>)}</ul></div>
      <div className="card"><h2>Your gaps</h2><ul className="plain">{ai.gaps?.map((x: string) => <li key={x}>{x}</li>)}</ul><h2 style={{ marginTop: 14 }}>Already strong</h2><ul className="plain">{ai.strengths?.map((x: string) => <li key={x}>{x}</li>)}</ul></div></div>
      <h2 style={{ marginTop: 26 }}>Projects to build</h2><div className="grid2">{ai.projects?.map((p: any) => (<div className="card" key={p.title}><div className="t">{p.title}</div><p style={{ margin: "4px 0" }}>{p.pitch}</p>
        <div className="tags">{p.stack?.map((s: string) => <span className="tag n" key={s}>{s}</span>)}</div><p className="m"><b>Proves:</b> {p.proves}</p><p className="m"><b>Demand:</b> {p.demandedBy}</p>
        <ul className="plain m">{p.weekPlan?.map((w: string) => <li key={w}>{w}</li>)}</ul></div>))}</div></>}
    {!ai && <p className="m" style={{ marginTop: 18 }}>Skill counts above are free. Project ideas and gap analysis use Claude and need <code>ANTHROPIC_API_KEY</code>.</p>}</>);
}
