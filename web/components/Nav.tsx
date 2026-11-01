"use client"; import Link from "next/link"; import { usePathname } from "next/navigation";
const items = [["/", "Jobs"], ["/tracker", "Tracker"], ["/insights", "Insights"], ["/profile", "Profile"]];
export default function Nav() {
  const p = usePathname();
  return (<nav className="nav"><div className="brand"><span className="dot" />jobseek</div>
    {items.map(([h, l]) => <Link key={h} href={h} className={p === h ? "on" : ""}>{l}</Link>)}</nav>);
}
