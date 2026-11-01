"use client"; import { useEffect, useState } from "react";
const label: any = { low: "Low competition", medium: "Medium", high: "High" };
export default function Sources() {
  const [s, setS] = useState<any[]>([]); const [f, setF] = useState({ name: "", url: "", kind: "rss", competition: "low", remote: true }); const [err, setErr] = useState("");
  const load = () => fetch("/api/sources").then(r => r.json()).then(d => setS(d.sources)); useEffect(() => { load(); }, []);
  const call = async (method: string, body: object) => { const r = await fetch("/api/sources", { method, body: JSON.stringify(body) }); const d = await r.json(); if (!r.ok) setErr(d.error); else { setErr(""); load(); } return r.ok; };
  const order = ["low", "medium", "high"];
  return (<><h1>Sources</h1><p className="sub">Everything the scan reads. Low-competition sources get a priority boost, so jobs there rise to the top.</p>
    <div className="list" style={{ marginTop: 0 }}>{[...s].sort((a, b) => order.indexOf(a.competition) - order.indexOf(b.competition)).map(x => (
      <div className="job" style={{ gridTemplateColumns: "1fr auto auto", cursor: "default", opacity: x.enabled ? 1 : .5 }} key={x.id}>
        <div><div className="t">{x.name} {x.custom && <span className="tag n">custom</span>}</div>
          <div className="m">{x.stats ? (x.stats.ok ? `${x.stats.count} fetched · ${x.kept} kept` : <span style={{ color: "var(--bad)" }}>Failed: {x.stats.error}</span>) : "Not scanned yet"}{x.remote ? " · remote-focused" : ""}{x.note ? ` · ${x.note}` : ""}</div></div>
        <span className={"tag " + (x.competition === "low" ? "" : "n")}>{label[x.competition]}</span>
        <div className="row"><button onClick={() => call("PATCH", { id: x.id, enabled: !x.enabled })}>{x.enabled ? "On" : "Off"}</button>{x.custom && <button onClick={() => call("DELETE", { id: x.id })}>Remove</button>}</div></div>))}</div>
    <div className="card" style={{ marginTop: 20 }}><h2>Add your own source</h2><p className="m" style={{ marginTop: 0 }}>An RSS/Atom feed, or any page listing jobs (a company’s careers page, a niche board, a community post).</p>
      <div className="row"><input placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><input className="grow" placeholder="https://…" value={f.url} onChange={e => setF({ ...f, url: e.target.value })} />
        <select value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}><option value="rss">RSS / Atom</option><option value="page">Web page</option></select>
        <select value={f.competition} onChange={e => setF({ ...f, competition: e.target.value })}><option value="low">Low competition</option><option value="medium">Medium</option><option value="high">High</option></select>
        <button className="pri" onClick={async () => { if (await call("POST", f)) setF({ ...f, name: "", url: "" }); }}>Add</button></div>
      {err && <div className="msg">{err}</div>}</div></>);
}
