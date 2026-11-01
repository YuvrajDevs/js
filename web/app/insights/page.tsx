"use client"; import { useCallback, useEffect, useState } from "react";
const SCOPES: [string, string][] = [["all", "All matches"], ["top", "Score 75+"], ["remote", "Remote from India"], ["low", "Low competition"]];
export default function Insights() {
  const [d, setD] = useState<any>(null); const [scope, setScope] = useState("all"); const [group, setGroup] = useState("all"); const [open, setOpen] = useState<string | null>(null);
  const [pick, setPick] = useState<string[]>([]); const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [proj, setProj] = useState<any>(null);
  const [run, setRun] = useState<any>({ running: false, log: "" }); const [q, setQ] = useState("");
  const load = useCallback(() => fetch("/api/insights?scope=" + scope).then(r => r.json()).then(setD), [scope]); useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!run.running) return; const t = setInterval(async () => { const s = await (await fetch("/api/run")).json(); setRun(s); if (!s.running) load(); }, 1500); return () => clearInterval(t); }, [run.running, load]);
  const extract = async () => { setErr(""); const r = await fetch("/api/run", { method: "POST", body: JSON.stringify({ cmd: "extract" }) }); const j = await r.json(); r.ok ? setRun(j) : setErr(j.error); };
  const gen = async () => { setBusy("ai"); setErr(""); const r = await fetch("/api/insights", { method: "POST", body: JSON.stringify({ scope }) }); const j = await r.json(); setBusy(""); r.ok ? load() : setErr(j.error); };
  const build = async () => { setBusy("proj"); setErr(""); setProj(null); const quotes = d.keywords.filter((k: any) => pick.includes(k.term)).flatMap((k: any) => k.quotes);
    const r = await fetch("/api/project", { method: "POST", body: JSON.stringify({ terms: pick, quotes }) }); const j = await r.json(); setBusy(""); r.ok ? setProj(j.project) : setErr(j.error); };
  const toggle = (t: string) => setPick(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const kws = (group === "all" ? d?.keywords ?? [] : (d?.grouped ?? []).filter((k: any) => k.group === group)).filter((k: any) => k.term.includes(q.toLowerCase())); const max = Math.max(1, ...kws.map((k: any) => k.count)); const ai = d?.ai;
  const groups = Object.keys(d?.groups ?? {}).filter(g => (d?.grouped ?? []).some((k: any) => k.group === g));
  return (<>
    <div className="row"><div className="grow"><h1>Insights</h1><p className="sub" style={{ margin: 0 }}>{d ? `${d.jobsAnalysed} listings · ${d.mode === "extracted" ? `${d.withReq} analysed in depth` : "quick keyword mining"}` : "…"}</p></div>
      <button disabled={run.running} onClick={extract}>{run.running ? "Analysing listings…" : "Deep-analyse listings"}</button>
      <button className="pri" disabled={busy === "ai"} onClick={gen}>{busy === "ai" ? "Thinking…" : ai ? "Regenerate ideas" : "Gap analysis + project ideas"}</button></div>
    {err && <div className="msg">{err}</div>}{run.running && <div className="log">{run.log}</div>}
    {d?.mode === "mined" && <p className="m" style={{ marginTop: 10 }}>Showing raw word and phrase frequency. “Deep-analyse listings” uses Claude to pull out must-haves, tools, AI concepts, responsibilities and traits per listing, so the keywords below become clean and grouped.</p>}
    <div className="row" style={{ marginTop: 16 }}>{SCOPES.map(([k, l]) => <button key={k} className={"chip " + (scope === k ? "on" : "")} onClick={() => setScope(k)}>{l}</button>)}<span className="grow" /><input placeholder="Filter keywords" value={q} onChange={e => setQ(e.target.value)} /></div>
    {groups.length > 1 && <div className="row" style={{ marginTop: 10 }}><button className={"chip " + (group === "all" ? "on" : "")} onClick={() => setGroup("all")}>All</button>{groups.map(g => <button key={g} className={"chip " + (group === g ? "on" : "")} onClick={() => setGroup(g)}>{d.groups[g]}</button>)}</div>}
    <div className="card" style={{ marginTop: 14 }}><div className="row"><h2 className="grow" style={{ margin: 0 }}>Keywords employers use</h2><span className="m">Click to see quotes and listings · tick to build a project</span></div>
      <div style={{ marginTop: 10 }}>{kws.slice(0, 60).map((k: any) => (<div key={k.group + k.term}>
        <div className="kw"><input type="checkbox" checked={pick.includes(k.term)} onChange={() => toggle(k.term)} /><button className="link" onClick={() => setOpen(open === k.group + k.term ? null : k.group + k.term)}>{k.term}</button>
          <div><i style={{ width: `${(k.count / max) * 100}%` }} /></div><span className="m">{k.count} · {k.pct}%</span></div>
        {open === k.group + k.term && <div className="kwd">{k.quotes.map((x: string, i: number) => <p key={i}>“{x}”</p>)}<div className="tags">{k.jobs.map((j: any) => <a className="tag n" key={j.id} href={j.url} target="_blank" rel="noreferrer">{j.company}: {j.title}</a>)}</div></div>}</div>))}
        {!kws.length && <p className="m">Nothing in this view yet. Scan and rank jobs first.</p>}</div></div>
    {pick.length > 0 && <div className="pickbar"><span>{pick.length} selected: {pick.slice(0, 6).join(", ")}{pick.length > 6 ? "…" : ""}</span><span className="grow" /><button onClick={() => setPick([])}>Clear</button><button className="pri" disabled={busy === "proj"} onClick={build}>{busy === "proj" ? "Designing…" : "Build a project from these"}</button></div>}
    {proj && <div className="card" style={{ marginTop: 16 }}><h2 style={{ fontSize: 20 }}>{proj.title}</h2><p>{proj.pitch}</p><p className="m"><b>For:</b> {proj.whoItsFor}</p>
      <div className="grid2"><div><h2>Features</h2><ul className="plain">{proj.features?.map((x: string) => <li key={x}>{x}</li>)}</ul><h2>Architecture</h2><ul className="plain">{proj.architecture?.map((x: string) => <li key={x}>{x}</li>)}</ul><div className="tags">{proj.stack?.map((s: string) => <span className="tag n" key={s}>{s}</span>)}</div></div>
        <div><h2>Keyword coverage</h2><ul className="plain">{proj.keywordMap?.map((x: any) => <li key={x.keyword}><b>{x.keyword}</b>: {x.howCovered}</li>)}</ul><h2>Plan</h2><ul className="plain">{proj.milestones?.map((x: string) => <li key={x}>{x}</li>)}</ul></div></div>
      <h2>Measure it</h2><p>{proj.evals}</p><h2>60-second demo</h2><p>{proj.demo}</p><h2>Resume bullets</h2><ul className="plain">{proj.resumeBullets?.map((x: string) => <li key={x}>{x}</li>)}</ul>
      <div className="row"><button onClick={() => navigator.clipboard.writeText(JSON.stringify(proj, null, 2))}>Copy spec (paste into Claude Code to start building)</button></div></div>}
    {ai && <><div className="grid2"><div className="card"><h2>What employers look for</h2><ul className="plain">{ai.lookingFor?.map((x: string) => <li key={x}>{x}</li>)}</ul></div>
      <div className="card"><h2>Your gaps</h2><ul className="plain">{ai.gaps?.map((x: string) => <li key={x}>{x}</li>)}</ul><h2 style={{ marginTop: 14 }}>Already strong</h2><ul className="plain">{ai.strengths?.map((x: string) => <li key={x}>{x}</li>)}</ul></div></div>
      <h2 style={{ marginTop: 26 }}>Suggested projects</h2><div className="grid2">{ai.projects?.map((p: any) => (<div className="card" key={p.title}><div className="t">{p.title}</div><p style={{ margin: "4px 0" }}>{p.pitch}</p>
        <div className="tags">{p.stack?.map((s: string) => <span className="tag n" key={s}>{s}</span>)}</div>{p.keywords && <div className="tags">{p.keywords.map((s: string) => <span className="tag" key={s}>{s}</span>)}</div>}<p className="m"><b>Proves:</b> {p.proves}</p><p className="m"><b>Demand:</b> {p.demandedBy}</p>
        <ul className="plain m">{p.weekPlan?.map((w: string) => <li key={w}>{w}</li>)}</ul><button onClick={() => setPick(p.keywords ?? [])}>Use these keywords</button></div>))}</div></>}
  </>);
}
