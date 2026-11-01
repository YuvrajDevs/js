"use client"; import { useEffect, useState } from "react";
export default function Profile() {
  const [y, setY] = useState(""); const [exists, setExists] = useState(true); const [msg, setMsg] = useState("");
  useEffect(() => { fetch("/api/profile").then(r => r.json()).then(d => { setY(d.yaml); setExists(d.exists); }); }, []);
  const save = async () => { const r = await fetch("/api/profile", { method: "PUT", body: JSON.stringify({ yaml: y }) }); const d = await r.json(); setMsg(r.ok ? "Saved." : d.error); if (r.ok) setExists(true); };
  return (<><h1>Profile</h1><p className="sub">Your single source of truth. Tailoring only reorders and rewords what’s here; it never invents. Also holds target roles, minimum pay and the companies to scan.</p>
    {!exists && <div className="msg">This is the example template. Edit it with your real details and save.</div>}
    <textarea className="yaml" value={y} onChange={e => setY(e.target.value)} spellCheck={false} />
    <div className="row" style={{ marginTop: 12 }}><button className="pri" onClick={save}>Save profile</button>{msg && <span className="m">{msg}</span>}</div></>);
}
